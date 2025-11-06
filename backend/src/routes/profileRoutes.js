const express = require('express');
const router = express.Router();
const {
  updateProfile,
  uploadAvatar,
  changePassword,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Profile routes
router.put('/', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/password', protect, changePassword);

module.exports = router;
