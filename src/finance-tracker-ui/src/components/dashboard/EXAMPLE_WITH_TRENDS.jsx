/**
 * EXAMPLE: Dashboard with StatCard Trend Indicators
 *
 * This file demonstrates how to implement trend indicators
 * by comparing current month vs previous month data.
 *
 * To use this in Dashboard.jsx:
 * 1. Add previousMonthStats state
 * 2. Fetch previous month transactions
 * 3. Calculate trends
 * 4. Pass trend prop to StatCard
 */

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from './StatCard';
import StatsGrid from './StatsGrid';
import transactionService from '../../services/transactionService';

const DashboardWithTrends = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState({
    totalBalance: 15420.50,
    income: 5420.00,
    expense: 3200.00,
  });
  const [previousMonthStats, setPreviousMonthStats] = useState({
    totalBalance: 14200.00,
    income: 4820.00,
    expense: 3500.00,
  });

  /**
   * Calculate percentage change between current and previous period
   * @param {number} currentValue - Current period value
   * @param {number} previousValue - Previous period value
   * @returns {object|null} - { value: number, isPositive: boolean } or null
   */
  const calculateTrend = (currentValue, previousValue) => {
    if (previousValue === 0) {
      return null; // Avoid division by zero
    }

    const percentChange = ((currentValue - previousValue) / previousValue) * 100;

    return {
      value: Math.abs(percentChange), // Always positive number
      isPositive: percentChange >= 0   // true if increase, false if decrease
    };
  };

  /**
   * Fetch current month transactions
   */
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

  /**
   * Fetch previous month transactions
   */
  const fetchPreviousMonthTransactions = async () => {
    const now = new Date();
    // Previous month start
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split('T')[0];
    // Previous month end (day before current month start)
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split('T')[0];

    const response = await transactionService.getAll({
      startDate,
      endDate,
      pageSize: 100,
    });

    return response.data;
  };

  /**
   * Calculate statistics from transactions
   */
  const calculateStats = (transactions) => {
    const income = transactions
      .filter((t) => t.type === 'Income')
      .reduce((sum, t) => sum + t.amountInBaseCurrency, 0);

    const expense = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amountInBaseCurrency, 0);

    return { income, expense };
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch both current and previous month data in parallel
        const [currentTransactions, previousTransactions] = await Promise.all([
          fetchCurrentMonthTransactions(),
          fetchPreviousMonthTransactions(),
        ]);

        // Calculate stats for both periods
        const currentStats = calculateStats(currentTransactions);
        const previousStats = calculateStats(previousTransactions);

        setMonthlyStats(currentStats);
        setPreviousMonthStats(previousStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate trends
  const balanceTrend = calculateTrend(
    monthlyStats.totalBalance,
    previousMonthStats.totalBalance
  );

  const incomeTrend = calculateTrend(
    monthlyStats.income,
    previousMonthStats.income
  );

  const expenseTrend = calculateTrend(
    monthlyStats.expense,
    previousMonthStats.expense
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Dashboard with Trends
      </h1>

      <StatsGrid>
        {/* Total Balance Card */}
        <StatCard
          title="Total Balance"
          value={monthlyStats.totalBalance}
          currency="USD"
          icon={Wallet}
          iconColor="from-blue-500 to-blue-600"
          trend={balanceTrend}
          isLoading={loading}
        />

        {/* Income Card */}
        <StatCard
          title="Income This Month"
          value={monthlyStats.income}
          currency="USD"
          icon={TrendingUp}
          iconColor="from-emerald-500 to-emerald-600"
          trend={incomeTrend}
          isLoading={loading}
        />

        {/* Expenses Card */}
        <StatCard
          title="Expenses This Month"
          value={monthlyStats.expense}
          currency="USD"
          icon={TrendingDown}
          iconColor="from-rose-500 to-rose-600"
          trend={expenseTrend}
          isLoading={loading}
        />
      </StatsGrid>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2 text-xs font-mono">
          <div>
            <strong>Current Month:</strong> Income: ${monthlyStats.income} |
            Expense: ${monthlyStats.expense}
          </div>
          <div>
            <strong>Previous Month:</strong> Income: ${previousMonthStats.income} |
            Expense: ${previousMonthStats.expense}
          </div>
          <div>
            <strong>Trends:</strong> Income: {incomeTrend ? `${incomeTrend.value.toFixed(1)}%` : 'N/A'} |
            Expense: {expenseTrend ? `${expenseTrend.value.toFixed(1)}%` : 'N/A'}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWithTrends;

/**
 * EXAMPLE OUTPUT:
 *
 * If current month income is $5,420 and previous month was $4,820:
 * - Percentage change = ((5420 - 4820) / 4820) * 100 = 12.45%
 * - Trend object = { value: 12.45, isPositive: true }
 * - Display: Green arrow up with "+12.5%" badge
 *
 * If current month expense is $3,200 and previous month was $3,500:
 * - Percentage change = ((3200 - 3500) / 3500) * 100 = -8.57%
 * - Trend object = { value: 8.57, isPositive: false }
 * - Display: Red arrow down with "8.6%" badge
 *
 * INTERPRETATION FOR EXPENSES:
 * - Red down arrow for expenses is GOOD (spending less)
 * - Green up arrow for expenses is BAD (spending more)
 *
 * You may want to customize the color logic for expenses:
 * - Show green when expense trend is negative (spending less)
 * - Show red when expense trend is positive (spending more)
 *
 * To do this, modify the trend calculation for expenses:
 *
 * const expenseTrend = calculateTrend(
 *   monthlyStats.expense,
 *   previousMonthStats.expense
 * );
 *
 * // Invert the isPositive for expenses (less is better)
 * if (expenseTrend) {
 *   expenseTrend.isPositive = !expenseTrend.isPositive;
 * }
 */
