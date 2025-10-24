import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TopExpensesTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'amount', direction: 'desc' });

  if (!data || !data.topExpenses || data.topExpenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Expenses
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No expenses for this period
        </div>
      </div>
    );
  }

  const sortedExpenses = [...data.topExpenses].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (sortConfig.key === 'date') {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
    }

    // String comparison for other fields
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    if (sortConfig.direction === 'asc') {
      return aStr > bStr ? 1 : -1;
    }
    return aStr < bStr ? 1 : -1;
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">⇅</span>;
    }
    return <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Top {data.topExpenses.length} Expenses
        </h3>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{formatCurrency(data.totalAmount)}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                Date <SortIcon columnKey="date" />
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('description')}
              >
                Description <SortIcon columnKey="description" />
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('categoryName')}
              >
                Category <SortIcon columnKey="categoryName" />
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('accountName')}
              >
                Account <SortIcon columnKey="accountName" />
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                Amount <SortIcon columnKey="amount" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedExpenses.map((expense, index) => (
              <tr key={expense.transactionId || index} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={expense.description}>
                    {expense.description}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {expense.categoryName}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.accountName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-right text-red-600">
                  {formatCurrency(expense.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopExpensesTable;
