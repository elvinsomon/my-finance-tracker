import api from './api';

const transactionService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.accountId) params.append('accountId', filters.accountId);

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  async exportCSV(filters = {}) {
    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.accountId) params.append('accountId', filters.accountId);

    const response = await api.get(`/transactions/export?${params.toString()}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default transactionService;
