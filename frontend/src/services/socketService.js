import { io } from 'socket.io-client';

// Dynamic Socket URL - works for both dev and production
const getSocketURL = () => {
  // Production: Use same origin (Render deployment)
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // Development: Try to read port from backend's port file
  const savedPort = localStorage.getItem('backend-port') || '5000';
  return `http://localhost:${savedPort}`;
};

const SOCKET_URL = getSocketURL();
console.log('🔌 Socket URL:', SOCKET_URL);

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Add polling fallback
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        // Authenticate user
        this.socket.emit('authenticate', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId, userId) {
    if (this.socket) {
      this.socket.emit('joinRoom', { roomId, userId });
    }
  }

  leaveRoom(roomId, userId) {
    if (this.socket) {
      this.socket.emit('leaveRoom', { roomId, userId });
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('sendMessage', messageData);
    }
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }

  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.on('onlineUsers', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  emitTyping(roomId, username, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { roomId, username, isTyping });
    }
  }

  // Add reaction to message
  addReaction(messageId, userId, emoji, roomId) {
    if (this.socket) {
      this.socket.emit('addReaction', { messageId, userId, emoji, roomId });
    }
  }

  // Remove reaction from message
  removeReaction(messageId, userId, emoji, roomId) {
    if (this.socket) {
      this.socket.emit('removeReaction', { messageId, userId, emoji, roomId });
    }
  }

  // Listen for reaction updates
  onReactionUpdate(callback) {
    if (this.socket) {
      this.socket.on('reactionUpdate', callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();