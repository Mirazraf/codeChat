const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const Room = require('../models/Room');

// @route   GET /api/dashboard/stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // 1. Code Snippets Count (messages with type: 'code')
  const codeSnippetsThisWeek = await Message.countDocuments({
    sender: userId,
    type: 'code',
    createdAt: { $gte: lastWeek }
  });

  const codeSnippetsLastWeek = await Message.countDocuments({
    sender: userId,
    type: 'code',
    createdAt: { $gte: twoWeeksAgo, $lt: lastWeek }
  });

  const codeSnippetsTotal = await Message.countDocuments({
    sender: userId,
    type: 'code'
  });

  const codeSnippetsChange = codeSnippetsLastWeek > 0
    ? Math.round(((codeSnippetsThisWeek - codeSnippetsLastWeek) / codeSnippetsLastWeek) * 100)
    : codeSnippetsThisWeek > 0 ? 100 : 0;

  // 2. Active Days Streak
  const userMessages = await Message.find({
    sender: userId
  }).select('createdAt').sort({ createdAt: -1 });

  let activeStreak = 0;
  if (userMessages.length > 0) {
    const messageDates = [...new Set(
      userMessages.map(msg => new Date(msg.createdAt).toDateString())
    )];

    // Check consecutive days from today backwards
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) { // Check up to 365 days
      const checkDate = new Date(currentDate).toDateString();
      if (messageDates.includes(checkDate)) {
        activeStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 3. User's Rooms Count
  const userRooms = await Room.countDocuments({
    members: userId
  });

  // 4. Total Hours Coded (estimate: 15 min per code message)
  const totalCodeMessages = codeSnippetsTotal;
  const hoursEstimate = Math.round((totalCodeMessages * 15) / 60);

  // 5. Connections (unique users in shared rooms)
  const rooms = await Room.find({ members: userId }).select('members');
  const allMembers = new Set();
  rooms.forEach(room => {
    room.members.forEach(member => {
      if (member.toString() !== userId.toString()) {
        allMembers.add(member.toString());
      }
    });
  });

  res.json({
    success: true,
    data: {
      codeSnippets: {
        total: codeSnippetsTotal,
        thisWeek: codeSnippetsThisWeek,
        change: codeSnippetsChange
      },
      activeStreak,
      rooms: userRooms,
      hoursEstimate: hoursEstimate + 'h',
      connections: allMembers.size
    }
  });
}));

// @route   GET /api/dashboard/recent-activity
// @desc    Get user's recent activity
// @access  Private
router.get('/recent-activity', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get last 10 messages to extract activities
  const recentMessages = await Message.find({
    sender: userId
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('room', 'name')
    .select('type content codeLanguage room createdAt');

  const activities = [];
  const seenRooms = new Set();
  const seenCodeLanguages = new Set();

  for (const msg of recentMessages) {
    if (activities.length >= 3) break;

    // Activity 1: Joined room (first message in a room)
    if (msg.room && !seenRooms.has(msg.room._id.toString())) {
      activities.push({
        action: 'Joined',
        target: msg.room.name,
        time: formatTimeAgo(msg.createdAt),
        icon: 'MessageSquare',
        type: 'room'
      });
      seenRooms.add(msg.room._id.toString());
    }

    // Activity 2: Shared code snippet
    if (msg.type === 'code' && msg.codeLanguage && !seenCodeLanguages.has(msg.codeLanguage)) {
      const languageName = msg.codeLanguage.charAt(0).toUpperCase() + msg.codeLanguage.slice(1);
      activities.push({
        action: 'Shared',
        target: `${languageName} code in ${msg.room?.name || 'a room'}`,
        time: formatTimeAgo(msg.createdAt),
        icon: 'Code2',
        type: 'code'
      });
      seenCodeLanguages.add(msg.codeLanguage);
    }
  }

  // If no activities, add a default message
  if (activities.length === 0) {
    activities.push({
      action: 'Welcome',
      target: 'Start chatting to see your activity here!',
      time: 'just now',
      icon: 'MessageSquare',
      type: 'welcome'
    });
  }

  res.json({
    success: true,
    data: activities
  });
}));

// @route   GET /api/dashboard/popular-rooms
// @desc    Get most active rooms by message count
// @access  Private
router.get('/popular-rooms', protect, asyncHandler(async (req, res) => {
  // Get rooms with most messages
  const popularRooms = await Message.aggregate([
    {
      $group: {
        _id: '$room',
        messageCount: { $sum: 1 }
      }
    },
    { $sort: { messageCount: -1 } },
    { $limit: 3 }
  ]);

  if (popularRooms.length === 0) {
    return res.json({
      success: true,
      data: []
    });
  }

  const roomIds = popularRooms.map(r => r._id);
  const rooms = await Room.find({ _id: { $in: roomIds } })
    .populate('members', 'username')
    .select('name members');

  const result = rooms.map(room => {
    const stats = popularRooms.find(r => r._id.toString() === room._id.toString());
    return {
      _id: room._id,
      name: room.name,
      membersCount: room.members.length,
      messageCount: stats?.messageCount || 0
    };
  });

  res.json({
    success: true,
    data: result
  });
}));

// Helper function to format time ago
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

module.exports = router;