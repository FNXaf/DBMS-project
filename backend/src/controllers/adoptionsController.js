// Controller handling adoption-related actions.
// Responsible for creating adoption requests, listing a user's
// adoptions, listing all adoptions (admin) and updating status.
// These functions use SQL transactions when needed to keep
// data consistent (e.g., reserving a cat during an adoption).
const pool = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');

// Create an adoption request. Uses a DB transaction and
// `SELECT ... FOR UPDATE` to lock the cat row while processing
// so two people can't adopt the same cat at the same time.
// POST /adoptions — create a new adoption request
// Step-by-step explanation (for teaching):
// 1) Validate request body: require `catid` and `pickup_method`.
// 2) Normalize/validate `pickup_method` to allowed values.
// 3) Start a database transaction to make the following steps atomic.
// 4) SELECT the Cat row `FOR UPDATE` — this acquires a row lock so
//    two concurrent adopters can't both reserve the same cat.
// 5) If the cat is missing or already unavailable, rollback and return
//    an appropriate HTTP error so the client knows why it failed.
// 6) Insert a new Adoption row (status `Pending`) referencing the user
//    and the chosen cat. Use the final chosen name for the cat.
// 7) Immediately update the Cat row to set `is_available = FALSE` and
//    set the cat name. A DB trigger may also enforce availability; the
//    update here keeps the API state consistent for subsequent reads.
// 8) Commit the transaction to persist both the Adoption insert and the
//    Cat update together. If any step failed, rollback is used.
// 9) Select the created adoption joined with cat info and return it.
async function createAdoption(req, res, next) {
    // Acquire a connection so we can run a transaction and use FOR UPDATE
    const conn = await pool.getConnection();
    try {
        // 1) Basic validation of required fields from the client
        const { catid, cat_name_given, pickup_method } = req.body;
        if (!catid || !pickup_method) {
            return fail(res, 'catid and pickup_method are required', 400);
        }

        // 2) Ensure pickup method is one of our allowed choices
        if (!['pickup', 'delivery'].includes(pickup_method)) {
            return fail(res, 'pickup_method must be pickup or delivery', 400);
        }

        // 3) Begin transaction: all DB modifications below must succeed together
        await conn.beginTransaction();

        // 4) Lock the Cat row so the availability check and subsequent update
        //    happen without race conditions. `FOR UPDATE` ensures other
        //    connections wait until this transaction completes.
        const [cats] = await conn.query('SELECT catid, shelter_name, is_available FROM Cat WHERE catid = ? FOR UPDATE', [catid]);
        if (!cats.length) {
            // Cat not found — rollback and inform the client
            await conn.rollback();
            return fail(res, 'Cat not found', 404);
        }

        const cat = cats[0];
        // 5) Check availability inside the same transaction
        if (!cat.is_available) {
            await conn.rollback();
            return fail(res, 'This cat is no longer available for adoption.', 409);
        }

        // Decide final displayed name for the cat after adoption
        const finalName = String(cat_name_given || '').trim() || cat.shelter_name;

        // 6) Insert adoption record referencing the current authenticated user
        const [result] = await conn.query(
            'INSERT INTO Adoption (userid, catid, cat_name_given, pickup_method, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.userid, catid, finalName, pickup_method, 'Pending']
        );

        // 7) Mark the cat as no longer available and set its name in the same
        //    transaction so readers see a consistent state immediately.
        //    Note: the DB may also have a trigger that enforces this,
        //    but doing it here keeps API responses intuitive.
        await conn.query('UPDATE Cat SET is_available = FALSE, name = ? WHERE catid = ?', [finalName, catid]);

        // 8) Commit the transaction — both the Adoption and Cat update are saved
        await conn.commit();

        // 9) Read back the created adoption with some cat fields to return to client
        const [rows] = await conn.query(
            `SELECT a.adoptionid, a.userid, a.catid, a.cat_name_given, a.pickup_method, a.status, a.adoption_date,
                    c.shelter_name, c.breed
             FROM Adoption a
             JOIN Cat c ON c.catid = a.catid
             WHERE a.adoptionid = ?`,
            [result.insertId]
        );

        return ok(res, rows[0], 201);
    } catch (err) {
        // Handle duplicate adoption attempt gracefully — this maps to a
        // DB unique constraint for user+cat. Roll back and return 409.
        if (err && err.code === 'ER_DUP_ENTRY') {
            try { await conn.rollback(); } catch (_) {}
            return fail(res, 'Duplicate adoption request for this user and cat is not allowed', 409);
        }
        // For any other error ensure we rollback the transaction then pass the
        // error to the global error handler so it can be logged/returned properly.
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
        }
        next(err);
    } finally {
        // Always release the connection back to the pool
        conn.release();
    }
}

