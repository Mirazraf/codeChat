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

        console.log(`📤 ${user.username} left room: ${room.name}`);
      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // Handle sending a message (including file messages and replies)
    socket.on('sendMessage', async (messageData) => {
      try {
        const { roomId, userId, content, type, codeLanguage, fileUrl, fileName, fileSize, fileType, replyTo } = messageData;

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
          replyTo: replyTo || null, // NEW: Store reply reference
        });

        // Populate sender info, replied message, and readBy
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username email avatar role')
          .populate({
            path: 'replyTo',
            populate: {
              path: 'sender',
              select: 'username avatar',
            },
          })
          .populate('readBy.user', 'username avatar');

        // Broadcast message to room FIRST (for instant delivery)
        io.to(roomId).emit('message', populatedMessage);

        // Then do background tasks asynchronously (don't block message delivery)
        setImmediate(async () => {
          try {
            // Update room last activity and last message (only for non-system messages)
            if (type !== 'system') {
              await Room.findByIdAndUpdate(roomId, {
                lastActivity: new Date(),
                lastMessage: message._id,
              });
              
              // Emit room update AFTER database update completes
              const updatedRoom = await Room.findById(roomId)
                .populate('creator', 'username email avatar role')
                .populate('members', 'username email avatar role')
                .populate({
                  path: 'lastMessage',
                  populate: {
                    path: 'sender',
                    select: 'username avatar',
                  },
                });
              
              io.emit('roomUpdate', updatedRoom);
            } else {
              // For system messages, only update lastActivity
              await Room.findByIdAndUpdate(roomId, {
                lastActivity: new Date(),
              });
            }

            // Auto-mark as read for the sender
            const sender = await User.findById(userId);
            if (sender) {
              const existingReadIndex = sender.lastReadMessages.findIndex(
                (lrm) => lrm.room.toString() === roomId
              );

              if (existingReadIndex !== -1) {
                sender.lastReadMessages[existingReadIndex].message = message._id;
                sender.lastReadMessages[existingReadIndex].readAt = new Date();
              } else {
                sender.lastReadMessages.push({
                  room: roomId,
                  message: message._id,
                  readAt: new Date(),
                });
              }

              await sender.save();

              // Find all unread messages from others in this room
              const unreadMessages = await Message.find({
                room: roomId,
                _id: { $ne: message._id }, // Exclude the current message
                sender: { $ne: userId }, // Only others' messages
                'readBy.user': { $ne: userId }, // Not already read
              }).select('_id');

              // Mark them as read
              if (unreadMessages.length > 0) {
                const messageIds = unreadMessages.map(m => m._id);
                
                await Message.updateMany(
                  { _id: { $in: messageIds } },
                  {
                    $push: {
                      readBy: {
                        user: userId,
                        readAt: new Date(),
                      },
                    },
                  }
                );

                // Emit read receipt updates only for the affected messages
                const updatedMessages = await Message.find({ _id: { $in: messageIds } })
                  .populate('readBy.user', 'username avatar')
                  .select('_id readBy');

                updatedMessages.forEach((msg) => {
                  io.to(roomId).emit('messageReadUpdate', {
                    messageId: msg._id,
                    readBy: msg.readBy,
                  });
                });
              }
            }
          } catch (error) {
            console.error('Background task error:', error);
          }
        });
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
    socket.on('markMessagesAsRead', async ({ roomId, userId }) => {
      try {
        // Find all messages in the room that the user hasn't read yet
        const messages = await Message.find({
          room: roomId,
          sender: { $ne: userId }, // Don't mark own messages as read
          'readBy.user': { $ne: userId }, // Not already read by this user
        }).sort('-createdAt'); // Sort by newest first

        if (messages.length === 0) {
          return; // No unread messages
        }

        // Mark all messages as read
        for (const message of messages) {
          message.readBy.push({
            user: userId,
            readAt: new Date(),
          });
          await message.save();

          // Populate and emit read receipt update
          const populatedMessage = await Message.findById(message._id)
            .populate('readBy.user', 'username avatar');

          io.to(roomId).emit('messageReadUpdate', {
            messageId: message._id,
            readBy: populatedMessage.readBy,
          });
        }

        // Update user's lastReadMessages for this room (use the latest message)
        const latestMessage = messages[0]; // First message (newest due to sort)
        const user = await User.findById(userId);
        
        if (user) {
          const existingReadIndex = user.lastReadMessages.findIndex(
            (lrm) => lrm.room.toString() === roomId
          );

          if (existingReadIndex !== -1) {
            user.lastReadMessages[existingReadIndex].message = latestMessage._id;
            user.lastReadMessages[existingReadIndex].readAt = new Date();
          } else {
            user.lastReadMessages.push({
              room: roomId,
              message: latestMessage._id,
              readAt: new Date(),
            });
          }

          await user.save();
        }

        console.log(`✅ User ${userId} marked ${messages.length} messages as read in room ${roomId}`);
      } catch (error) {
        console.error('Mark messages as read error:', error);
      }
    });

    // Handle message reactions - ADD REACTION
    socket.on('addReaction', async ({ messageId, userId, emoji, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if the emoji already exists in reactions
        const existingReaction = message.reactions.find(r => r.emoji === emoji);

        if (existingReaction) {
          // Check if user already reacted with this emoji
          if (!existingReaction.users.includes(userId)) {
            existingReaction.users.push(userId);
          }
        } else {
          // Create new reaction entry
          message.reactions.push({
            emoji: emoji,
            users: [userId],
          });
        }

        await message.save();

        // Populate sender info and emit to room
        const updatedMessage = await Message.findById(messageId).populate(
          'sender',
          'username email avatar role'
        );

        io.to(roomId).emit('reactionUpdate', {
          messageId: messageId,
          reactions: updatedMessage.reactions,
        });

        console.log(`👍 Reaction added: ${emoji} by user ${userId} on message ${messageId}`);
      } catch (error) {
        console.error('Add reaction error:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle message reactions - REMOVE REACTION
    socket.on('removeReaction', async ({ messageId, userId, emoji, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Find the reaction
        const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

        if (reactionIndex !== -1) {
          const reaction = message.reactions[reactionIndex];
          
          // Remove user from the reaction
          reaction.users = reaction.users.filter(
            uid => uid.toString() !== userId.toString()
          );

          // If no users left, remove the entire reaction
          if (reaction.users.length === 0) {
            message.reactions.splice(reactionIndex, 1);
          }

          await message.save();

          // Populate sender info and emit to room
          const updatedMessage = await Message.findById(messageId).populate(
            'sender',
            'username email avatar role'
          );

          io.to(roomId).emit('reactionUpdate', {
            messageId: messageId,
            reactions: updatedMessage.reactions,
          });

          console.log(`👎 Reaction removed: ${emoji} by user ${userId} on message ${messageId}`);
        }
      } catch (error) {
        console.error('Remove reaction error:', error);
        socket.emit('error', { message: 'Failed to remove reaction' });
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
