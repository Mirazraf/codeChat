import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Register
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, ...user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Login
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { token, ...user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Update Profile
  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const updatedUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      set({
        user: updatedUser,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Upload Avatar
  uploadAvatar: async (file) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { avatar } = response.data.data;
      const user = JSON.parse(localStorage.getItem('user'));
      user.avatar = avatar;
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        loading: false,
      });
      
      return { success: true, avatar };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload avatar';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Change Password
  changePassword: async (passwordData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/profile/password`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      set({ loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Logout
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
