import { Menu, Sun, Moon, Bell, Search, ChevronRight, User, Settings, LogOut } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../lib/theme-provider';
import { useAuth } from '../../hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

const TopBar = ({ onMenuClick, isSidebarCollapsed }) => {
  const location = useLocation();
  const { effectiveTheme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Route mapping for breadcrumbs
  const routeMap = {
    '/': { label: 'Dashboard', parent: null },
    '/transactions': { label: 'Transactions', parent: '/' },
    '/categories': { label: 'Categories', parent: '/' },
    '/budgets': { label: 'Budgets', parent: '/' },
    '/accounts': { label: 'Accounts', parent: '/' },
    '/reports': { label: 'Reports', parent: '/' },
    '/savings-goals': { label: 'Savings Goals', parent: '/' },
    '/import': { label: 'Import', parent: '/' },
    '/category-rules': { label: 'Category Rules', parent: '/' },
    '/export': { label: 'Export', parent: '/' },
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathname = location.pathname;

    // Handle specific route patterns
    if (pathname.startsWith('/savings-goals/') && pathname !== '/savings-goals') {
      return [
        { label: 'Dashboard', path: '/' },
        { label: 'Savings Goals', path: '/savings-goals' },
        { label: 'Goal Details', path: pathname },
      ];
    }

    // Default route handling
    const currentRoute = routeMap[pathname];
    if (!currentRoute) {
      return [{ label: 'Dashboard', path: '/' }];
    }

    const breadcrumbs = [];
    let route = currentRoute;
    let path = pathname;

    // Build breadcrumb trail
    while (route) {
      breadcrumbs.unshift({ label: route.label, path });
      if (!route.parent) break;
      path = route.parent;
      route = routeMap[path];
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/50 dark:border-slate-700/50">
      {/* Glass effect background */}
      <div className="absolute inset-0 glass-strong backdrop-blur-xl" />

      {/* Content */}
      <div className="relative h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full gap-4">
          {/* Left Section: Mobile Menu + Breadcrumbs */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Breadcrumbs */}
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    {index > 0 && (
                      <BreadcrumbSeparator>
                        <ChevronRight className="w-4 h-4" />
                      </BreadcrumbSeparator>
                    )}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="text-slate-900 dark:text-slate-100 font-medium">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          asChild
                          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                          <Link to={crumb.path}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button (Placeholder) */}
            <button
              className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Search"
              title="Search (Coming Soon)"
            >
              <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
              title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-slate-400 hover:text-amber-400 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 hover:text-blue-600 transition-colors" />
              )}
            </button>

            {/* Notifications (Placeholder) */}
            <button
              className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label="Notifications"
              title="Notifications (Coming Soon)"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {/* Notification badge */}
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 sm:gap-3 p-1.5 sm:px-3 sm:py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="User menu"
                >
                  <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-strong">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                  <span className="ml-auto text-xs text-slate-400">Soon</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                  <span className="ml-auto text-xs text-slate-400">Soon</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
