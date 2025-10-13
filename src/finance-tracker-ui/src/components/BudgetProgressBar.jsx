import { formatCurrency } from '../utils/formatters';

const BudgetProgressBar = ({ budgeted, spent, currency, categoryName }) => {
  const percentageUsed = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const remaining = budgeted - spent;

  const getColorClass = () => {
    if (percentageUsed >= 100) return 'bg-expense-500';
    if (percentageUsed >= 80) return 'bg-yellow-500';
    return 'bg-income-500';
  };

  const getTextColorClass = () => {
    if (percentageUsed >= 100) return 'text-expense-600';
    if (percentageUsed >= 80) return 'text-yellow-600';
    return 'text-income-600';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{categoryName}</span>
        <span className={`text-sm font-semibold ${getTextColorClass()}`}>
          {percentageUsed.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div
          className={`h-4 rounded-full ${getColorClass()} transition-all duration-300`}
          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>
          Spent: {formatCurrency(spent, currency)}
        </span>
        <span>
          Budget: {formatCurrency(budgeted, currency)}
        </span>
      </div>
      <div className="text-xs text-gray-600 mt-1">
        Remaining: {formatCurrency(Math.max(remaining, 0), currency)}
      </div>
      {percentageUsed >= 100 && (
        <div className="mt-2 text-xs text-expense-600 font-semibold">
          Budget exceeded!
        </div>
      )}
      {percentageUsed >= 80 && percentageUsed < 100 && (
        <div className="mt-2 text-xs text-yellow-600 font-semibold">
          Warning: Approaching budget limit
        </div>
      )}
    </div>
  );
};

export default BudgetProgressBar;
