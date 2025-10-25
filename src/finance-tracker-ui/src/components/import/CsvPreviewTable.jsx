import { useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

const CsvPreviewTable = ({ transactions, categories, onCategoryChange, onOverrideChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'new', 'duplicates'
  const pageSize = 20;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions to preview
      </div>
    );
  }

  // Duplicate status enums
  const DuplicateStatus = {
    New: 0,
    LikelyDuplicate: 1,
    ConfirmedDuplicate: 2
  };

  // Filter transactions based on status
  const filteredTransactions = statusFilter === 'all'
    ? transactions
    : statusFilter === 'new'
    ? transactions.filter(t => t.duplicateStatus === DuplicateStatus.New)
    : transactions.filter(t => t.duplicateStatus === DuplicateStatus.LikelyDuplicate || t.duplicateStatus === DuplicateStatus.ConfirmedDuplicate);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Calculate summary
  const validCount = transactions.filter(t => t.isValid).length;
  const invalidCount = transactions.filter(t => !t.isValid).length;
  const newCount = transactions.filter(t => t.duplicateStatus === DuplicateStatus.New).length;
  const likelyDuplicateCount = transactions.filter(t => t.duplicateStatus === DuplicateStatus.LikelyDuplicate).length;
  const confirmedDuplicateCount = transactions.filter(t => t.duplicateStatus === DuplicateStatus.ConfirmedDuplicate).length;
  const duplicatesCount = likelyDuplicateCount + confirmedDuplicateCount;

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

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
          High {(confidence * 100).toFixed(0)}%
        </span>
      );
    } else if (confidence >= 0.7) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
          Medium {(confidence * 100).toFixed(0)}%
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
          Low {(confidence * 100).toFixed(0)}%
        </span>
      );
    }
  };

  const getDuplicateStatusBadge = (transaction) => {
    if (transaction.duplicateStatus === DuplicateStatus.New) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
          New
        </span>
      );
    } else if (transaction.duplicateStatus === DuplicateStatus.LikelyDuplicate) {
      return (
        <span
          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded cursor-help"
          title={transaction.duplicateReason || 'Similar transaction found'}
        >
          Likely Duplicate
        </span>
      );
    } else if (transaction.duplicateStatus === DuplicateStatus.ConfirmedDuplicate) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
          Confirmed Duplicate
        </span>
      );
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : null;
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '';
  };

  const handleOverrideToggle = (rowNumber, override) => {
    if (onOverrideChange) {
      onOverrideChange(rowNumber, override);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {transactions.length}
            </div>
            <div className="text-sm text-gray-600">Total Rows</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {newCount}
            </div>
            <div className="text-sm text-gray-600">New</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {duplicatesCount}
            </div>
            <div className="text-sm text-gray-600">Duplicates</div>
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

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Show:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm"
          >
            <option value="all">All Transactions ({transactions.length})</option>
            <option value="new">Only New ({newCount})</option>
            <option value="duplicates">Only Duplicates ({duplicatesCount})</option>
          </select>
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
                  Status
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
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Override
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => {
                const isDuplicate = transaction.duplicateStatus === DuplicateStatus.LikelyDuplicate ||
                                   transaction.duplicateStatus === DuplicateStatus.ConfirmedDuplicate;
                const isOverridden = transaction.overrideDuplicate === true;

                return (
                  <tr
                    key={transaction.rowNumber}
                    className={`${
                      !transaction.isValid
                        ? 'bg-red-50'
                        : isDuplicate && !isOverridden
                        ? 'bg-gray-50'
                        : isOverridden
                        ? 'bg-blue-50'
                        : ''
                    } hover:bg-gray-100 ${
                      isDuplicate && !isOverridden ? 'opacity-75' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.rowNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getDuplicateStatusBadge(transaction)}
                      {transaction.duplicateTransactionId && (
                        <a
                          href={`/transactions?highlight=${transaction.duplicateTransactionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          title="View existing transaction"
                        >
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {transaction.transactionDate
                        ? formatDate(transaction.transactionDate)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      <div className={isDuplicate && !isOverridden ? 'line-through' : ''}>
                        {transaction.description || '-'}
                      </div>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                      transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      <div className={isDuplicate && !isOverridden ? 'line-through' : ''}>
                        {transaction.amount !== null && transaction.amount !== undefined
                          ? formatAmount(transaction.amount, transaction.currency)
                          : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.suggestedCategoryId && transaction.categorySuggestion ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {getCategoryIcon(transaction.suggestedCategoryId)}{' '}
                              {getCategoryName(transaction.suggestedCategoryId)}
                            </span>
                            {getConfidenceBadge(transaction.categorySuggestion.confidence)}
                          </div>
                          {transaction.categorySuggestion.matchedRuleName && (
                            <div className="text-xs text-gray-500">
                              Rule: {transaction.categorySuggestion.matchedRuleName}
                            </div>
                          )}
                          <select
                            value={transaction.suggestedCategoryId || ''}
                            onChange={(e) => onCategoryChange(
                              transaction.rowNumber,
                              e.target.value
                            )}
                            disabled={!transaction.isValid}
                            className="text-xs w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mt-1"
                          >
                            <option value="">Change category...</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.icon} {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
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
                              {category.icon} {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isDuplicate && (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isOverridden}
                            onChange={(e) => handleOverrideToggle(transaction.rowNumber, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-700">
                            Import Anyway
                          </span>
                        </label>
                      )}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} rows
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
