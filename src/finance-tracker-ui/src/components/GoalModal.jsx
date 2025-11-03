import { useState, useEffect } from 'react';
import savingsGoalService from '../services/savingsGoalService';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';
import CurrencySelector from './CurrencySelector';
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
import { Checkbox } from './ui/checkbox';

const GoalModal = ({ goal, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currency: 'DOP',
    targetDate: '',
    priority: 3,
    icon: '🎯',
    color: '#3B82F6',
    isEmergencyFund: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const iconOptions = [
    '🎯', '💰', '🏠', '🚗', '✈️', '🎓', '💍', '🏖️', '🎁', '💻',
    '📱', '🏥', '👶', '🐕', '🎸', '📚', '⚽', '🎨', '🍕', '☕',
  ];

  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
  ];

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        description: goal.description || '',
        targetAmount: goal.targetAmount || '',
        currency: goal.currency || 'DOP',
        targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
        priority: goal.priority || 3,
        icon: goal.icon || '🎯',
        color: goal.color || '#3B82F6',
        isEmergencyFund: goal.isEmergencyFund || false,
      });
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        priority: parseInt(formData.priority),
      };

      if (goal) {
        await savingsGoalService.update(goal.id, payload);
      } else {
        await savingsGoalService.create(payload);
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
            {goal ? 'Edit Savings Goal' : 'New Savings Goal'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {goal ? 'Update your savings goal details' : 'Create a new savings goal to track your progress'}
          </DialogDescription>
        </DialogHeader>

        <ErrorAlert
          message={error?.message}
          errors={error?.errors}
          onClose={() => setError(null)}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 dark:text-gray-100">
                Goal Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Emergency Fund, New Car, Vacation"
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-gray-100">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                placeholder="Optional description of your goal"
                className="flex min-h-[60px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-gray-900 dark:text-gray-100">
                  Target Amount *
                </Label>
                <Input
                  id="targetAmount"
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-gray-900 dark:text-gray-100">
                  Currency *
                </Label>
                <CurrencySelector
                  value={formData.currency}
                  onChange={handleChange}
                  name="currency"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate" className="text-gray-900 dark:text-gray-100">
                  Target Date
                </Label>
                <Input
                  id="targetDate"
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-gray-900 dark:text-gray-100">
                  Priority (1-5)
                </Label>
                <Select
                  name="priority"
                  value={formData.priority.toString()}
                  onValueChange={(value) => handleChange({ target: { name: 'priority', value } })}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="1" className="text-gray-900 dark:text-white">1 - Low</SelectItem>
                    <SelectItem value="2" className="text-gray-900 dark:text-white">2</SelectItem>
                    <SelectItem value="3" className="text-gray-900 dark:text-white">3 - Medium</SelectItem>
                    <SelectItem value="4" className="text-gray-900 dark:text-white">4</SelectItem>
                    <SelectItem value="5" className="text-gray-900 dark:text-white">5 - High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Icon</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white/50 dark:bg-slate-800/50 text-left flex items-center gap-2"
                  >
                    <span className="text-2xl">{formData.icon}</span>
                    <span className="text-gray-600 dark:text-gray-400">Select icon</span>
                  </button>
                  {showIconPicker && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2">
                      <div className="grid grid-cols-5 gap-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, icon });
                              setShowIconPicker(false);
                            }}
                            className={`text-2xl p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 ${
                              formData.icon === icon ? 'bg-blue-100 dark:bg-blue-900' : ''
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-md border-2 ${
                        formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'
                      } transition-transform`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isEmergencyFund"
                checked={formData.isEmergencyFund}
                onCheckedChange={(checked) => handleChange({ target: { name: 'isEmergencyFund', type: 'checkbox', checked } })}
                className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
              />
              <label
                htmlFor="isEmergencyFund"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Mark as Emergency Fund (high priority savings)
              </label>
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
                {loading ? <LoadingSpinner size="sm" /> : goal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;
