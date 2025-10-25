import { FileText, DollarSign, Calendar, Building2 } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const ImportSummary = ({ summary, onConfirm, onCancel, loading }) => {
  if (!summary) {
    return (
      <div className="text-center py-8 text-gray-500">
        No summary available
      </div>
    );
  }

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Main Summary Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Import Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Total Transactions */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Transactions</div>
              <div className="text-2xl font-bold text-gray-900">
                {summary.totalTransactions}
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Account</div>
              <div className="text-lg font-semibold text-gray-900">
                {summary.accountName}
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatAmount(summary.totalAmount, summary.currency)}
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Currency</div>
              <div className="text-lg font-semibold text-gray-900">
                {summary.currency}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        {summary.categoriesBreakdown && summary.categoriesBreakdown.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Breakdown by Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.categoriesBreakdown.map((category, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {category.categoryName}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate Detection Info */}
        {(summary.duplicatesSkipped > 0 || summary.duplicatesOverridden > 0) && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Duplicate Detection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.duplicatesSkipped > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-yellow-900">
                      {summary.duplicatesSkipped} Duplicate{summary.duplicatesSkipped !== 1 ? 's' : ''} Skipped
                    </div>
                    <div className="text-xs text-yellow-700">
                      Will not be imported
                    </div>
                  </div>
                </div>
              )}
              {summary.duplicatesOverridden > 0 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      {summary.duplicatesOverridden} Override{summary.duplicatesOverridden !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-blue-700">
                      Will be imported anyway
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bank Profile Info */}
        {summary.bankProfileName && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">Detected Bank:</span>
              <span className="ml-2">{summary.bankProfileName}</span>
              {summary.detectionConfidence && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {Math.round(summary.detectionConfidence * 100)}% confidence
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Importing...</span>
            </>
          ) : (
            <span>Confirm Import</span>
          )}
        </button>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Once you confirm, these transactions will be added to your account.
          Make sure all the information is correct before proceeding.
        </p>
      </div>
    </div>
  );
};

export default ImportSummary;
