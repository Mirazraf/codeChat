const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoom,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomMessages,
  deleteRoom,
  markRoomAsRead,
  togglePinRoom,
  getRoomStatistics,
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRooms).post(protect, createRoom);

router.route('/:id').get(protect, getRoom).delete(protect, deleteRoom);

router.post('/:id/join', protect, joinRoom);
router.post('/:id/leave', protect, leaveRoom);
router.get('/:id/messages', protect, getRoomMessages);
router.post('/:id/read', protect, markRoomAsRead);
router.post('/:id/pin', protect, togglePinRoom);
router.get('/:id/statistics', protect, getRoomStatistics);

module.exports = router;
