import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ItemsTable = ({ items, categories, onItemsChange, currency }) => {
  const [localItems, setLocalItems] = useState(items || []);

  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  const createEmptyItem = () => ({
    categoryId: null,
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    notes: '',
  });

  const handleAddItem = () => {
    const newItems = [...localItems, createEmptyItem()];
    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...localItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate totalAmount when quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : newItems[index].unitPrice;
      newItems[index].totalAmount = parseFloat((quantity * unitPrice).toFixed(2));
    }

    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  const calculateTotal = () => {
    return localItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const validateItem = (item) => {
    const errors = [];
    if (!item.description || item.description.trim() === '') {
      errors.push('Description is required');
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
    if (item.unitPrice < 0) {
      errors.push('Unit price cannot be negative');
    }
    const expectedTotal = parseFloat((item.quantity * item.unitPrice).toFixed(2));
    if (Math.abs(expectedTotal - item.totalAmount) > 0.01) {
      errors.push('Total amount mismatch');
    }
    return errors;
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">
          <thead className="bg-gray-100 dark:bg-slate-700">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                Category
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                Description
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 w-24">
                Quantity
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 w-28">
                Unit Price
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 w-28">
                Total
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 w-16">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {localItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No items added yet. Click "Add Item" to start.
                </td>
              </tr>
            ) : (
              localItems.map((item, index) => {
                const errors = validateItem(item);
                const hasErrors = errors.length > 0 && item.description.trim() !== '';

                return (
                  <tr key={index} className={hasErrors ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <Select
                        value={item.categoryId || ''}
                        onValueChange={(value) => handleItemChange(index, 'categoryId', value || null)}
                      >
                        <SelectTrigger className="w-full h-8 text-sm bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                          <SelectValue placeholder="Use transaction category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="" className="text-sm text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-slate-700">
                            Use transaction category
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="text-sm text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-slate-700"
                            >
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className={`w-full py-1 px-2 text-sm border rounded focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 ${
                          hasErrors ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        required
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="0.01"
                        step="0.01"
                        className="w-full py-1 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full py-1 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="py-1 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(item.totalAmount)}
                      </div>
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold text-lg"
                        title="Remove item"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <td colSpan="4" className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                Total:
              </td>
              <td className="px-3 py-2 font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(calculateTotal())}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Item
      </button>
    </div>
  );
};

export default ItemsTable;
