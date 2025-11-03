import { useEffect } from 'react';
import useThemeStore from './theme-store';

export function ThemeProvider({ children }) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    const cleanup = initializeTheme();
    return cleanup;
  }, [initializeTheme]);

  return <>{children}</>;
}

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const effectiveTheme = useThemeStore((state) => state.effectiveTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  };
}
