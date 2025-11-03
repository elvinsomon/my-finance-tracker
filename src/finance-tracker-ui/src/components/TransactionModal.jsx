import { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';
import CurrencySelector from './CurrencySelector';
import ItemsTable from './transaction/ItemsTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TransactionModal = ({ transaction, categories, accounts, onClose }) => {
  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    type: 'Expense',
    amount: '',
    currency: 'DOP',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: '',
    merchant: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        accountId: transaction.accountId || '',
        categoryId: transaction.categoryId || '',
        type: transaction.type || 'Expense',
        amount: transaction.amount || '',
        currency: transaction.currency || 'DOP',
        date: transaction.date || new Date().toISOString().split('T')[0],
        description: transaction.description || '',
        paymentMethod: transaction.paymentMethod || '',
        merchant: transaction.merchant || '',
        notes: transaction.notes || '',
      });

      // Load items if they exist
      if (transaction.items && transaction.items.length > 0) {
        setItems(transaction.items);
        setShowItems(true);
      }
    }
  }, [transaction]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate items total if items are present
    if (items.length > 0) {
      const itemsTotal = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
      const transactionAmount = parseFloat(formData.amount);

      if (Math.abs(itemsTotal - transactionAmount) > 0.01) {
        setError({
          message: `Items total (${formatCurrency(itemsTotal)}) must equal transaction amount (${formatCurrency(transactionAmount)})`,
          errors: ['Please adjust item amounts or transaction amount to match.'],
        });
        return;
      }

      // Validate each item
      const invalidItems = items.filter(
        (item) => !item.description || item.description.trim() === '' || item.quantity <= 0
      );

      if (invalidItems.length > 0) {
        setError({
          message: 'Invalid items detected',
          errors: ['All items must have a description and quantity greater than 0.'],
        });
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      // Include items in payload if present
      if (items.length > 0) {
        payload.items = items.map((item) => ({
          categoryId: item.categoryId || null,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          totalAmount: parseFloat(item.totalAmount),
          notes: item.notes || '',
        }));
      }

      if (transaction) {
        await transactionService.update(transaction.id, payload);
      } else {
        await transactionService.create(payload);
      }

      onClose(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {transaction ? 'Edit Transaction' : 'New Transaction'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {transaction ? 'Update transaction details' : 'Add a new financial transaction'}
          </DialogDescription>
        </DialogHeader>

        <ErrorAlert
          message={error?.message}
          errors={error?.errors}
          onClose={() => setError(null)}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-gray-700 dark:text-gray-300">
                Account *
              </Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                required
              >
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                  {accounts.map((account) => (
                    <SelectItem
                      key={account.id}
                      value={account.id}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-slate-700"
                    >
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-gray-700 dark:text-gray-300">
                Category *
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-slate-700"
                    >
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">
                Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="Income" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-slate-700">
                    Income
                  </SelectItem>
                  <SelectItem value="Expense" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-slate-700">
                    Expense
                  </SelectItem>
                  <SelectItem value="Transfer" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-slate-700">
                    Transfer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-700 dark:text-gray-300">
                Date *
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">
                Amount *
              </Label>
              <Input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-gray-700 dark:text-gray-300">
                Currency *
              </Label>
              <CurrencySelector
                value={formData.currency}
                onChange={handleChange}
                name="currency"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
              Description *
            </Label>
            <Input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Brief description"
              className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-gray-700 dark:text-gray-300">
                Payment Method
              </Label>
              <Input
                type="text"
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                placeholder="e.g., Credit Card, Cash"
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant" className="text-gray-700 dark:text-gray-300">
                Merchant
              </Label>
              <Input
                type="text"
                id="merchant"
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                placeholder="e.g., Store name"
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">
              Notes
            </Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes (optional)"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showItems}
                  onChange={(e) => {
                    setShowItems(e.target.checked);
                    if (!e.target.checked) {
                      setItems([]);
                    }
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                Add detailed items (optional)
              </label>
              {items.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {showItems && (
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <ItemsTable
                  items={items}
                  categories={categories}
                  onItemsChange={setItems}
                  currency={formData.currency}
                />
                {items.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <svg
                      className="h-4 w-4 text-blue-500 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Items total must match transaction amount above
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={loading}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Saving...
                </span>
              ) : (
                <span>{transaction ? 'Update' : 'Create'} Transaction</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
