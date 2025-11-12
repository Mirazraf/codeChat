const Room = require('../models/Room');
const Message = require('../models/Message');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    const rooms = await Room.find({
      $or: [
        { type: 'public' },
        { members: req.user.id },
        { creator: req.user.id },
      ],
    })
      .populate('creator', 'username email avatar role')
      .populate('members', 'username email avatar role')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username avatar',
        },
      })
      .sort('-lastActivity');

    // Add hasUnread flag to each room
    const roomsWithUnread = rooms.map((room) => {
      const roomObj = room.toObject();
      
      if (roomObj.lastMessage) {
        // Don't mark as unread if:
        // 1. It's the user's own message, OR
        // 2. It's a system message
        const isOwnMessage = roomObj.lastMessage.sender && 
          roomObj.lastMessage.sender._id.toString() === req.user.id;
        const isSystemMessage = roomObj.lastMessage.type === 'system';
        
        if (isOwnMessage || isSystemMessage) {
          roomObj.hasUnread = false;
        } else {
          // Find user's last read message for this room
          const lastRead = user.lastReadMessages.find(
            (lrm) => lrm.room.toString() === room._id.toString()
          );
          
          // Room has unread if there's a lastMessage and either:
          // 1. User has never read this room, OR
          // 2. The lastMessage is newer than the last read message
          roomObj.hasUnread = !lastRead || 
            (lastRead.message.toString() !== roomObj.lastMessage._id.toString());
        }
      } else {
        roomObj.hasUnread = false;
      }
      
      return roomObj;
    });

    res.json({
      success: true,
      count: roomsWithUnread.length,
      data: roomsWithUnread,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'username email avatar role')
      .populate('members', 'username email avatar role');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user has access
    if (
      room.type === 'private' &&
      !room.members.some((member) => member._id.toString() === req.user.id) &&
      room.creator._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    // Check if room name already exists
    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({
        success: false,
        message: 'Room with this name already exists',
      });
    }

    const room = await Room.create({
      name,
      description,
      type: type || 'public',
      creator: req.user.id,
      members: [req.user.id],
      admins: [req.user.id],
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'username email avatar role')
      .populate('members', 'username email avatar role');

    res.status(201).json({
      success: true,
      data: populatedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Join room
// @route   POST /api/rooms/:id/join
// @access  Private
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is already a member
    if (room.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this room',
      });
    }

    room.members.push(req.user.id);
    room.lastActivity = Date.now();
    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'username email avatar role')
      .populate('members', 'username email avatar role');

    res.json({
      success: true,
      data: populatedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Leave room
// @route   POST /api/rooms/:id/leave
// @access  Private
const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Remove user from members
    room.members = room.members.filter(
      (member) => member.toString() !== req.user.id
    );
    room.lastActivity = Date.now();
    await room.save();

    res.json({
      success: true,
      message: 'Left room successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get room messages
// @route   GET /api/rooms/:id/messages
// @access  Private
const getRoomMessages = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user has access
    if (
      room.type === 'private' &&
      !room.members.includes(req.user.id) &&
      room.creator.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: req.params.id })
      .populate('sender', 'username email avatar role')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username avatar',
        },
      })
      .populate('readBy.user', 'username avatar')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);

    const total = await Message.countDocuments({ room: req.params.id });

    res.json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: messages.reverse(), // Reverse to show oldest first
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is creator or admin
    if (
      room.creator.toString() !== req.user.id &&
      !room.admins.includes(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room',
      });
    }

    await room.deleteOne();

    // Delete all messages in the room
    await Message.deleteMany({ room: req.params.id });

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark room messages as read
// @route   POST /api/rooms/:id/read
// @access  Private
const markRoomAsRead = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Get the last message in the room
    const lastMessage = await Message.findOne({ room: req.params.id })
      .sort('-createdAt')
      .limit(1);

    if (lastMessage) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);

      // Update or add lastReadMessage for this room
      const existingReadIndex = user.lastReadMessages.findIndex(
        (lrm) => lrm.room.toString() === req.params.id
      );

      if (existingReadIndex !== -1) {
        user.lastReadMessages[existingReadIndex].message = lastMessage._id;
        user.lastReadMessages[existingReadIndex].readAt = new Date();
      } else {
        user.lastReadMessages.push({
          room: req.params.id,
          message: lastMessage._id,
          readAt: new Date(),
        });
      }

      await user.save();
    }

    res.json({
      success: true,
      message: 'Room marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomMessages,
  deleteRoom,
  markRoomAsRead,
};
