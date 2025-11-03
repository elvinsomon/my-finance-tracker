import { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import accountService from '../services/accountService';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import DateRangePicker from '../components/DateRangePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Export = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    categoryId: 'all',
    accountId: 'all',
  });

  useEffect(() => {
    fetchCategoriesAndAccounts();
  }, []);

  const fetchCategoriesAndAccounts = async () => {
    try {
      const [categoriesData, accountsData] = await Promise.all([
        categoryService.getAll(),
        accountService.getAll(),
      ]);
      setCategories(categoriesData);
      setAccounts(accountsData);
    } catch (err) {
      console.error('Failed to fetch categories/accounts:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      // Clean up filters - convert 'all' to empty string for the API
      const exportFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        type: filters.type === 'all' ? '' : filters.type,
        categoryId: filters.categoryId === 'all' ? '' : filters.categoryId,
        accountId: filters.accountId === 'all' ? '' : filters.accountId,
      };
      await transactionService.exportCSV(exportFilters);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Export Transactions</h1>
        <p className="text-gray-600 mt-2">
          Export your transactions to CSV format for analysis or backup
        </p>
      </div>

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Export Filters</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select filters to customize your export. Leave filters empty to export all transactions.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onStartDateChange={(value) => handleFilterChange('startDate', value)}
              onEndDateChange={(value) => handleFilterChange('endDate', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transaction Type
              </label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) => handleFilterChange('categoryId', value)}
              >
                <SelectTrigger className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account
              </label>
              <Select
                value={filters.accountId}
                onValueChange={(value) => handleFilterChange('accountId', value)}
              >
                <SelectTrigger className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Export Format</h3>
              <p className="text-sm text-gray-500 mt-1">
                CSV file compatible with Excel, Google Sheets, and other spreadsheet applications
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Exporting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export to CSV
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0"
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
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Export Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The CSV file will include all transaction details</li>
                <li>Dates will be in YYYY-MM-DD format</li>
                <li>Amounts will be in the original transaction currency</li>
                <li>The file name will include the current date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
