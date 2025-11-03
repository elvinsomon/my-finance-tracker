import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      effectiveTheme: 'light',

      setTheme: (newTheme) => {
        set({ theme: newTheme });
        get().applyTheme(newTheme);
      },

      toggleTheme: () => {
        const current = get().effectiveTheme;
        const newTheme = current === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        get().applyTheme(newTheme);
      },

      applyTheme: (theme) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        let effectiveTheme = theme;

        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          effectiveTheme = systemTheme;
        }

        root.classList.add(effectiveTheme);
        set({ effectiveTheme });
      },

      initializeTheme: () => {
        const storedTheme = get().theme;
        get().applyTheme(storedTheme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          if (get().theme === 'system') {
            get().applyTheme('system');
          }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      },
    }),
    {
      name: 'finance-tracker-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
