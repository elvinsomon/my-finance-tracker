import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, TrendingDown } from 'lucide-react';
import budgetService from '../services/budgetService';
import categoryService from '../services/categoryService';
import ErrorAlert from '../components/ErrorAlert';
import BudgetProgressBar from '../components/BudgetProgressBar';
import CurrencySelector from '../components/CurrencySelector';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const Budgets = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    period: 'Monthly',
    amount: '',
    currency: 'DOP',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    alertThreshold80: true,
    alertThreshold100: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll('Expense'),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      await budgetService.create(payload);
      setIsModalOpen(false);
      setFormData({
        categoryId: '',
        period: 'Monthly',
        amount: '',
        currency: 'DOP',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        alertThreshold80: true,
        alertThreshold100: true,
      });
      fetchData();
    } catch (err) {
      setError(err);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your monthly spending limits</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg px-4 py-2.5 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Budget
        </button>
      </motion.div>

      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      {budgets.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-glass border border-gray-200/50 dark:border-gray-700/50 p-12 text-center"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
            <TrendingDown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No budgets set</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Create your first budget
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              variants={itemVariants}
              custom={index}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-glass border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <BudgetProgressBar
                budgeted={budget.amount}
                spent={budget.spent}
                currency={budget.currency}
                categoryName={budget.categoryName}
              />
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Period:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{budget.period}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(budget.startDate).toLocaleDateString()} -{' '}
                    {new Date(budget.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl dark:text-white">New Budget</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Set a spending limit for a category to track your expenses
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="dark:text-gray-200">
                Category *
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleSelectChange('categoryId', value)}
              >
                <SelectTrigger id="categoryId" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period" className="dark:text-gray-200">
                Period *
              </Label>
              <Select
                value={formData.period}
                onValueChange={(value) => handleSelectChange('period', value)}
              >
                <SelectTrigger id="period" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="Monthly" className="dark:text-white dark:focus:bg-gray-600">
                    Monthly
                  </SelectItem>
                  <SelectItem value="Yearly" className="dark:text-white dark:focus:bg-gray-600">
                    Yearly
                  </SelectItem>
                  <SelectItem value="Custom" className="dark:text-white dark:focus:bg-gray-600">
                    Custom
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="dark:text-gray-200">
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="dark:text-gray-200">
                Currency *
              </Label>
              <CurrencySelector
                value={formData.currency}
                onChange={handleChange}
                name="currency"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="dark:text-gray-200">
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="dark:text-gray-200">
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alertThreshold80"
                  checked={formData.alertThreshold80}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('alertThreshold80', checked)
                  }
                  className="dark:border-gray-500"
                />
                <Label
                  htmlFor="alertThreshold80"
                  className="text-sm font-normal cursor-pointer dark:text-gray-200"
                >
                  Alert at 80% usage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alertThreshold100"
                  checked={formData.alertThreshold100}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('alertThreshold100', checked)
                  }
                  className="dark:border-gray-500"
                />
                <Label
                  htmlFor="alertThreshold100"
                  className="text-sm font-normal cursor-pointer dark:text-gray-200"
                >
                  Alert at 100% usage
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40">
                {formLoading ? 'Creating...' : 'Create Budget'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Budgets;
