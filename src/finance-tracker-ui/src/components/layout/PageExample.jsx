/**
 * Example demonstrating how pages render within MainLayout
 *
 * This component shows the proper structure for creating pages that
 * will be rendered inside the MainLayout with glassmorphism effects
 * and proper spacing.
 */

const PageExample = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Page Title
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Page description goes here
        </p>
      </div>

      {/* Content Cards with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Example 1 */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Card Title 1
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Card content goes here with glassmorphism effect
          </p>
        </div>

        {/* Card Example 2 */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Card Title 2
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Cards automatically get the glass effect from the background
          </p>
        </div>

        {/* Card Example 3 */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Card Title 3
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Hover effects enhance the user experience
          </p>
        </div>
      </div>

      {/* Large Content Area */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-xl p-8 shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Main Content Section
        </h2>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Pages are automatically wrapped with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
            <li>Fade + slide up animation on route change (250ms duration)</li>
            <li>Proper padding and max-width constraints</li>
            <li>Responsive spacing (p-4 sm:p-6 lg:p-8)</li>
            <li>Glass background with gradient overlay</li>
            <li>Sidebar (collapsible on desktop, overlay on mobile)</li>
            <li>TopBar with search, notifications, and user menu</li>
          </ul>
        </div>
      </div>

      {/* Recommended Class Patterns */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recommended Glass Card Classes
        </h3>
        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Glass card with light background
bg-white/70 dark:bg-slate-800/70
backdrop-blur-xl
border border-gray-200/50 dark:border-slate-700/50
rounded-xl
shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50
hover:shadow-xl transition-all duration-300

// Glass card with gradient accent
bg-gradient-to-br from-blue-500/10 to-purple-500/10
backdrop-blur-xl
border border-blue-200/50 dark:border-blue-700/50
rounded-xl`}
        </pre>
      </div>
    </div>
  );
};

export default PageExample;
