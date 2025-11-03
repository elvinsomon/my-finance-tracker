import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const MonthlyTrendChart = ({ data = [], currency = 'USD', loading = false }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return data;
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-glass p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {entry.name}:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No trend data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
            opacity={0.3}
          />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: '0.875rem' }}
            tickFormatter={(value) => formatCurrency(value, currency, { notation: 'compact' })}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Income"
            stroke="#22c55e"
            fillOpacity={1}
            fill="url(#incomeGradient)"
            strokeWidth={2}
            animationDuration={800}
            animationBegin={0}
          />
          <Area
            type="monotone"
            dataKey="Expense"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#expenseGradient)"
            strokeWidth={2}
            animationDuration={800}
            animationBegin={200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
