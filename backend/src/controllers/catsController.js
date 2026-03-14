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

function parseCsvList(value) {
    return String(value || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
}

function parseBooleanValue(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase().trim();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
    return fallback;
}

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

        if (gender) {
            where.push('gender = ?');
            params.push(gender);
        }

        const furColors = parseCsvList(fur_color);
        if (furColors.length) {
            where.push(`fur_color IN (${furColors.map(() => '?').join(',')})`);
            params.push(...furColors);
        }

        const breeds = parseCsvList(breed);
        if (breeds.length) {
            where.push(`breed IN (${breeds.map(() => '?').join(',')})`);
            params.push(...breeds);
        }

        const catts = parseCsvList(cattitude);
        if (catts.length) {
            where.push(`cattitude IN (${catts.map(() => '?').join(',')})`);
            params.push(...catts);
        }

        if (health_status) {
            where.push('health_status = ?');
            params.push(health_status);
        }

        if (age_min !== undefined && age_min !== '') {
            where.push('TIMESTAMPDIFF(MONTH, dob, CURDATE()) >= ?');
            params.push(Number(age_min));
        }

        if (age_max !== undefined && age_max !== '') {
            where.push('TIMESTAMPDIFF(MONTH, dob, CURDATE()) <= ?');
            params.push(Number(age_max));
        }

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

        return ok(res, rows.map((cat) => toApiCat(cat, req)));
    } catch (err) {
        next(err);
    }
}

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
            return fail(res, 'Cat not found', 404);
        }

        return ok(res, toApiCat(rows[0], req));
    } catch (err) {
        next(err);
    }
}

function mapHealthStatus(value) {
    if (value === 'Needs Care') return 'Under Treatment';
    return value;
}

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

        if (!shelter_name || !breed || !dob || !gender || !intake_date) {
            return fail(res, 'shelter_name, breed, dob, gender, intake_date are required', 400);
        }

        if (!isValidPastDate(dob)) {
            return fail(res, 'dob must be a valid date in the past', 400);
        }

        const [dup] = await pool.query('SELECT catid FROM Cat WHERE shelter_name = ?', [shelter_name]);
        if (dup.length) {
            return fail(res, 'shelter_name already exists', 409);
        }

        let photo_url = '';
        if (req.file) {
            photo_url = `/uploads/cats/${req.file.filename}`;
        } else if (body.photo_url && /^https?:\/\//i.test(body.photo_url)) {
            photo_url = body.photo_url;
        }

        const [result] = await pool.query(
            `INSERT INTO Cat
             (shelter_name, name, breed, fur_color, dob, gender, intake_date, health_status, cattitude, photo_url, photo_position, is_available)
             VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [shelter_name, breed, fur_color, dob, gender, intake_date, health_status, cattitude, photo_url, photo_position]
        );

        req.params.catid = String(result.insertId);
        return getCatById(req, res, next);
    } catch (err) {
        next(err);
    }
}

async function updateCat(req, res, next) {
    try {
        const { catid } = req.params;
        const body = req.body;
        const [rows] = await pool.query('SELECT * FROM Cat WHERE catid = ?', [catid]);
        if (!rows.length) {
            return fail(res, 'Cat not found', 404);
        }

        const current = rows[0];
        const shelter_name = body.shelter_name !== undefined ? String(body.shelter_name).trim() : current.shelter_name;

        if (!shelter_name) {
            return fail(res, 'shelter_name is required', 400);
        }

        if (body.dob && !isValidPastDate(body.dob)) {
            return fail(res, 'dob must be a valid date in the past', 400);
        }

        const [dup] = await pool.query('SELECT catid FROM Cat WHERE shelter_name = ? AND catid <> ?', [shelter_name, catid]);
        if (dup.length) {
            return fail(res, 'shelter_name already exists', 409);
        }

        let photo_url = current.photo_url;
        if (req.file) {
            photo_url = `/uploads/cats/${req.file.filename}`;
        } else if (body.photo_url && /^https?:\/\//i.test(body.photo_url)) {
            photo_url = body.photo_url;
        }

        const nextPhotoPosition = ['center', 'top', 'bottom'].includes(body.photo_position)
            ? body.photo_position
            : current.photo_position || 'center';

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
