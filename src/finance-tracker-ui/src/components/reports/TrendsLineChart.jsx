import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendsLineChart = ({ data }) => {
  if (!data || !data.months || data.months.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No trend data available
      </div>
    );
  }

  const chartData = {
    labels: data.months.map(month => {
      try {
        return format(parseISO(month.month + '-01'), 'MMM yyyy');
      } catch {
        return month.month;
      }
    }),
    datasets: [
      {
        label: 'Income',
        data: data.months.map(month => month.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Expenses',
        data: data.months.map(month => month.expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Savings',
        data: data.months.map(month => month.savings),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Income & Expense Trends
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-gray-600">Avg. Monthly Income</div>
          <div className="text-lg font-semibold text-green-700">
            {formatCurrency(data.averageMonthlyIncome)}
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-gray-600">Avg. Monthly Expenses</div>
          <div className="text-lg font-semibold text-red-700">
            {formatCurrency(data.averageMonthlyExpenses)}
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-gray-600">Avg. Monthly Savings</div>
          <div className="text-lg font-semibold text-blue-700">
            {formatCurrency(data.averageMonthlySavings)}
          </div>
        </div>
      </div>
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TrendsLineChart;
