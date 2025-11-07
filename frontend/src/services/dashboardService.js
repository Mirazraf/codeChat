import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },

  getPopularRooms: async () => {
    const response = await api.get('/dashboard/popular-rooms');
    return response.data;
  }
};