import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Check authentication status (called on app load)
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        set({
          user: parsedUser,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

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
      
      // Preserve privacySettings if they exist in the response
      if (updatedUser.privacySettings) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({
          user: updatedUser,
          loading: false,
        });
      } else {
        // If privacySettings not in response, merge with existing user data
        const currentUser = get().user;
        const mergedUser = {
          ...updatedUser,
          privacySettings: currentUser?.privacySettings || null,
        };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        set({
          user: mergedUser,
          loading: false,
        });
      }
      
      return { success: true };
    } catch (error) {
      // Enhanced error message extraction
      let message = 'Failed to update profile';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors with detailed information
        const errors = error.response.data.errors;
        if (errors.field && errors.expected) {
          message = `Invalid value for ${errors.field}. Expected: ${errors.expected}`;
        }
      } else if (error.message) {
        message = error.message;
      }
      
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Update Privacy Settings
  updatePrivacySettings: async (privacySettings) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/profile/privacy`, privacySettings, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const updatedSettings = response.data.data.privacySettings;
      const currentUser = get().user;
      
      // Update user with new privacy settings
      const updatedUser = {
        ...currentUser,
        privacySettings: updatedSettings,
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      set({
        user: updatedUser,
        loading: false,
      });
      
      return { success: true, message: 'Privacy settings updated successfully' };
    } catch (error) {
      // Enhanced error message extraction
      let message = 'Failed to update privacy settings';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors with detailed information
        const errors = error.response.data.errors;
        if (errors.field && errors.expected) {
          message = `Invalid value for ${errors.field}. Expected: ${errors.expected}`;
        }
      } else if (error.message) {
        message = error.message;
      }
      
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
      // Enhanced error message extraction
      let message = 'Failed to upload avatar';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      // Add context for common upload errors
      if (message.includes('size') || message.includes('large')) {
        message = 'Image file is too large. Please use an image under 2MB.';
      } else if (message.includes('format') || message.includes('type')) {
        message = 'Invalid image format. Please use JPG, PNG, or GIF.';
      }
      
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
      // Enhanced error message extraction
      let message = 'Failed to change password';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
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