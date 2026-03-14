const pool = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');

async function createAdoption(req, res, next) {
    const conn = await pool.getConnection();
    try {
        const { catid, cat_name_given, pickup_method } = req.body;
        if (!catid || !pickup_method) {
            return fail(res, 'catid and pickup_method are required', 400);
        }

        if (!['pickup', 'delivery'].includes(pickup_method)) {
            return fail(res, 'pickup_method must be pickup or delivery', 400);
        }

        await conn.beginTransaction();

        const [cats] = await conn.query('SELECT catid, shelter_name, is_available FROM Cat WHERE catid = ? FOR UPDATE', [catid]);
        if (!cats.length) {
            await conn.rollback();
            return fail(res, 'Cat not found', 404);
        }

        const cat = cats[0];
        if (!cat.is_available) {
            await conn.rollback();
            return fail(res, 'This cat is no longer available for adoption.', 409);
        }

        const finalName = String(cat_name_given || '').trim() || cat.shelter_name;
        const [result] = await conn.query(
            'INSERT INTO Adoption (userid, catid, cat_name_given, pickup_method, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.userid, catid, finalName, pickup_method, 'Pending']
        );

        // Triggers also enforce availability, this update keeps app state instantly consistent.
        await conn.query('UPDATE Cat SET is_available = FALSE, name = ? WHERE catid = ?', [finalName, catid]);

        await conn.commit();

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
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
        }
        next(err);
    } finally {
        conn.release();
    }
}

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

        return ok(res, rows);
    } catch (err) {
        next(err);
    }
}

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

        return ok(res, rows);
    } catch (err) {
        next(err);
    }
}

async function updateAdoptionStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['Pending', 'Approved', 'Completed'];
        if (!allowed.includes(status)) {
            return fail(res, 'Invalid status', 400);
        }

        const [result] = await pool.query('UPDATE Adoption SET status = ? WHERE adoptionid = ?', [status, id]);
        if (!result.affectedRows) {
            return fail(res, 'Adoption not found', 404);
        }

        const [rows] = await pool.query('SELECT * FROM Adoption WHERE adoptionid = ?', [id]);
        return ok(res, rows[0]);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createAdoption,
    getMyAdoptions,
    getAllAdoptions,
    updateAdoptionStatus
};
