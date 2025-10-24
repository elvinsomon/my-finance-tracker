import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const CsvPreviewTable = ({ transactions, categories, onCategoryChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions to preview
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  // Calculate summary
  const validCount = transactions.filter(t => t.isValid).length;
  const invalidCount = transactions.filter(t => !t.isValid).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {transactions.length}
            </div>
            <div className="text-sm text-gray-600">Total Rows</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {validCount}
            </div>
            <div className="text-sm text-gray-600">Valid</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {invalidCount}
            </div>
            <div className="text-sm text-gray-600">Invalid</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Row
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr
                  key={transaction.rowNumber}
                  className={`${
                    !transaction.isValid ? 'bg-red-50' : ''
                  } hover:bg-gray-50`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {transaction.rowNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transactionDate
                      ? formatDate(transaction.transactionDate)
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {transaction.description || '-'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.amount !== null && transaction.amount !== undefined
                      ? formatAmount(transaction.amount, transaction.currency)
                      : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {transaction.currency || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select
                      value={transaction.suggestedCategoryId || ''}
                      onChange={(e) => onCategoryChange(
                        transaction.rowNumber,
                        e.target.value
                      )}
                      disabled={!transaction.isValid}
                      className={`
                        text-sm rounded-md border-gray-300 shadow-sm
                        focus:border-blue-500 focus:ring-blue-500
                        ${!transaction.isValid ? 'opacity-50 cursor-not-allowed' : ''}
                        ${!transaction.suggestedCategoryId && transaction.isValid ? 'border-red-300' : ''}
                      `}
                    >
                      <option value="">Select category...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {transaction.isValid ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600" title={transaction.validationErrors?.join(', ')}>
                        <AlertCircle className="h-5 w-5" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length} rows
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors Summary */}
      {invalidCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">
            Validation Errors ({invalidCount} rows)
          </h4>
          <div className="space-y-1">
            {transactions
              .filter(t => !t.isValid)
              .slice(0, 5)
              .map((t) => (
                <div key={t.rowNumber} className="text-sm text-red-700">
                  <span className="font-medium">Row {t.rowNumber}:</span>{' '}
                  {t.validationErrors?.join(', ')}
                </div>
              ))}
            {invalidCount > 5 && (
              <div className="text-sm text-red-600 font-medium">
                ... and {invalidCount - 5} more errors
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvPreviewTable;
