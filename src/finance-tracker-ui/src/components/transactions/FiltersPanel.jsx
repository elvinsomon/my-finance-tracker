import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import DateRangePicker from '../DateRangePicker';
import {
  Filter,
  X,
  ChevronDown,
  Calendar,
  Tag,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
} from 'lucide-react';

const FiltersPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories = [],
  accounts = [],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== '' && value !== null && value !== undefined
  ).length;

  const handleClear = () => {
    onClearFilters();
    setIsOpen(false);
  };

  const typeOptions = [
    { value: '', label: 'All Types', icon: Filter },
    { value: 'Income', label: 'Income', icon: TrendingUp },
    { value: 'Expense', label: 'Expense', icon: TrendingDown },
    { value: 'Transfer', label: 'Transfer', icon: ArrowRightLeft },
  ];

  return (
    <div className={className}>
      {/* Mobile/Tablet: Collapsible panel */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-2 bg-blue-600">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>

        {isOpen && (
          <div className="mt-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg p-6 space-y-4">
            <FilterContent
              filters={filters}
              onFilterChange={onFilterChange}
              categories={categories}
              accounts={accounts}
              typeOptions={typeOptions}
            />
            <div className="flex gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex-1 bg-white/60 dark:bg-slate-800/60"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Always visible panel */}
      <div className="hidden lg:block rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Filters
            </h2>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="bg-blue-600">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        <FilterContent
          filters={filters}
          onFilterChange={onFilterChange}
          categories={categories}
          accounts={accounts}
          typeOptions={typeOptions}
        />
      </div>
    </div>
  );
};

const FilterContent = ({
  filters,
  onFilterChange,
  categories,
  accounts,
  typeOptions,
}) => {
  return (
    <div className="space-y-4">
      {/* Date Range */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Calendar className="h-4 w-4" />
          Date Range
        </Label>
        <DateRangePicker
          startDate={filters.startDate || ''}
          endDate={filters.endDate || ''}
          onStartDateChange={(value) => onFilterChange('startDate', value)}
          onEndDateChange={(value) => onFilterChange('endDate', value)}
        />
      </div>

      {/* Type Filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4" />
          Transaction Type
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {typeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = filters.type === option.value;

            return (
              <button
                key={option.value}
                onClick={() => onFilterChange('type', option.value)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{option.label}</span>
                {isSelected && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Tag className="h-4 w-4" />
          Category
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <span className="truncate">
                {filters.categoryId
                  ? categories.find((c) => c.id === filters.categoryId)?.name ||
                    'Select category'
                  : 'All Categories'}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
            <div className="max-h-[300px] overflow-y-auto">
              <button
                onClick={() => onFilterChange('categoryId', '')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  !filters.categoryId
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onFilterChange('categoryId', category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    filters.categoryId === category.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Account Filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Wallet className="h-4 w-4" />
          Account
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <span className="truncate">
                {filters.accountId
                  ? accounts.find((a) => a.id === filters.accountId)?.name ||
                    'Select account'
                  : 'All Accounts'}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
            <div className="max-h-[300px] overflow-y-auto">
              <button
                onClick={() => onFilterChange('accountId', '')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  !filters.accountId
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                All Accounts
              </button>
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => onFilterChange('accountId', account.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    filters.accountId === account.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {account.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FiltersPanel;
