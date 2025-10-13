import api from './api';

const budgetService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();

    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/budgets?${params.toString()}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/budgets', data);
    return response.data;
  },
};

export default budgetService;
