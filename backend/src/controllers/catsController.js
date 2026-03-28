// Controller for Cat-related API endpoints.
// This file builds SQL queries, validates input, and
// returns API responses for listing, creating,
// updating and deleting cats.
//
// Teaching / explanation notes (line-by-line):
// - This controller exposes CRUD operations for the `Cat` table.
// - Each exported function maps to an HTTP route (GET/POST/PUT/DELETE)
//   and follows a clear pattern: validate input -> run DB query ->
//   return well-formed API response or error.
// - We prefer parameterized queries (using `?`) to avoid SQL injection.
// - Use `pool.query(...)` for simple read/write operations and the
//   helpers `toApiCat`, `parseCsvList`, etc., to keep route handlers
//   focused on orchestration and validation rather than string parsing.
const path = require('path');
const pool = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');
const { isValidPastDate } = require('../utils/validators');

const SORT_MAP = {
    age_asc: 'age_months ASC',
    age_desc: 'age_months DESC',
    date_desc: 'intake_date DESC',
    date_asc: 'intake_date ASC',
    gender_asc: 'gender ASC',
    gender_desc: 'gender DESC',
    breed_asc: 'breed ASC',
    breed_desc: 'breed DESC',
    health_vacc: "(health_status = 'Vaccinated') DESC, health_status ASC",
    status_avail: 'is_available DESC, shelter_name ASC'
};

// Convert DB row to API-friendly cat object.
// Convert a DB row into the shape the frontend expects.
// - Ensures `photo_url` is absolute (adds host/protocol when needed).
// - Provides a default `photo_position` when the DB value is missing.
function toApiCat(cat, req) {
    const raw = cat.photo_url || '';
    const isAbsolute = /^https?:\/\//i.test(raw);
    const photo_url = raw
        ? isAbsolute
            ? raw
            : `${req.protocol}://${req.get('host')}${raw.startsWith('/') ? '' : '/'}${raw}`
        : '';

    return {
        ...cat,
        photo_url,
        photo_position: cat.photo_position || 'center'
    };
}

