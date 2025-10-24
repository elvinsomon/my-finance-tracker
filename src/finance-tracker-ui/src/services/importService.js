import api from './api';

const importService = {
  // Upload CSV file
  uploadCsv: async (file, financialAccountId, currency) => {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('FinancialAccountId', financialAccountId);
    formData.append('Currency', currency);

    const response = await api.post('/imports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get preview of parsed transactions
  getPreview: async (uploadId) => {
    const response = await api.get(`/imports/${uploadId}/preview`);
    return response.data;
  },

  // Confirm and execute import
  confirmImport: async (uploadId, categoryAssignments) => {
    const response = await api.post(`/imports/${uploadId}/confirm`, {
      uploadId,
      categoryAssignments
    });
    return response.data;
  },

  // Get import history
  getHistory: async (page = 1, pageSize = 20) => {
    const response = await api.get('/imports/history', {
      params: { page, pageSize }
    });
    return response.data;
  }
};

export default importService;
