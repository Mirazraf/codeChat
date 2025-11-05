import { create } from 'zustand';
import axios from 'axios';
import socketService from '../services/socketService';

const API_URL = 'http://localhost:5000/api';

const useChatStore = create((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,
  error: null,

  // Fetch all rooms
  fetchRooms: async () => {
    try {
      set({ loading: true });
      const response = await axios.get(`${API_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      set({ rooms: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Set current room and fetch messages
  setCurrentRoom: async (room, userId) => {
    try {
      set({ currentRoom: room, messages: [], loading: true });

      // Join room via socket
      socketService.joinRoom(room._id, userId);

      // Fetch messages
      const response = await axios.get(
        `${API_URL}/rooms/${room._id}/messages?page=1&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      set({ messages: response.data.data.messages, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Leave current room
  leaveRoom: async (userId) => {
    const { currentRoom } = get();
    if (currentRoom) {
      socketService.leaveRoom(currentRoom._id, userId);
      set({ currentRoom: null, messages: [] });
    }
  },

  // Send message
  sendMessage: (messageData) => {
    socketService.sendMessage(messageData);
  },

  // Add message to list
  addMessage: (message) => {
    set((state) => {
      // Check if message already exists
      const exists = state.messages.some((m) => m._id === message._id);
      if (exists) return state;

      return { messages: [...state.messages, message] };
    });
  },

  // React to message
  reactToMessage: (messageId, emoji) => {
    const socket = socketService.getSocket();
    const userId = JSON.parse(localStorage.getItem('user'))?._id;
    
    if (socket && userId) {
      socket.emit('reactToMessage', { messageId, userId, emoji });
    }
  },

  // Update message reaction
  updateMessageReaction: (updatedMessage) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      ),
    }));
  },

  // Edit message
  editMessage: (messageId, newContent) => {
    const socket = socketService.getSocket();
    const userId = JSON.parse(localStorage.getItem('user'))?._id;
    
    if (socket && userId) {
      socket.emit('editMessage', { messageId, userId, newContent });
    }
  },

  // Update edited message
  updateEditedMessage: (editedMessage) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === editedMessage._id ? editedMessage : msg
      ),
    }));
  },

  // Delete message
  deleteMessage: (messageId, deleteType) => {
    const socket = socketService.getSocket();
    const userId = JSON.parse(localStorage.getItem('user'))?._id;
    
    if (socket && userId) {
      socket.emit('deleteMessage', { messageId, userId, deleteType });
    }
  },

  // Handle deleted message
  handleDeletedMessage: (data) => {
    if (data.deleteType === 'forEveryone') {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.message._id ? data.message : msg
        ),
      }));
    } else if (data.deleteType === 'forMe') {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== data.messageId),
      }));
    }
  },

  // Set online users
  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },

  // Set typing user
  setTypingUser: (username, isTyping) => {
    set((state) => {
      if (isTyping) {
        if (!state.typingUsers.includes(username)) {
          return { typingUsers: [...state.typingUsers, username] };
        }
      } else {
        return {
          typingUsers: state.typingUsers.filter((user) => user !== username),
        };
      }
      return state;
    });
  },
}));

export default useChatStore;