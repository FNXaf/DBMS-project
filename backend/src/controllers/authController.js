const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { ok, fail } = require('../utils/apiResponse');
const { isEmail } = require('../utils/validators');

function signToken(user) {
    return jwt.sign({ userid: user.userid, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
}

async function register(req, res, next) {
    try {
        const { full_name, email, password, phone, address } = req.body;

        if (!full_name || !email || !password) {
            return fail(res, 'full_name, email and password are required', 400);
        }

        if (!isEmail(email)) {
            return fail(res, 'Invalid email format', 400);
        }

        const [existing] = await pool.query('SELECT userid FROM `User` WHERE email = ?', [email]);
        if (existing.length) {
            return fail(res, 'Email already registered', 409);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO `User` (full_name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name.trim(), email.trim().toLowerCase(), passwordHash, phone || null, address || null, 'user']
        );

        return ok(res, { userid: result.insertId, message: 'Registration successful' }, 201);
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return fail(res, 'Email and password are required', 400);
        }

        const [rows] = await pool.query('SELECT * FROM `User` WHERE email = ?', [email.trim().toLowerCase()]);
        if (!rows.length) {
            return fail(res, 'Invalid email or password', 401);
        }

        const user = rows[0];
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            return fail(res, 'Invalid email or password', 401);
        }

        const token = signToken(user);
        const safeUser = {
            userid: user.userid,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            created_at: user.created_at
        };

        return ok(res, { token, user: safeUser });
    } catch (err) {
        next(err);
    }
}

async function me(req, res) {
    return ok(res, req.user);
}

module.exports = {
    register,
    login,
    me
};
