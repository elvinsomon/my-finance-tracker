import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Subtle gradient orbs for depth */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Layout grid */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onToggle={toggleSidebar}
          onClose={closeMobileSidebar}
        />

        {/* Main content area */}
        <div
          className={`
            flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          `}
        >
          {/* Top Bar */}
          <TopBar
            onMenuClick={toggleMobileSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          {/* Page Content with transitions */}
          <main className="flex-1 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.15,
                  ease: "easeOut"
                }}
                className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
