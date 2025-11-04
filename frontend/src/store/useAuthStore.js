import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  token: authService.getToken(),
  isAuthenticated: !!authService.getToken(),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(credentials);
      
      if (data.success) {
        set({
          user: data.data,
          token: data.data.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      throw new Error(errorMessage);
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      
      if (data.success) {
        set({
          user: data.data,
          token: data.data.token,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        return data;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
