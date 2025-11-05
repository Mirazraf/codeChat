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
    } catch (error) {
      console.error('Error setting current room:', error);
    }
  },

  // Add a message to current room
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
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
