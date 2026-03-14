const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    createAdoption,
    getMyAdoptions,
    getAllAdoptions,
    updateAdoptionStatus
} = require('../controllers/adoptionsController');

const router = express.Router();

router.post('/', authMiddleware, createAdoption);
router.get('/my', authMiddleware, getMyAdoptions);
router.get('/', authMiddleware, adminMiddleware, getAllAdoptions);
router.put('/:id/status', authMiddleware, adminMiddleware, updateAdoptionStatus);

module.exports = router;
