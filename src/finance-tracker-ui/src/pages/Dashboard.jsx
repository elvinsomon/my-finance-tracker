import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dashboardService from '../services/dashboardService';
import transactionService from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import TransactionCard from '../components/TransactionCard';
import BudgetProgressBar from '../components/BudgetProgressBar';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

  const chartData = {
    labels: ['This Month'],
    datasets: [
      {
        label: 'Income',
        data: [monthlyStats.income],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: [monthlyStats.expense],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Income vs Expenses (Current Month)',
      },
    },
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.fullName}</p>
      </div>

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Balance
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(getTotalBalance(), user?.defaultCurrency)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-income-100 rounded-md p-3">
              <svg
                className="h-6 w-6 text-income-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Income This Month
                </dt>
                <dd className="text-2xl font-semibold text-income-600">
                  {formatCurrency(monthlyStats.income, user?.defaultCurrency)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-expense-100 rounded-md p-3">
              <svg
                className="h-6 w-6 text-expense-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Expenses This Month
                </dt>
                <dd className="text-2xl font-semibold text-expense-600">
                  {formatCurrency(monthlyStats.expense, user?.defaultCurrency)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Budget Progress</h2>
            <Link
              to="/budgets"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          {data.budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No budgets set</p>
              <Link
                to="/budgets"
                className="text-blue-600 hover:text-blue-800"
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

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>
        {data.recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No transactions yet</p>
            <Link
              to="/transactions"
              className="text-blue-600 hover:text-blue-800"
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
