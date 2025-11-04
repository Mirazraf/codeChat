import api from './api';
import { AUTH_ENDPOINTS } from '../utils/constants';

export const authService = {
  register: async (userData) => {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout: async () => {
    await api.post(AUTH_ENDPOINTS.LOGOUT);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await api.get(AUTH_ENDPOINTS.ME);
    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};
