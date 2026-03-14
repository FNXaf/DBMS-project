const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    getCats,
    getCatById,
    createCat,
    updateCat,
    deleteCat
} = require('../controllers/catsController');

const uploadDir = path.join(__dirname, '../../public/uploads/cats');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeExt = ext || '.jpg';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    }
});

const upload = multer({ storage });
const router = express.Router();

router.get('/', getCats);
router.get('/:catid', getCatById);
router.post('/', authMiddleware, adminMiddleware, upload.single('photo'), createCat);
router.put('/:catid', authMiddleware, adminMiddleware, upload.single('photo'), updateCat);
router.delete('/:catid', authMiddleware, adminMiddleware, deleteCat);

module.exports = router;
