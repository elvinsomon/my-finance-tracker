import api from './api';

const dashboardService = {
  async getSummary() {
    // This endpoint might need to be created in the backend
    // For now, we'll aggregate data from different endpoints
    try {
      const [accounts, budgets, transactions] = await Promise.all([
        api.get('/accounts'),
        api.get('/budgets?isActive=true'),
        api.get('/transactions?pageSize=10&page=1'),
      ]);

      return {
        accounts: accounts.data,
        budgets: budgets.data,
        recentTransactions: transactions.data.data,
      };
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService;
