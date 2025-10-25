import { useState, useEffect } from 'react';
import ErrorAlert from '../ErrorAlert';
import LoadingSpinner from '../LoadingSpinner';

const RuleModal = ({ isOpen, onClose, onSave, rule, categories }) => {
  const matchTypes = [
    { value: 0, label: 'Contains' },
    { value: 1, label: 'Starts With' },
    { value: 2, label: 'Ends With' },
    { value: 3, label: 'Exact Match' },
    { value: 4, label: 'Regex Pattern' }
  ];

  const [formData, setFormData] = useState({
    ruleName: '',
    categoryId: '',
    matchType: 0,
    pattern: '',
    caseSensitive: false,
    priority: 50
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rule) {
      setFormData({
        ruleName: rule.ruleName || '',
        categoryId: rule.categoryId || '',
        matchType: rule.matchType || 0,
        pattern: rule.pattern || '',
        caseSensitive: rule.caseSensitive || false,
        priority: rule.priority || 50
      });
    } else {
      setFormData({
        ruleName: '',
        categoryId: '',
        matchType: 0,
        pattern: '',
        caseSensitive: false,
        priority: 50
      });
    }
    setError(null);
  }, [rule, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    if (!formData.ruleName.trim()) {
      setError({ message: 'Rule name is required', errors: [] });
      return false;
    }
    if (!formData.categoryId) {
      setError({ message: 'Category is required', errors: [] });
      return false;
    }
    if (!formData.pattern.trim()) {
      setError({ message: 'Pattern is required', errors: [] });
      return false;
    }

    // Validate regex if match type is Regex
    if (parseInt(formData.matchType) === 4) {
      try {
        new RegExp(formData.pattern);
      } catch (e) {
        setError({ message: 'Invalid regex pattern', errors: [e.message] });
        return false;
      }
    }

    const priority = parseInt(formData.priority);
    if (isNaN(priority) || priority < 1 || priority > 100) {
      setError({ message: 'Priority must be between 1 and 100', errors: [] });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        matchType: parseInt(formData.matchType),
        priority: parseInt(formData.priority)
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {rule ? 'Edit Category Rule' : 'New Category Rule'}
            </h2>
            <button
              onClick={onClose}
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

          <ErrorAlert
            message={error?.message}
            errors={error?.errors}
            onClose={() => setError(null)}
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ruleName"
                value={formData.ruleName}
                onChange={handleChange}
                required
                placeholder="e.g., Supermarket Groceries"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              >
                <option value="">Select category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Type <span className="text-red-500">*</span>
              </label>
              <select
                name="matchType"
                value={formData.matchType}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              >
                {matchTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                How the pattern should match transaction descriptions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pattern <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pattern"
                value={formData.pattern}
                onChange={handleChange}
                required
                placeholder={
                  parseInt(formData.matchType) === 4
                    ? "^WALMART.*"
                    : "WALMART"
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {parseInt(formData.matchType) === 4
                  ? "Enter a valid regex pattern"
                  : "Text to match in transaction descriptions"}
              </p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="caseSensitive"
                  checked={formData.caseSensitive}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Case Sensitive
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                When enabled, "walmart" and "WALMART" will be treated differently
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {formData.priority}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Higher priority rules are evaluated first (1-100, default 50)
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{rule ? 'Update' : 'Create'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RuleModal;
