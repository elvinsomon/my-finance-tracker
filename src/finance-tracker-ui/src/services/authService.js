import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email, password, fullName, defaultCurrency) {
    const response = await api.post('/auth/register', {
      email,
      password,
      fullName,
      defaultCurrency,
    });
    return response.data;
  },
};

export default authService;
