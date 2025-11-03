import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../lib/theme-provider';

export default function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center gap-2 glass-card p-2">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${theme === value
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/80'
            }
          `}
          title={label}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
      <div className="ml-2 text-xs text-slate-600 dark:text-slate-400">
        {effectiveTheme === 'dark' ? 'Dark' : 'Light'}
      </div>
    </div>
  );
}
