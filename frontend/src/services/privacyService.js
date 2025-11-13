import api from './api';

export const privacyService = {
  /**
   * Update user's privacy settings
   * @param {Object} settings - Privacy settings object
   * @param {string} settings.globalVisibility - 'public' or 'private'
   * @param {Object} settings.fields - Field-level privacy settings
   * @returns {Promise<Object>} Response with updated privacy settings
   */
  updatePrivacySettings: async (settings) => {
    try {
      const response = await api.put('/profile/privacy', settings);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update privacy settings';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get a user's public profile (filtered by privacy settings)
   * @param {string} userId - The ID of the user whose profile to fetch
   * @returns {Promise<Object>} Filtered user profile data
   */
  getPublicProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/public-profile`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch public profile';
      throw new Error(errorMessage);
    }
  },
};
