import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const IncomeExpenseChart = ({ income = 0, expense = 0, currency = 'USD', loading = false }) => {
  const data = useMemo(() => [
    {
      name: 'This Month',
      Income: income,
      Expense: expense,
    },
  ], [income, expense]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-glass p-3">
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

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex justify-center gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-700"
            opacity={0.3}
          />
          <XAxis
            dataKey="name"
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Legend content={<CustomLegend />} />
          <Bar
            dataKey="Income"
            fill="#22c55e"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            animationBegin={0}
            className="dark:fill-income-400"
          />
          <Bar
            dataKey="Expense"
            fill="#ef4444"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            animationBegin={200}
            className="dark:fill-expense-400"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
