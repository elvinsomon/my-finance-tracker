import api from './api';

const savingsGoalService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);

    const response = await api.get(`/savings-goals?${params.toString()}`);
    return response;
  },

  async getById(id) {
    const response = await api.get(`/savings-goals/${id}`);
    return response;
  },

  async create(data) {
    const response = await api.post('/savings-goals', data);
    return response;
  },

  async update(id, data) {
    const response = await api.put(`/savings-goals/${id}`, data);
    return response;
  },

  async delete(id) {
    const response = await api.delete(`/savings-goals/${id}`);
    return response;
  },

  async addContribution(goalId, data) {
    const response = await api.post(`/savings-goals/${goalId}/contributions`, data);
    return response;
  },

  async getContributions(goalId) {
    const response = await api.get(`/savings-goals/${goalId}/contributions`);
    return response;
  },
};

export default savingsGoalService;
