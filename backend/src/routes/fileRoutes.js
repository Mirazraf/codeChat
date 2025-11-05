const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile } = require('../controllers/fileController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware'); // ← Changed this line

// Upload file (protected route)
router.post('/upload', protect, upload.single('file'), uploadFile); // ← Changed to 'protect'

// Delete file (protected route)
router.delete('/:publicId', protect, deleteFile); // ← Changed to 'protect'

module.exports = router;