import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ComparisonBarChart = ({ data }) => {
  if (!data || !data.current || !data.previous) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No comparison data available
      </div>
    );
  }

  const chartData = {
    labels: ['Income', 'Expenses', 'Savings'],
    datasets: [
      {
        label: `Current (${data.current.period})`,
        data: [data.current.income, data.current.expenses, data.current.savings],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 1
      },
      {
        label: `Previous (${data.previous.period})`,
        data: [data.previous.income, data.previous.expenses, data.previous.savings],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: '#9ca3af',
        borderWidth: 1
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

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '=';
  };

  const formatPercentage = (value) => {
    return Math.abs(value).toFixed(1) + '%';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Period Comparison
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Income Change</div>
          <div className={`text-xl font-semibold ${getChangeColor(data.changes.incomeChange)}`}>
            {getChangeIcon(data.changes.incomeChange)} {formatCurrency(Math.abs(data.changes.incomeChange))}
          </div>
          <div className={`text-sm ${getChangeColor(data.changes.incomeChange)}`}>
            {data.changes.incomeChangePercentage > 0 ? '+' : ''}
            {formatPercentage(data.changes.incomeChangePercentage)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Expenses Change</div>
          <div className={`text-xl font-semibold ${getChangeColor(-data.changes.expensesChange)}`}>
            {getChangeIcon(data.changes.expensesChange)} {formatCurrency(Math.abs(data.changes.expensesChange))}
          </div>
          <div className={`text-sm ${getChangeColor(-data.changes.expensesChange)}`}>
            {data.changes.expensesChangePercentage > 0 ? '+' : ''}
            {formatPercentage(data.changes.expensesChangePercentage)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Savings Change</div>
          <div className={`text-xl font-semibold ${getChangeColor(data.changes.savingsChange)}`}>
            {getChangeIcon(data.changes.savingsChange)} {formatCurrency(Math.abs(data.changes.savingsChange))}
          </div>
          <div className={`text-sm ${getChangeColor(data.changes.savingsChange)}`}>
            {data.changes.savingsChangePercentage > 0 ? '+' : ''}
            {formatPercentage(data.changes.savingsChangePercentage)}
          </div>
        </div>
      </div>
      <div className="h-96">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ComparisonBarChart;
