import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import categoryService from '../services/categoryService';
import ErrorAlert from '../components/ErrorAlert';
import CategoryBadge from '../components/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const Categories = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Expense',
    icon: '',
    color: '#3b82f6',
    parentCategoryId: null,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTypeChange = (value) => {
    setFormData({
      ...formData,
      type: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await categoryService.create(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        type: 'Expense',
        icon: '',
        color: '#3b82f6',
        parentCategoryId: null,
      });
      fetchCategories();
    } catch (err) {
      setError(err);
    } finally {
      setFormLoading(false);
    }
  };

  const incomeCategories = categories.filter((c) => c.type === 'Income' && !c.parentCategoryId);
  const expenseCategories = categories.filter((c) => c.type === 'Expense' && !c.parentCategoryId);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: {
      y: -4,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your transactions with custom categories
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg px-4 py-2.5 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </motion.div>

      {/* Error Alert */}
      <ErrorAlert
        message={error?.message}
        errors={error?.errors}
        onClose={() => setError(null)}
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-glass border border-gray-200/50 dark:border-gray-700/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Income Categories
            </h2>
          </div>
          <div className="space-y-3">
            {incomeCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryBadge category={category} />
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2">
                    {category.subcategories.map((sub) => (
                      <CategoryBadge key={sub.id} category={sub} />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
            {incomeCategories.length === 0 && (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No income categories</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Create one to get started
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Expense Categories */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-glass border border-gray-200/50 dark:border-gray-700/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Expense Categories
            </h2>
          </div>
          <div className="space-y-3">
            {expenseCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryBadge category={category} />
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="ml-6 mt-2 space-y-2">
                    {category.subcategories.map((sub) => (
                      <CategoryBadge key={sub.id} category={sub} />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
            {expenseCategories.length === 0 && (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No expense categories</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Create one to get started
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Create Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              New Category
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Create a new category to organize your transactions
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter category name"
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
              />
            </div>

            {/* Type Field */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700 dark:text-gray-300 font-medium">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Icon Field */}
            <div className="space-y-2">
              <Label htmlFor="icon" className="text-gray-700 dark:text-gray-300 font-medium">
                Icon (Emoji)
              </Label>
              <Input
                id="icon"
                name="icon"
                type="text"
                value={formData.icon}
                onChange={handleChange}
                placeholder="e.g., 💰 🍔 🏠"
                maxLength={2}
                className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose an emoji to represent this category
              </p>
            </div>

            {/* Color Field */}
            <div className="space-y-2">
              <Label htmlFor="color" className="text-gray-700 dark:text-gray-300 font-medium">
                Color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="h-10 w-20 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  name="color"
                  placeholder="#3b82f6"
                  className="flex-1 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={formLoading}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40"
              >
                {formLoading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Category
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Categories;
