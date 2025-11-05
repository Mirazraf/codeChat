const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

// Store online users
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', async (userId) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          socket.userId = userId;
          socket.username = user.username;
          onlineUsers.set(userId, {
            socketId: socket.id,
            userId: userId,
            username: user.username,
            avatar: user.avatar,
            role: user.role,
          });

          // Update user online status
          user.isOnline = true;
          await user.save();

          // Broadcast online users to all clients
          io.emit('onlineUsers', Array.from(onlineUsers.values()));

          console.log(`👤 User authenticated: ${user.username} (${userId})`);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });

    // Handle joining a room
    socket.on('joinRoom', async ({ roomId, userId }) => {
      try {
        const room = await Room.findById(roomId);
        const user = await User.findById(userId);

        if (!room || !user) {
          socket.emit('error', { message: 'Room or user not found' });
          return;
        }

        socket.join(roomId);
        socket.currentRoom = roomId;

        // Send system message
        const systemMessage = {
          room: roomId,
          sender: null,
          content: `${user.username} joined the room`,
          type: 'system',
          createdAt: new Date(),
        };

        io.to(roomId).emit('message', systemMessage);

        console.log(`📥 ${user.username} joined room: ${room.name}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leaveRoom', async ({ roomId, userId }) => {
      try {
        const room = await Room.findById(roomId);
        const user = await User.findById(userId);

        if (!room || !user) return;

        socket.leave(roomId);
        socket.currentRoom = null;

        // Send system message
        const systemMessage = {
          room: roomId,
          sender: null,
          content: `${user.username} left the room`,
          type: 'system',
          createdAt: new Date(),
        };

        io.to(roomId).emit('message', systemMessage);

        console.log(`📤 ${user.username} left room: ${room.name}`);
      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // Handle sending a message (including file messages)
    socket.on('sendMessage', async (messageData) => {
      try {
        const { roomId, userId, content, type, codeLanguage, fileUrl, fileName, fileSize, fileType } = messageData;

        // Save message to database
        const message = await Message.create({
          room: roomId,
          sender: userId,
          content: content || '',
          type: type || 'text',
          codeLanguage,
          fileUrl,
          fileName,
          fileSize,
          fileType,
        });

        // Populate sender info
        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'username email avatar role'
        );

        // Update room last activity
        await Room.findByIdAndUpdate(roomId, {
          lastActivity: new Date(),
        });

        // Broadcast message to room
        io.to(roomId).emit('message', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ roomId, username, isTyping }) => {
      socket.to(roomId).emit('userTyping', {
        username,
        isTyping,
      });
    });

    // Handle message read receipts
    socket.on('messageRead', async ({ messageId, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          message.readBy.push({
            user: userId,
            readAt: new Date(),
          });
          await message.save();
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          onlineUsers.delete(socket.userId);

          // Update user online status
          const user = await User.findById(socket.userId);
          if (user) {
            user.isOnline = false;
            user.lastSeen = Date.now();
            await user.save();
          }

          // Broadcast updated online users
          io.emit('onlineUsers', Array.from(onlineUsers.values()));

          console.log(`❌ User disconnected: ${socket.username || socket.id}`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
};

module.exports = socketHandler;