// Parse a comma-separated query value into an array.
function parseCsvList(value) {
    return String(value || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
}

// Normalize boolean-like values from requests.
// Normalize boolean-like values coming from query params or JSON bodies.
// - Accepts `true`/`false`, `1`/`0`, string versions, or actual booleans.
// - Returns `fallback` when the input is empty or cannot be parsed.
function parseBooleanValue(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase().trim();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
    return fallback;
}

// Check dob < intake_date to match DB CHECK constraint.
// Validate that a cat's date-of-birth (`dob`) occurs before `intake_date`.
// This mirrors the DB CHECK constraint so the API can return a clearer
// validation error before the DB rejects the write.
function isDobBeforeIntake(dob, intakeDate) {
    if (!dob || !intakeDate) return false;
    const dobDate = new Date(dob);
    const intake = new Date(intakeDate);
    if (Number.isNaN(dobDate.getTime()) || Number.isNaN(intake.getTime())) return false;
    return dobDate.getTime() < intake.getTime();
}

// GET /cats
// Build a SELECT using optional filtering query parameters supplied by
// the client. The steps are:
// 1) Read allowed filter params from `req.query`.
// 2) For each provided filter, append a `WHERE` clause and parameter.
// 3) Choose an `ORDER BY` clause based on `sort` (mapped via SORT_MAP).
// 4) Execute a parameterized query and map DB rows to API objects.
// This keeps filtering logic centralized on the server, avoids returning
// extra data to the client, and prevents SQL injection by using params.
async function getCats(req, res, next) {
    try {
        const {
            gender,
            fur_color,
            breed,
            age_min,
            age_max,
            cattitude,
            health_status,
            sort
        } = req.query;

        const where = [];
        const params = [];

        // Filter by gender when provided
        if (gender) {
            where.push('gender = ?');
            params.push(gender);
        }

        // Support comma-separated lists for multi-value filters (e.g., ?fur_color=black,white)
        const furColors = parseCsvList(fur_color);
        if (furColors.length) {
            where.push(`fur_color IN (${furColors.map(() => '?').join(',')})`);
            params.push(...furColors);
        }

        // Allow filtering by multiple breeds
        const breeds = parseCsvList(breed);
        if (breeds.length) {
            where.push(`breed IN (${breeds.map(() => '?').join(',')})`);
            params.push(...breeds);
        }

        // Allow filtering by cattitude categories
        const catts = parseCsvList(cattitude);
        if (catts.length) {
            where.push(`cattitude IN (${catts.map(() => '?').join(',')})`);
            params.push(...catts);
        }

        // Exact-match health status filter
        if (health_status) {
            where.push('health_status = ?');
            params.push(health_status);
        }

        // Translate age range (in months) into SQL using TIMESTAMPDIFF
        if (age_min !== undefined && age_min !== '') {
            where.push('TIMESTAMPDIFF(MONTH, dob, CURDATE()) >= ?');
            params.push(Number(age_min));
        }

        if (age_max !== undefined && age_max !== '') {
            where.push('TIMESTAMPDIFF(MONTH, dob, CURDATE()) <= ?');
            params.push(Number(age_max));
        }

        // Build final WHERE and ORDER BY pieces
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const orderBy = SORT_MAP[sort] || 'catid ASC';

        const [rows] = await pool.query(
            `SELECT catid, shelter_name, name, breed, fur_color, dob,
                    TIMESTAMPDIFF(MONTH, dob, CURDATE()) AS age_months,
                    gender, intake_date, health_status, cattitude, photo_url, photo_position, is_available
             FROM Cat
             ${whereSql}
             ORDER BY ${orderBy}`,
            params
        );

        // Convert each DB row into API-friendly form before returning
        return ok(res, rows.map((cat) => toApiCat(cat, req)));
    } catch (err) {
        next(err);
    }
}

// GET /cats/:id — fetch a single cat by primary key
// - Uses a parameterized query to avoid SQL injection.
// - Returns 404 when the cat does not exist.
async function getCatById(req, res, next) {
    try {
        const { catid } = req.params;
        const [rows] = await pool.query(
            `SELECT catid, shelter_name, name, breed, fur_color, dob,
                    TIMESTAMPDIFF(MONTH, dob, CURDATE()) AS age_months,
                    gender, intake_date, health_status, cattitude, photo_url, photo_position, is_available
             FROM Cat WHERE catid = ?`,
            [catid]
        );

        if (!rows.length) {
            // No row found — let the client know
            return fail(res, 'Cat not found', 404);
        }

        // Map DB row to API shape and return
        return ok(res, toApiCat(rows[0], req));
    } catch (err) {
        next(err);
    }
}

// Map frontend health labels to DB values.
// Convert frontend-friendly health labels into DB values.
// Example: frontend sends "Needs Care" but the DB stores "Under Treatment".
function mapHealthStatus(value) {
    if (value === 'Needs Care') return 'Under Treatment';
    return value;
}

// POST /cats — create a new Cat record
// Steps:
// 1) Validate required fields: shelter_name, breed, dob, gender, intake_date.
// 2) Validate `dob` is a past date and is earlier than `intake_date`.
// 3) Enforce `shelter_name` uniqueness at the application level to
//    give a friendly 409 response instead of a DB error.
// 4) Handle uploaded photo or external photo URL.
// 5) Insert the record and return the newly created cat via `getCatById`.
async function createCat(req, res, next) {
    try {
        const body = req.body;
        const shelter_name = String(body.shelter_name || '').trim();
        const breed = String(body.breed || '').trim();
        const fur_color = String(body.fur_color || '').trim() || null;
        const dob = body.dob;
        const gender = body.gender;
        const intake_date = body.intake_date;
        const health_status = mapHealthStatus(body.health_status || 'Healthy');
        const cattitude = String(body.cattitude || '').trim() || null;
        const photo_position = ['center', 'top', 'bottom'].includes(body.photo_position) ? body.photo_position : 'center';

        // Required field validation with helpful error message
        if (!shelter_name || !breed || !dob || !gender || !intake_date) {
            return fail(res, 'shelter_name, breed, dob, gender, intake_date are required', 400);
        }

        // Ensure dob is a valid date in the past (not today/future)
        if (!isValidPastDate(dob)) {
            return fail(res, 'dob must be a valid date in the past', 400);
        }

        // Mirrors DB CHECK constraint (dob < intake_date) for clearer API error messages.
        // Mirror DB CHECK constraint to give clearer API errors early
        if (!isDobBeforeIntake(dob, intake_date)) {
            return fail(res, 'dob must be earlier than intake_date', 400);
        }

        // Check for duplicate shelter_name to provide a 409 conflict
        const [dup] = await pool.query('SELECT catid FROM Cat WHERE shelter_name = ?', [shelter_name]);
        if (dup.length) {
            return fail(res, 'shelter_name already exists', 409);
        }

        // Support file uploads (handled by multer in routes) or external URLs
        let photo_url = '';
        if (req.file) {
            photo_url = `/uploads/cats/${req.file.filename}`;
        } else if (body.photo_url && /^https?:\/\//i.test(body.photo_url)) {
            photo_url = body.photo_url;
        }

        // Insert the new cat. We set `name` to NULL initially and `is_available` to TRUE.
        const [result] = await pool.query(
            `INSERT INTO Cat
             (shelter_name, name, breed, fur_color, dob, gender, intake_date, health_status, cattitude, photo_url, photo_position, is_available)
             VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [shelter_name, breed, fur_color, dob, gender, intake_date, health_status, cattitude, photo_url, photo_position]
        );

        // After inserting, reuse our existing getCatById logic to return the created record
        req.params.catid = String(result.insertId);
        return getCatById(req, res, next);
    } catch (err) {
        next(err);
    }
}

// PUT /cats/:id — update an existing Cat record
// Steps:
// 1) Load the current row to compare and validate changes.
// 2) Validate required fields and business rules (dob < intake_date).
// 3) Enforce unique `shelter_name` excluding the current row.
// 4) Handle photo updates similarly to createCat.
// 5) Perform the UPDATE and return the refreshed record.
async function updateCat(req, res, next) {
    try {
        const { catid } = req.params;
        const body = req.body;
        // 1) Fetch existing cat to validate and merge updates
        const [rows] = await pool.query('SELECT * FROM Cat WHERE catid = ?', [catid]);
        if (!rows.length) {
            return fail(res, 'Cat not found', 404);
        }

        const current = rows[0];
        const shelter_name = body.shelter_name !== undefined ? String(body.shelter_name).trim() : current.shelter_name;

        // shelter_name is required — ensure the merged value is non-empty
        if (!shelter_name) {
            return fail(res, 'shelter_name is required', 400);
        }

        if (body.dob && !isValidPastDate(body.dob)) {
            return fail(res, 'dob must be a valid date in the past', 400);
        }

        // Validate the dob < intake_date constraint for the merged values
        const nextDob = body.dob || current.dob;
        const nextIntakeDate = body.intake_date || current.intake_date;
        if (!isDobBeforeIntake(nextDob, nextIntakeDate)) {
            return fail(res, 'dob must be earlier than intake_date', 400);
        }

        // Check for another cat using the same shelter_name
        const [dup] = await pool.query('SELECT catid FROM Cat WHERE shelter_name = ? AND catid <> ?', [shelter_name, catid]);
        if (dup.length) {
            return fail(res, 'shelter_name already exists', 409);
        }

        // Decide the next photo_url from upload, external URL, or keep current
        let photo_url = current.photo_url;
        if (req.file) {
            photo_url = `/uploads/cats/${req.file.filename}`;
        } else if (body.photo_url && /^https?:\/\//i.test(body.photo_url)) {
            photo_url = body.photo_url;
        }

        const nextPhotoPosition = ['center', 'top', 'bottom'].includes(body.photo_position)
            ? body.photo_position
            : current.photo_position || 'center';

        // Perform the update with merged values and return the fresh record
        await pool.query(
            `UPDATE Cat SET
                shelter_name = ?,
                breed = ?,
                fur_color = ?,
                dob = ?,
                gender = ?,
                intake_date = ?,
                health_status = ?,
                cattitude = ?,
                photo_url = ?,
                photo_position = ?,
                is_available = ?
             WHERE catid = ?`,
            [
                shelter_name,
                body.breed !== undefined ? String(body.breed).trim() : current.breed,
                body.fur_color !== undefined ? String(body.fur_color).trim() : current.fur_color,
                body.dob || current.dob,
                body.gender || current.gender,
                body.intake_date || current.intake_date,
                mapHealthStatus(body.health_status) || current.health_status,
                body.cattitude !== undefined ? String(body.cattitude).trim() : current.cattitude,
                photo_url,
                nextPhotoPosition,
                parseBooleanValue(body.is_available, Boolean(current.is_available)),
                catid
            ]
        );

        return getCatById(req, res, next);
    } catch (err) {
        next(err);
    }
}

// DELETE /cats/:id
// Remove a cat record from the DB.
async function deleteCat(req, res, next) {
    try {
        const { catid } = req.params;
        const [result] = await pool.query('DELETE FROM Cat WHERE catid = ?', [catid]);
        if (!result.affectedRows) {
            return fail(res, 'Cat not found', 404);
        }
        return ok(res, { message: 'Cat deleted' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getCats,
    getCatById,
    createCat,
    updateCat,
    deleteCat
};
