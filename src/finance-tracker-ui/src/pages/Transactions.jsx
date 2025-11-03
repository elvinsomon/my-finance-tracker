import { useState, useEffect } from 'react';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import accountService from '../services/accountService';
import ErrorAlert from '../components/ErrorAlert';
import TransactionModal from '../components/TransactionModal';
import TransactionsTable from '../components/transactions/TransactionsTable';
import FiltersPanel from '../components/transactions/FiltersPanel';
import { Plus } from 'lucide-react';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    categoryId: '',
    accountId: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    fetchCategoriesAndAccounts();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params, excluding pagination for client-side table
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.accountId) params.accountId = filters.accountId;

      // Fetch all matching transactions (or use large page size)
      const response = await transactionService.getAll({
        page: 1,
        pageSize: 1000, // Get all transactions for client-side pagination
        ...params,
      });

      setTransactions(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      categoryId: '',
      accountId: '',
    });
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (transaction) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionService.delete(transaction.id);
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  const handleBulkDelete = async (transactionIds) => {
    try {
      // Delete transactions one by one (or implement bulk delete endpoint)
      await Promise.all(
        transactionIds.map((id) => transactionService.delete(id))
      );
      fetchData();
    } catch (err) {
      setError(err);
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    if (shouldRefresh) {
      fetchData();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track all your financial transactions
          </p>
        </div>
          <button
            onClick={handleNewTransaction}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg px-4 py-2.5 flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            New Transaction
          </button>
      </div>

      {/* Error Alert */}
      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel - Left Sidebar on Desktop */}
        <div className="lg:col-span-1">
          <FiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            categories={categories}
            accounts={accounts}
          />
        </div>

        {/* Transactions Table - Main Content */}
        <div className="lg:col-span-3">
          <TransactionsTable
            data={transactions}
            loading={loading}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onBulkDelete={handleBulkDelete}
          />
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          transaction={selectedTransaction}
          categories={categories}
          accounts={accounts}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Transactions;
