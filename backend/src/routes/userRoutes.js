const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Placeholder for future user routes
router.get('/', protect, (req, res) => {
  res.json({ message: 'User routes coming soon' });
});

module.exports = router;
