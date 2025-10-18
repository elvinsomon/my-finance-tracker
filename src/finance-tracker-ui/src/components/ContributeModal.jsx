import { useState, useEffect } from 'react';
import savingsGoalService from '../services/savingsGoalService';
import transactionService from '../services/transactionService';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

const ContributeModal = ({ goal, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    transactionId: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await transactionService.getAll({
        type: 'Income',
        pageSize: 20,
      });
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        transactionId: formData.transactionId || null,
        notes: formData.notes || null,
      };

      await savingsGoalService.addContribution(goal.id, payload);
      onClose(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const newAmount = parseFloat(formData.amount) || 0;
  const projectedAmount = goal.currentAmount + newAmount;
  const projectedPercentage = goal.targetAmount > 0
    ? Math.min((projectedAmount / goal.targetAmount) * 100, 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Contribution</h2>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{goal.icon || '🎯'}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                <p className="text-sm text-gray-600">
                  {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`
                }}
              />
            </div>
          </div>

          <ErrorAlert
            message={error?.message}
            errors={error?.errors}
            onClose={() => setError(null)}
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contribution Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              />
            </div>

            {newAmount > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Projected Progress</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(projectedAmount, goal.currency)} ({projectedPercentage.toFixed(1)}%)
                </p>
                {projectedAmount >= goal.targetAmount && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Goal will be completed!
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link to Transaction (Optional)
              </label>
              {loadingTransactions ? (
                <div className="flex justify-center py-2">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <select
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                >
                  <option value="">No transaction</option>
                  {transactions.map((transaction) => (
                    <option key={transaction.id} value={transaction.id}>
                      {transaction.description} - {formatCurrency(transaction.amount, transaction.currency)} ({new Date(transaction.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Optional notes about this contribution"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Add Contribution'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContributeModal;
