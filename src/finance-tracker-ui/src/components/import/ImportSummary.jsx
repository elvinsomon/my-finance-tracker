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
