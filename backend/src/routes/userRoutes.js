const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPublicProfile } = require('../controllers/userController');

// User routes
router.get('/:id/public-profile', protect, getPublicProfile);

module.exports = router;
