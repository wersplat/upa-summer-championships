'use client';
import { createTheme, ThemeProvider, CssBaseline, responsiveFontSizes } from '@mui/material';
import { createContext, useEffect, useMemo, useState } from 'react';

export const ColorModeContext = createContext<{ toggleColorMode: () => void; mode: 'light' | 'dark'; }>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleColorMode: () => {},
  mode: 'light',
});

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const isDark = saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setMode(isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleColorMode = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('darkMode', String(next === 'dark'));
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  const theme = useMemo(() => {
    let t = createTheme({
      palette: {
        mode,
        primary: { main: '#0b2a4a' },
        secondary: { main: '#f6d860' },
        background: {
          default: '#fefefe',
          paper: '#ffffff',
        },
      },
    });
    t = responsiveFontSizes(t);
    return t;
  }, [mode]);

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
