'use client';
import { createTheme, ThemeProvider, CssBaseline, responsiveFontSizes } from '@mui/material';
import { createContext, useEffect, useMemo, useState } from 'react';

export const ColorModeContext = createContext<{ 
  toggleColorMode: () => void; 
  mode: 'light' | 'dark'; 
}>({
  toggleColorMode: () => {},
  mode: 'light',
});

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Only run on the client after mounting
  useEffect(() => {
    setMounted(true);
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
        primary: {
          main: mode === 'light' ? '#0b2a4a' : '#4a90e2',
          light: mode === 'light' ? '#3d5a80' : '#7bb3f0',
          dark: mode === 'light' ? '#051220' : '#2c5aa0',
          contrastText: '#ffffff',
        },
        secondary: {
          main: mode === 'light' ? '#f6d860' : '#ffd93d',
          light: mode === 'light' ? '#f8e082' : '#ffe066',
          dark: mode === 'light' ? '#d4b942' : '#ccac00',
          contrastText: mode === 'light' ? '#000000' : '#000000',
        },
        warning: {
          main: mode === 'light' ? '#ff9800' : '#ffb74d',
          light: mode === 'light' ? '#ffb74d' : '#ffc947',
          dark: mode === 'light' ? '#f57c00' : '#ff8f00',
          contrastText: '#ffffff',
        },
        background: {
          default: mode === 'light' ? '#fafafa' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
          primary: mode === 'light' ? '#212121' : '#ffffff',
          secondary: mode === 'light' ? '#757575' : '#b3b3b3',
        },
        grey: {
          50: mode === 'light' ? '#fafafa' : '#2c2c2c',
          100: mode === 'light' ? '#f5f5f5' : '#3c3c3c',
          200: mode === 'light' ? '#eeeeee' : '#4c4c4c',
          300: mode === 'light' ? '#e0e0e0' : '#5c5c5c',
          400: mode === 'light' ? '#bdbdbd' : '#6c6c6c',
          500: mode === 'light' ? '#9e9e9e' : '#7c7c7c',
        },
        divider: mode === 'light' ? '#e0e0e0' : '#424242',
      },
      components: {
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderColor: mode === 'light' ? '#e0e0e0' : '#424242',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 500,
            },
          },
        },
      },
    });
    t = responsiveFontSizes(t);
    return t;
  }, [mode]);

  // Prevent rendering until mounted on client to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
