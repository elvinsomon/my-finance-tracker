import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../lib/utils';

const StatCard = ({
  title,
  value,
  currency = 'DOP',
  icon: Icon,
  trend,
  iconColor = 'from-blue-500 to-blue-600',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="relative h-[140px] overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative min-h-[160px] overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/20 dark:from-slate-800/50 dark:to-slate-900/20 pointer-events-none" />

      {/* Content */}
      <div className="relative h-full p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Icon with gradient background */}
          <div
            className={cn(
              "flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br shadow-lg",
              iconColor
            )}
          >
            {Icon && <Icon className="h-6 w-6 text-white" />}
          </div>

          {/* Trend indicator */}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                trend.isPositive
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Label and value */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight break-words">
            {formatCurrency(value, currency)}
          </p>
        </div>
      </div>

      {/* Bottom gradient accent */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60",
        iconColor
      )} />
    </motion.div>
  );
};

export default StatCard;
