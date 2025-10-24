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

const CashflowAreaChart = ({ data }) => {
  if (!data || !data.months || data.months.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No cashflow data for this year
      </div>
    );
  }

  const cumulativeValues = data.months.map(month => month.cumulativeCashflow);
  const isPositive = (value) => value >= 0;

  const chartData = {
    labels: data.months.map(month => {
      try {
        return format(parseISO(month.month + '-01'), 'MMM');
      } catch {
        return month.month;
      }
    }),
    datasets: [
      {
        label: 'Cumulative Cashflow',
        data: cumulativeValues,
        borderColor: '#3b82f6',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          const value = cumulativeValues[context.dataIndex] || 0;
          if (isPositive(value)) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
          }
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: (context) => {
          const value = cumulativeValues[context.dataIndex] || 0;
          return isPositive(value) ? '#10b981' : '#ef4444';
        }
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
            const month = data.months[context.dataIndex];
            return [
              `Cumulative: ${formatCurrency(month.cumulativeCashflow)}`,
              `Income: ${formatCurrency(month.income)}`,
              `Expenses: ${formatCurrency(month.expenses)}`,
              `Net: ${formatCurrency(month.netCashflow)}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
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
        Cashflow Analysis - {data.year}
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-gray-600">Total Income</div>
          <div className="text-lg font-semibold text-green-700">
            {formatCurrency(data.totalIncome)}
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-gray-600">Total Expenses</div>
          <div className="text-lg font-semibold text-red-700">
            {formatCurrency(data.totalExpenses)}
          </div>
        </div>
        <div className={`${data.totalNetCashflow >= 0 ? 'bg-blue-50' : 'bg-red-50'} p-3 rounded-lg`}>
          <div className="text-gray-600">Net Cashflow</div>
          <div className={`text-lg font-semibold ${data.totalNetCashflow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(data.totalNetCashflow)}
          </div>
        </div>
      </div>
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CashflowAreaChart;
