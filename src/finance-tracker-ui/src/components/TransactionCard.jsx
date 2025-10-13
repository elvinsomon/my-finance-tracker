import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'Income';
  const isExpense = transaction.type === 'Expense';

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                isIncome
                  ? 'bg-income-100 text-income-700'
                  : isExpense
                  ? 'bg-expense-100 text-expense-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {transaction.type}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(transaction.date)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {transaction.description}
          </h3>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {transaction.categoryName && (
              <span className="flex items-center">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {transaction.categoryName}
              </span>
            )}
            {transaction.accountName && (
              <span className="flex items-center">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                {transaction.accountName}
              </span>
            )}
          </div>
        </div>
        <div className="text-right ml-4">
          <div
            className={`text-xl font-bold mb-2 ${
              isIncome ? 'text-income-600' : isExpense ? 'text-expense-600' : 'text-gray-900'
            }`}
          >
            {isIncome ? '+' : isExpense ? '-' : ''}
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="text-primary-600 hover:text-primary-800 text-sm"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
