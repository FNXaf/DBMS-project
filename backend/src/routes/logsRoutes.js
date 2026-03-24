const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { getSqlLogs, deleteSqlLogs } = require('../controllers/logsController');

const router = express.Router();

router.get('/sql', authMiddleware, adminMiddleware, getSqlLogs);
router.delete('/sql', authMiddleware, adminMiddleware, deleteSqlLogs);

module.exports = router;
