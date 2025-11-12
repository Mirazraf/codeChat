import { create } from 'zustand';
import { roomService } from '../services/roomService';
import socketService from '../services/socketService';

const useChatStore = create((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,
  error: null,
  replyingTo: null, // NEW: Track which message is being replied to

  // Fetch all rooms
  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const data = await roomService.getRooms();
      set({ rooms: data.data, loading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch rooms',
        loading: false,
      });
      throw error;
    }
  },

  // Create a new room
  createRoom: async (roomData) => {
    set({ loading: true, error: null });
    try {
      const data = await roomService.createRoom(roomData);
      set((state) => ({
        rooms: [...state.rooms, data.data],
        loading: false,
      }));
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create room',
        loading: false,
      });
      throw error;
    }
  },

  // Join a room
  joinRoom: async (roomId, userId) => {
    set({ loading: true, error: null });
    try {
      const data = await roomService.joinRoom(roomId);
      
      // Fetch messages for this room
      const messagesData = await roomService.getRoomMessages(roomId);
      
      set({
        currentRoom: data.data,
        messages: messagesData.data,
        loading: false,
      });

      // Join socket room
      socketService.joinRoom(roomId, userId);

      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to join room',
        loading: false,
      });
      throw error;
    }
  },

  // Leave current room
  leaveRoom: async (userId) => {
    const { currentRoom } = get();
    if (currentRoom) {
      socketService.leaveRoom(currentRoom._id, userId);
      set({ currentRoom: null, messages: [], typingUsers: [], replyingTo: null });
    }
  },

  // Set current room (for switching rooms)
  setCurrentRoom: async (room, userId) => {
    const { currentRoom, leaveRoom: leave } = get();
    
    // Leave previous room if any
    if (currentRoom && currentRoom._id !== room._id) {
      await leave(userId);
    }
    
    try {
      const messagesData = await roomService.getRoomMessages(room._id);
      set({
        currentRoom: room,
        messages: messagesData.data,
        typingUsers: [],
        replyingTo: null,
      });
      socketService.joinRoom(room._id, userId);
      
      // Mark room as read
      await roomService.markRoomAsRead(room._id);
      
      // Update rooms list to reflect read status
      set((state) => ({
        rooms: state.rooms.map((r) =>
          r._id === room._id ? { ...r, hasUnread: false } : r
        ),
      }));
    } catch (error) {
      console.error('Error setting current room:', error);
    }
  },

  // Add a message to current room
  addMessage: (message, currentUserId) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      
      // Don't update room list for system messages
      if (message.type === 'system') {
        return { messages: newMessages };
      }
      
      // Check if this message is from the current user
      const isOwnMessage = message.sender?._id === currentUserId || message.sender === currentUserId;
      
      // Update room's lastMessage in rooms list
      const updatedRooms = state.rooms.map((room) => {
        if (room._id === message.room) {
          // Only mark as unread if:
          // 1. It's not the current room AND
          // 2. It's not the user's own message
          const shouldMarkUnread = room._id !== state.currentRoom?._id && !isOwnMessage;
          
          return {
            ...room,
            lastMessage: message,
            lastActivity: message.createdAt || new Date(),
            hasUnread: shouldMarkUnread,
          };
        }
        return room;
      });
      
      // Sort rooms by lastActivity (most recent first)
      const sortedRooms = updatedRooms.sort((a, b) => {
        const dateA = new Date(a.lastActivity || a.updatedAt);
        const dateB = new Date(b.lastActivity || b.updatedAt);
        return dateB - dateA;
      });
      
      return {
        messages: newMessages,
        rooms: sortedRooms,
      };
    });
  },

  // Send a message
  sendMessage: (messageData) => {
    socketService.sendMessage(messageData);
  },

  // Set online users
  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },

  // Set typing users
  setTypingUser: (username, isTyping) => {
    set((state) => {
      if (isTyping) {
        if (!state.typingUsers.includes(username)) {
          return {
            typingUsers: [...state.typingUsers, username],
          };
        }
        return state;
      } else {
        return {
          typingUsers: state.typingUsers.filter((user) => user !== username),
        };
      }
    });
  },

  // Update message reactions
  updateMessageReactions: (messageId, reactions) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, reactions } : msg
      ),
    }));
  },

  // Update message read receipts
  updateMessageReadBy: (messageId, readBy) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, readBy } : msg
      ),
    }));
  },

  // Update a single room in the list
  updateRoom: (updatedRoom, currentUserId) => {
    set((state) => {
      // Check if message is from current user
      const isOwnMessage = updatedRoom.lastMessage?.sender?._id === currentUserId;
      
      // Calculate hasUnread
      const roomWithUnread = {
        ...updatedRoom,
        hasUnread: updatedRoom._id !== state.currentRoom?._id && !isOwnMessage,
      };
      
      // Update or add the room
      const roomExists = state.rooms.find(r => r._id === updatedRoom._id);
      let updatedRooms;
      
      if (roomExists) {
        updatedRooms = state.rooms.map(r => 
          r._id === updatedRoom._id ? roomWithUnread : r
        );
      } else {
        updatedRooms = [...state.rooms, roomWithUnread];
      }
      
      // Sort by lastActivity
      const sortedRooms = updatedRooms.sort((a, b) => {
        const dateA = new Date(a.lastActivity || a.updatedAt);
        const dateB = new Date(b.lastActivity || b.updatedAt);
        return dateB - dateA;
      });
      
      return { rooms: sortedRooms };
    });
  },

  // NEW: Set replying to message
  setReplyingTo: (message) => {
    set({ replyingTo: message });
  },

  // NEW: Clear reply
  clearReply: () => {
    set({ replyingTo: null });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset state (useful for logout)
  reset: () => set({
    rooms: [],
    currentRoom: null,
    messages: [],
    onlineUsers: [],
    typingUsers: [],
    loading: false,
    error: null,
    replyingTo: null,
  }),
}));

export default useChatStore;
