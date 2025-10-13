import api from './api';

const categoryService = {
  async getAll(type = null, includeInactive = false) {
    const params = new URLSearchParams();

    if (type) params.append('type', type);
    if (includeInactive) params.append('includeInactive', includeInactive);

    const response = await api.get(`/categories?${params.toString()}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },
};

export default categoryService;
