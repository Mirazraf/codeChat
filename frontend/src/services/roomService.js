import api from './api';

export const roomService = {
  getRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getRoom: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  joinRoom: async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/join`);
    return response.data;
  },

  leaveRoom: async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/leave`);
    return response.data;
  },

  getRoomMessages: async (roomId, page = 1, limit = 50) => {
    const response = await api.get(`/rooms/${roomId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },
};
