import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingPieChart = ({ data }) => {
  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        No spending data for this period
      </div>
    );
  }

  const chartData = {
    labels: data.categories.map(cat => `${cat.categoryName} (${cat.percentage.toFixed(1)}%)`),
    datasets: [
      {
        label: 'Spending',
        data: data.categories.map(cat => cat.totalAmount),
        backgroundColor: data.categories.map(cat => cat.color || '#3b82f6'),
        borderColor: '#ffffff',
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          },
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => ({
              text: `${data.categories[i].categoryName}: ${formatCurrency(data.categories[i].totalAmount)}`,
              fillStyle: datasets[0].backgroundColor[i],
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const category = data.categories[context.dataIndex];
            return [
              `Amount: ${formatCurrency(category.totalAmount)}`,
              `Percentage: ${category.percentage.toFixed(1)}%`,
              `Transactions: ${category.transactionCount}`
            ];
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Spending by Category
      </h3>
      <div className="text-sm text-gray-600 mb-4">
        Total Spending: <span className="font-semibold text-gray-900">{formatCurrency(data.totalSpending)}</span>
      </div>
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default SpendingPieChart;
