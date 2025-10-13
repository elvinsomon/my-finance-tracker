import api from './api';

const accountService = {
  async getAll() {
    const response = await api.get('/accounts');
    return response.data;
  },

  async create(data) {
    const response = await api.post('/accounts', data);
    return response.data;
  },
};

export default accountService;
