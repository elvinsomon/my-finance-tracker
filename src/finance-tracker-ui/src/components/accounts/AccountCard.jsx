import { motion } from 'framer-motion';
import { Building2, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

const AccountCard = ({ account }) => {
  const getAccountIcon = (type) => {
    const icons = {
      Bank: Building2,
      CreditCard: CreditCard,
      Cash: Wallet,
      DigitalWallet: Smartphone,
    };
    return icons[type] || Building2;
  };

  const getIconColor = (type) => {
    const colors = {
      Bank: 'from-blue-500 to-blue-600',
      CreditCard: 'from-purple-500 to-purple-600',
      Cash: 'from-emerald-500 to-emerald-600',
      DigitalWallet: 'from-indigo-500 to-indigo-600',
    };
    return colors[type] || 'from-blue-500 to-blue-600';
  };

  const Icon = getAccountIcon(account.type);
  const iconColor = getIconColor(account.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative h-full overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-depth-sm hover:shadow-depth-lg transition-shadow duration-300"
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/20 dark:from-slate-800/50 dark:to-slate-900/20 pointer-events-none" />

      {/* Content */}
      <div className="relative h-full p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Icon with gradient background */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={cn(
                'flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br shadow-lg',
                iconColor
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {account.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{account.type}</p>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            variant={account.isActive ? 'default' : 'secondary'}
            className={cn(
              account.isActive
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            )}
          >
            {account.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4 space-y-3">
          {/* Current Balance */}
          <div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Current Balance
            </span>
            <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              {formatCurrency(account.currentBalance, account.currency)}
            </p>
          </div>

          {/* Institution */}
          {account.institution && (
            <div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Institution
              </span>
              <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                {account.institution}
              </p>
            </div>
          )}

          {/* Account Number */}
          {account.accountNumber && (
            <div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Account Number
              </span>
              <p className="text-sm font-medium text-slate-900 dark:text-white font-mono mt-0.5">
                {account.accountNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient accent */}
      <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60', iconColor)} />
    </motion.div>
  );
};

export default AccountCard;
