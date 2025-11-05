import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        this.socket.emit('authenticate', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
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

  onMessageReaction(callback) {
    if (this.socket) {
      this.socket.on('messageReaction', callback);
    }
  }

  onMessageEdited(callback) {
    if (this.socket) {
      this.socket.on('messageEdited', callback);
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('messageDeleted', callback);
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

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();