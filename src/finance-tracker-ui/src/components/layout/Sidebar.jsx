import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Receipt,
  Tag,
  PiggyBank,
  Wallet,
  BarChart3,
  Target,
  Upload,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

const NAVIGATION_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
  { path: '/categories', label: 'Categories', icon: Tag },
  { path: '/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/accounts', label: 'Accounts', icon: Wallet },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/savings-goals', label: 'Savings Goals', icon: Target },
  { path: '/import', label: 'Import CSV', icon: Upload },
  { path: '/category-rules', label: 'Category Rules', icon: Settings },
  { path: '/export', label: 'Export', icon: Download },
];

const Sidebar = ({ isCollapsed, isMobileOpen, onToggle, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null && !isMobileOpen) {
      const isCollapsedSaved = saved === 'true';
      if (isCollapsedSaved !== isCollapsed) {
        onToggle();
      }
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (mounted && !isMobileOpen) {
      localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
    }
  }, [isCollapsed, mounted, isMobileOpen]);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const sidebarVariants = {
    expanded: {
      width: '16rem', // 256px
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    collapsed: {
      width: '5rem', // 80px
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    mobile: {
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    mobileHidden: {
      x: '-100%',
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const NavigationItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    const content = (
      <Link
        to={item.path}
        onClick={() => isMobileOpen && onClose()}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-all duration-200 ease-in-out
          ${active
            ? 'bg-white/20 dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5'
          }
          ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}
        `}
      >
        {/* Active indicator */}
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full"
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 30
            }}
          />
        )}

        {/* Icon */}
        <Icon
          className={`
            flex-shrink-0 transition-all duration-200
            ${active ? 'scale-110' : 'group-hover:scale-105'}
          `}
          size={20}
          strokeWidth={active ? 2.5 : 2}
        />

        {/* Label */}
        <AnimatePresence>
          {(!isCollapsed || isMobileOpen) && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={`
                text-sm font-medium whitespace-nowrap overflow-hidden
                ${active ? 'font-semibold' : ''}
              `}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Hover glow effect */}
        {!active && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Link>
    );

    // Wrap in tooltip when collapsed on desktop
    if (isCollapsed && !isMobileOpen) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className="
          hidden lg:flex flex-col fixed left-0 top-0 h-screen z-30
          glass-strong border-r border-white/20 dark:border-white/10
        "
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 dark:border-white/5">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={18} />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  FinanceTracker
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="text-white" size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <NavigationItem key={item.path} item={item} />
            ))}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="px-3 py-4 border-t border-white/10 dark:border-white/5 space-y-2">
          {/* User Info */}
          <div
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg
              bg-white/10 dark:bg-white/5
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={16} />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email || ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Button */}
          {isCollapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          )}

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={`
              w-full transition-all duration-200
              hover:bg-white/10 dark:hover:bg-white/5
            `}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="mobileHidden"
        animate={isMobileOpen ? 'mobile' : 'mobileHidden'}
        className="
          lg:hidden fixed left-0 top-0 h-screen w-64 z-50
          glass-strong border-r border-white/20 dark:border-white/10
        "
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              FinanceTracker
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/10 dark:hover:bg-white/5"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4 h-[calc(100vh-8rem)]">
          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <NavigationItem key={item.path} item={item} />
            ))}
          </nav>
        </ScrollArea>

        {/* User Section */}
        <div className="px-3 py-4 border-t border-white/10 dark:border-white/5 space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 dark:bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
