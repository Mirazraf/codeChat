import api from './api';

const fileService = {
  // Upload file
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete file
  deleteFile: async (publicId) => {
    try {
      const response = await api.delete(`/files/${publicId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default fileService;