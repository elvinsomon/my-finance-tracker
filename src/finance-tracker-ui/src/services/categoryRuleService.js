import api from './api';

const categoryRuleService = {
  // Get all category rules
  getAll: async () => {
    const response = await api.get('/categoryrules');
    return response.data;
  },

  // Get category rule by ID
  getById: async (id) => {
    const response = await api.get(`/categoryrules/${id}`);
    return response.data;
  },

  // Create new category rule
  create: async (ruleData) => {
    const response = await api.post('/categoryrules', ruleData);
    return response.data;
  },

  // Update existing category rule
  update: async (id, ruleData) => {
    const response = await api.put(`/categoryrules/${id}`, ruleData);
    return response.data;
  },

  // Delete category rule
  delete: async (id) => {
    const response = await api.delete(`/categoryrules/${id}`);
    return response.data;
  }
};

export default categoryRuleService;
