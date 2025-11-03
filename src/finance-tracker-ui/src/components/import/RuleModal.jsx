import { useState, useEffect } from 'react';
import ErrorAlert from '../ErrorAlert';
import LoadingSpinner from '../LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {rule ? 'Edit Category Rule' : 'New Category Rule'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {rule
              ? 'Update the automatic categorization rule'
              : 'Create a rule to automatically categorize transactions based on patterns'}
          </DialogDescription>
        </DialogHeader>

        <ErrorAlert
          message={error?.message}
          errors={error?.errors}
          onClose={() => setError(null)}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName" className="text-gray-900 dark:text-gray-100">
                Rule Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ruleName"
                name="ruleName"
                value={formData.ruleName}
                onChange={handleChange}
                required
                placeholder="e.g., Supermarket Groceries"
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-gray-900 dark:text-gray-100">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onValueChange={(value) => handleChange({ target: { name: 'categoryId', value } })}
              >
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 max-h-[200px]">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-gray-900 dark:text-white">
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matchType" className="text-gray-900 dark:text-gray-100">
                Match Type <span className="text-red-500">*</span>
              </Label>
              <Select
                name="matchType"
                value={formData.matchType.toString()}
                onValueChange={(value) => handleChange({ target: { name: 'matchType', value } })}
              >
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                  {matchTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value.toString()} className="text-gray-900 dark:text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                How the pattern should match transaction descriptions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern" className="text-gray-900 dark:text-gray-100">
                Pattern <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pattern"
                name="pattern"
                value={formData.pattern}
                onChange={handleChange}
                required
                placeholder={
                  parseInt(formData.matchType) === 4
                    ? "^WALMART.*"
                    : "WALMART"
                }
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {parseInt(formData.matchType) === 4
                  ? "Enter a valid regex pattern"
                  : "Text to match in transaction descriptions"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="caseSensitive"
                checked={formData.caseSensitive}
                onCheckedChange={(checked) => handleChange({ target: { name: 'caseSensitive', type: 'checkbox', checked } })}
                className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
              />
              <div>
                <label
                  htmlFor="caseSensitive"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Case Sensitive
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  When enabled, "walmart" and "WALMART" will be treated differently
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-gray-900 dark:text-gray-100">
                Priority <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center space-x-4">
                <input
                  id="priority"
                  type="range"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
                  {formData.priority}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Higher priority rules are evaluated first (1-100, default 50)
              </p>
            </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <span>{rule ? 'Update Rule' : 'Create Rule'}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RuleModal;
