import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import importService from '../services/importService';
import accountService from '../services/accountService';
import categoryService from '../services/categoryService';
import FileUploadDropzone from '../components/import/FileUploadDropzone';
import CsvPreviewTable from '../components/import/CsvPreviewTable';
import ImportSummary from '../components/import/ImportSummary';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { CheckCircle2 } from 'lucide-react';

const Import = () => {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Upload & Configure
  const [file, setFile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');

  // Step 2: Preview & Categorize
  const [uploadId, setUploadId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Step 3: Summary
  const [importSummary, setImportSummary] = useState(null);

  // Load accounts and categories on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [accountsData, categoriesData] = await Promise.all([
        accountService.getAll(),
        categoryService.getAll(),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Upload file
  const handleUpload = async () => {
    if (!file || !selectedAccountId || !selectedCurrency) {
      setError({
        message: 'Please select a file, account, and currency',
        errors: []
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await importService.uploadCsv(
        file,
        selectedAccountId,
        selectedCurrency
      );

      setUploadId(response.uploadId);
      setPreviewData(response);

      // Transform preview data to transactions format
      const transformedTransactions = response.preview.map((item) => ({
        rowNumber: item.rowNumber,
        transactionDate: item.date,
        description: item.description,
        amount: item.amount,
        currency: item.currency,
        externalReference: item.externalReference,
        suggestedCategoryId: null,
        isValid: item.isValid,
        validationErrors: item.validationErrors || []
      }));

      setTransactions(transformedTransactions);
      setCurrentStep(2);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle category change
  const handleCategoryChange = (rowNumber, categoryId) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.rowNumber === rowNumber
          ? { ...transaction, suggestedCategoryId: categoryId }
          : transaction
      )
    );
  };

  // Step 2: Proceed to summary
  const handleProceedToSummary = () => {
    // Check if all valid transactions have categories
    const validTransactions = transactions.filter(t => t.isValid);
    const missingCategories = validTransactions.filter(
      t => !t.suggestedCategoryId
    );

    if (missingCategories.length > 0) {
      setError({
        message: 'Please assign categories to all valid transactions',
        errors: [`${missingCategories.length} transactions are missing categories`]
      });
      return;
    }

    // Calculate summary
    const selectedAccount = accounts.find(a => a.id === selectedAccountId);
    const totalAmount = transactions
      .filter(t => t.isValid)
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by category
    const categoryGroups = transactions
      .filter(t => t.isValid && t.suggestedCategoryId)
      .reduce((groups, t) => {
        const categoryId = t.suggestedCategoryId;
        if (!groups[categoryId]) {
          groups[categoryId] = {
            categoryId,
            categoryName: categories.find(c => c.id === categoryId)?.name || 'Unknown',
            count: 0
          };
        }
        groups[categoryId].count++;
        return groups;
      }, {});

    const categoriesBreakdown = Object.values(categoryGroups);

    setImportSummary({
      totalTransactions: validTransactions.length,
      accountName: selectedAccount?.name || 'Unknown',
      currency: selectedCurrency,
      totalAmount,
      categoriesBreakdown,
      bankProfileName: previewData?.detectedBank,
      detectionConfidence: previewData?.confidence
    });

    setCurrentStep(3);
  };

  // Step 3: Confirm import
  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare category assignments as Dictionary<int, Guid>
      const categoryAssignments = transactions
        .filter(t => t.isValid && t.suggestedCategoryId)
        .reduce((dict, t) => {
          dict[t.rowNumber] = t.suggestedCategoryId;
          return dict;
        }, {});

      const response = await importService.confirmImport(
        uploadId,
        categoryAssignments
      );

      // Show success and redirect to transactions
      alert(`Successfully imported ${response.transactionsImported} transactions!`);
      navigate('/transactions');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation helpers
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this import? All progress will be lost.')) {
      navigate('/transactions');
    }
  };

  // Step progress indicator
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }
                `}
              >
                {step < currentStep ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  step
                )}
              </div>
              <div className="mt-2 text-xs font-medium text-gray-600">
                {step === 1 && 'Upload'}
                {step === 2 && 'Preview'}
                {step === 3 && 'Confirm'}
              </div>
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Import CSV</h1>
        <p className="text-gray-600 mt-2">
          Import transactions from your bank statement
        </p>
      </div>

      <StepIndicator />

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      {/* Step 1: Upload & Configure */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Step 1: Upload & Configure</h2>

          <div className="space-y-6">
            {/* Account Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Account <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                disabled={loading}
              >
                <option value="">Select an account...</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.accountType})
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                disabled={loading}
              >
                <option value="">Select currency...</option>
                <option value="DOP">DOP - Dominican Peso</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select the currency used in your CSV file
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File <span className="text-red-500">*</span>
              </label>
              <FileUploadDropzone
                onFileSelect={setFile}
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={loading || !file || !selectedAccountId || !selectedCurrency}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Next</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Categorize */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Step 2: Preview & Categorize</h2>

          {previewData?.detectedBank && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Detected Bank: {previewData.detectedBank}
                  </p>
                  <p className="text-xs text-blue-700">
                    Confidence: {Math.round(previewData.confidence * 100)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <CsvPreviewTable
            transactions={transactions}
            categories={categories}
            onCategoryChange={handleCategoryChange}
          />

          <div className="flex justify-between pt-6">
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleProceedToSummary}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm & Import */}
      {currentStep === 3 && (
        <div>
          <ImportSummary
            summary={importSummary}
            onConfirm={handleConfirmImport}
            onCancel={handleBack}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default Import;
