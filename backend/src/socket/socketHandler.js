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

          user.isOnline = true;
          await user.save();

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

    // Handle sending a message
    socket.on('sendMessage', async (messageData) => {
      try {
        const { roomId, userId, content, type, codeLanguage, fileUrl, fileName, fileSize, fileType, replyTo } = messageData;

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
          replyTo: replyTo || null,
        });

        // Populate sender and reply info
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username email avatar role')
          .populate({
            path: 'replyTo',
            populate: {
              path: 'sender',
              select: 'username avatar',
            },
          });

        await Room.findByIdAndUpdate(roomId, {
          lastActivity: new Date(),
        });

        io.to(roomId).emit('message', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message reaction
    socket.on('reactToMessage', async ({ messageId, userId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user already reacted
        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.user.toString() === userId
        );

        if (existingReactionIndex !== -1) {
          // Update existing reaction or remove if same emoji
          if (message.reactions[existingReactionIndex].emoji === emoji) {
            message.reactions.splice(existingReactionIndex, 1);
          } else {
            message.reactions[existingReactionIndex].emoji = emoji;
            message.reactions[existingReactionIndex].createdAt = new Date();
          }
        } else {
          // Add new reaction
          message.reactions.push({ user: userId, emoji, createdAt: new Date() });
        }

        await message.save();

        const populatedMessage = await Message.findById(messageId)
          .populate('sender', 'username email avatar role')
          .populate('reactions.user', 'username avatar')
          .populate({
            path: 'replyTo',
            populate: {
              path: 'sender',
              select: 'username avatar',
            },
          });

        io.to(message.room.toString()).emit('messageReaction', populatedMessage);
      } catch (error) {
        console.error('React to message error:', error);
        socket.emit('error', { message: 'Failed to react to message' });
      }
    });

    // Handle message edit
    socket.on('editMessage', async ({ messageId, userId, newContent }) => {
      try {
        const message = await Message.findById(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        if (message.sender.toString() !== userId) {
          socket.emit('error', { message: 'Not authorized to edit this message' });
          return;
        }

        message.content = newContent;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        const populatedMessage = await Message.findById(messageId)
          .populate('sender', 'username email avatar role')
          .populate('reactions.user', 'username avatar')
          .populate({
            path: 'replyTo',
            populate: {
              path: 'sender',
              select: 'username avatar',
            },
          });

        io.to(message.room.toString()).emit('messageEdited', populatedMessage);
      } catch (error) {
        console.error('Edit message error:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message delete
    socket.on('deleteMessage', async ({ messageId, userId, deleteType }) => {
      try {
        const message = await Message.findById(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        if (message.sender.toString() !== userId) {
          socket.emit('error', { message: 'Not authorized to delete this message' });
          return;
        }

        if (deleteType === 'forEveryone') {
          message.isDeletedForEveryone = true;
          message.content = 'This message was deleted';
          await message.save();

          const populatedMessage = await Message.findById(messageId)
            .populate('sender', 'username email avatar role');

          io.to(message.room.toString()).emit('messageDeleted', {
            message: populatedMessage,
            deleteType: 'forEveryone',
          });
        } else if (deleteType === 'forMe') {
          if (!message.deletedFor.includes(userId)) {
            message.deletedFor.push(userId);
            await message.save();
          }

          socket.emit('messageDeleted', {
            messageId,
            deleteType: 'forMe',
          });
        }
      } catch (error) {
        console.error('Delete message error:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ roomId, username, isTyping }) => {
      socket.to(roomId).emit('userTyping', { username, isTyping });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.username || socket.id}`);
      
      if (socket.userId) {
        try {
          const user = await User.findById(socket.userId);
          if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            await user.save();
          }

          onlineUsers.delete(socket.userId);
          io.emit('onlineUsers', Array.from(onlineUsers.values()));
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      }
    });
  });
};

module.exports = socketHandler;