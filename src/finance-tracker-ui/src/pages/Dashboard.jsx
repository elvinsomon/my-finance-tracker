import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import dashboardService from '../services/dashboardService';
import transactionService from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import TransactionCard from '../components/TransactionCard';
import BudgetProgressBar from '../components/BudgetProgressBar';
import StatCard from '../components/dashboard/StatCard';
import StatsGrid from '../components/dashboard/StatsGrid';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    accounts: [],
    budgets: [],
    recentTransactions: [],
  });
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expense: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardData, currentMonthTransactions] = await Promise.all([
        dashboardService.getSummary(),
        fetchCurrentMonthTransactions(),
      ]);

      setData(dashboardData);
      calculateMonthlyStats(currentMonthTransactions);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMonthTransactions = async () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    const response = await transactionService.getAll({
      startDate,
      endDate,
      pageSize: 100,
    });
    return response.data;
  };

  const calculateMonthlyStats = (transactions) => {
    const income = transactions
      .filter((t) => t.type === 'Income')
      .reduce((sum, t) => sum + t.amountInBaseCurrency, 0);

    const expense = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amountInBaseCurrency, 0);

    setMonthlyStats({ income, expense });
  };

  const getTotalBalance = () => {
    return data.accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.fullName}</p>
      </div>

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      <StatsGrid>
        <StatCard
          title="Total Balance"
          value={getTotalBalance()}
          currency={user?.defaultCurrency}
          icon={Wallet}
          iconColor="from-blue-500 to-blue-600"
          isLoading={loading}
        />
        <StatCard
          title="Income This Month"
          value={monthlyStats.income}
          currency={user?.defaultCurrency}
          icon={TrendingUp}
          iconColor="from-emerald-500 to-emerald-600"
          isLoading={loading}
        />
        <StatCard
          title="Expenses This Month"
          value={monthlyStats.expense}
          currency={user?.defaultCurrency}
          icon={TrendingDown}
          iconColor="from-rose-500 to-rose-600"
          isLoading={loading}
        />
      </StatsGrid>

      <div className="h-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-glass border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="mb-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Income vs Expenses
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Month</p>
          </div>
          <IncomeExpenseChart
            income={monthlyStats.income}
            expense={monthlyStats.expense}
            currency={user?.defaultCurrency}
            loading={loading}
          />
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-glass border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Budget Progress</h2>
            <Link
              to="/budgets"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View all
            </Link>
          </div>
          {data.budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No budgets set</p>
              <Link
                to="/budgets"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Create your first budget
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.budgets.slice(0, 3).map((budget) => (
                <BudgetProgressBar
                  key={budget.id}
                  budgeted={budget.amount}
                  spent={budget.spent}
                  currency={budget.currency}
                  categoryName={budget.categoryName}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-glass border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            View all
          </Link>
        </div>
        {data.recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions yet</p>
            <Link
              to="/transactions"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Add your first transaction
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.recentTransactions.slice(0, 5).map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
