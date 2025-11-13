const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  updatePrivacySettings,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Profile routes
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/password', protect, changePassword);
router.put('/privacy', protect, updatePrivacySettings);

module.exports = router;
