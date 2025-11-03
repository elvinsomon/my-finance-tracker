import { useState, useEffect } from 'react';
import savingsGoalService from '../services/savingsGoalService';
import transactionService from '../services/transactionService';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Contribution
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Add a contribution to track your progress towards this goal
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6 p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{goal.icon || '🎯'}</span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
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
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-900 dark:text-gray-100">
                Contribution Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            {newAmount > 0 && (
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Projected Progress</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(projectedAmount, goal.currency)} ({projectedPercentage.toFixed(1)}%)
                </p>
                {projectedAmount >= goal.targetAmount && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Goal will be completed!
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="transactionId" className="text-gray-900 dark:text-gray-100">
                Link to Transaction (Optional)
              </Label>
              {loadingTransactions ? (
                <div className="flex justify-center py-2">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <Select
                  name="transactionId"
                  value={formData.transactionId}
                  onValueChange={(value) => handleChange({ target: { name: 'transactionId', value } })}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <SelectValue placeholder="No transaction" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 max-h-[200px]">
                    <SelectItem value="" className="text-gray-900 dark:text-white">No transaction</SelectItem>
                    {transactions.map((transaction) => (
                      <SelectItem key={transaction.id} value={transaction.id} className="text-gray-900 dark:text-white">
                        {transaction.description} - {formatCurrency(transaction.amount, transaction.currency)} ({new Date(transaction.date).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-900 dark:text-gray-100">
                Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Optional notes about this contribution"
                className="flex min-h-[80px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Add Contribution'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContributeModal;
