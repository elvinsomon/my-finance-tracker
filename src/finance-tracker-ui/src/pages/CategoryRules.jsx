import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, FilterX } from 'lucide-react';
import categoryRuleService from '../services/categoryRuleService';
import categoryService from '../services/categoryService';
import RuleModal from '../components/import/RuleModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CategoryRules = () => {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rulesData, categoriesData] = await Promise.all([
        categoryRuleService.getAll(),
        categoryService.getAll()
      ]);
      setRules(rulesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedRule(null);
    setShowModal(true);
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await categoryRuleService.delete(id);
      await loadData();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (ruleData) => {
    try {
      if (selectedRule) {
        await categoryRuleService.update(selectedRule.id, ruleData);
      } else {
        await categoryRuleService.create(ruleData);
      }
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  const matchTypeLabels = {
    0: 'Contains',
    1: 'Starts With',
    2: 'Ends With',
    3: 'Exact',
    4: 'Regex'
  };

  const matchTypeBadgeColors = {
    0: 'bg-blue-100 text-blue-800',
    1: 'bg-purple-100 text-purple-800',
    2: 'bg-pink-100 text-pink-800',
    3: 'bg-green-100 text-green-800',
    4: 'bg-orange-100 text-orange-800'
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '';
  };

  // Filter rules
  const filteredRules = filterCategory && filterCategory !== 'all'
    ? rules.filter(r => r.categoryId === filterCategory)
    : rules;

  // Paginate
  const totalPages = Math.ceil(filteredRules.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRules = filteredRules.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Category Rules</h1>
        <p className="text-gray-600 mt-2">
          Manage automatic categorization rules for imported transactions
        </p>
      </div>

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">
              Filter by Category:
            </label>
            <Select
              value={filterCategory}
              onValueChange={(value) => setFilterCategory(value)}
            >
              <SelectTrigger className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm w-[200px] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
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
            {filterCategory && filterCategory !== 'all' && (
              <button
                onClick={() => setFilterCategory('all')}
                className="text-gray-400 hover:text-gray-600"
                title="Clear filter"
              >
                <FilterX className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Rule
          </button>
        </div>
      </div>

      {/* Rules Table */}
      {loading && !rules.length ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No rules found
          </h3>
          <p className="text-gray-600 mb-4">
            {filterCategory && filterCategory !== 'all'
              ? 'No rules for the selected category'
              : 'Create your first category rule to automatically categorize imported transactions'}
          </p>
          {(!filterCategory || filterCategory === 'all') && (
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Rule
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pattern
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matches
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto-Gen
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rule.ruleName}
                      </div>
                      {rule.caseSensitive && (
                        <div className="text-xs text-gray-500 mt-1">
                          Case sensitive
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {getCategoryIcon(rule.categoryId)} {getCategoryName(rule.categoryId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${matchTypeBadgeColors[rule.matchType]}`}>
                        {matchTypeLabels[rule.matchType]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded font-mono">
                        {rule.pattern}
                      </code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${rule.priority}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{rule.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 text-gray-400 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {rule.matchCount || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {rule.isAutoGenerated && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Auto
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredRules.length)} of {filteredRules.length} rules
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rule Modal */}
      <RuleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        rule={selectedRule}
        categories={categories}
      />
    </div>
  );
};

export default CategoryRules;