// Return adoptions belonging to the logged-in user.
async function getMyAdoptions(req, res, next) {
    try {
        const [rows] = await pool.query(
            `SELECT a.adoptionid, a.userid, a.catid, a.cat_name_given, a.pickup_method, a.status, a.adoption_date,
                    c.shelter_name, c.breed, c.gender, c.fur_color, c.dob,
                    TIMESTAMPDIFF(MONTH, c.dob, CURDATE()) AS age_months,
                    c.cattitude, c.health_status, c.photo_url, c.photo_position
             FROM Adoption a
             JOIN Cat c ON c.catid = a.catid
             WHERE a.userid = ?
             ORDER BY a.adoption_date DESC`,
            [req.user.userid]
        );

        // Returns a list of adoptions for the logged-in user.
        // This is a read-only operation and does not require a transaction.
        return ok(res, rows);
    } catch (err) {
        next(err);
    }
}

// Admin: return all adoptions with adopter and cat info.
async function getAllAdoptions(req, res, next) {
    try {
        const [rows] = await pool.query(
            `SELECT a.adoptionid, a.userid, a.catid, a.cat_name_given, a.pickup_method, a.status, a.adoption_date,
                    u.full_name AS adopter_name, u.email,
                    c.shelter_name, c.breed
             FROM Adoption a
             JOIN \`User\` u ON u.userid = a.userid
             JOIN Cat c ON c.catid = a.catid
             ORDER BY a.adoption_date DESC`
        );

        // Admin-facing read: return all adoptions joined with adopter + cat info.
        return ok(res, rows);
    } catch (err) {
        next(err);
    }
}

// Update adoption status (Pending, Approved, Rejected, Completed).
// Uses a transaction and may change cat availability when rejected.
// PUT /adoptions/:id/status — update adoption status
// Explanation / steps:
// - Validate the supplied status value.
// - Start a transaction and lock the Adoption row with FOR UPDATE so status
//   transitions are serialized and consistent.
// - Update the Adoption status.
// - If the adoption is `Rejected`, release the cat: set `is_available = TRUE`
//   and clear the temporary name. This keeps the Cat table consistent.
// - Commit the transaction and return the updated adoption record.
async function updateAdoptionStatus(req, res, next) {
    const conn = await pool.getConnection();
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['Pending', 'Approved', 'Rejected', 'Completed'];
        if (!allowed.includes(status)) {
            return fail(res, 'Invalid status', 400);
        }

        // Begin transaction for a safe status transition
        await conn.beginTransaction();

        // Lock the adoption row so other updates wait until this finishes
        const [found] = await conn.query('SELECT adoptionid, catid, status FROM Adoption WHERE adoptionid = ? FOR UPDATE', [id]);
        if (!found.length) {
            await conn.rollback();
            return fail(res, 'Adoption not found', 404);
        }

        const adoption = found[0];

        // Update the status; check affectedRows to ensure the update succeeded
        const [result] = await conn.query('UPDATE Adoption SET status = ? WHERE adoptionid = ?', [status, id]);
        if (!result.affectedRows) {
            await conn.rollback();
            return fail(res, 'Adoption not found', 404);
        }

        // If rejected, release the cat back into availability and clear the name
        if (status === 'Rejected') {
            await conn.query('UPDATE Cat SET is_available = TRUE, name = NULL WHERE catid = ?', [adoption.catid]);
        }

        // Commit the transaction to persist the adoption status change and
        // any related Cat update.
        await conn.commit();

        // Return the updated adoption record to the client
        const [rows] = await conn.query('SELECT * FROM Adoption WHERE adoptionid = ?', [id]);
        return ok(res, rows[0]);
    } catch (err) {
        // On any error ensure rollback and forward the error
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
        }
        next(err);
    } finally {
        conn.release();
    }
}

module.exports = {
    createAdoption,
    getMyAdoptions,
    getAllAdoptions,
    updateAdoptionStatus
};
