const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.query(
            'SELECT userid, full_name, email, phone, address, role, created_at FROM `User` WHERE userid = ?',
            [decoded.userid]
        );

        if (!rows.length) {
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

module.exports = authMiddleware;
