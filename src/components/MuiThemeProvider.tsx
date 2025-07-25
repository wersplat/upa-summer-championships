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
          main: mode === 'light' ? '#0b2a4a' : '#5d9cec',
          light: mode === 'light' ? '#3d5a80' : '#85b8ff',
          dark: mode === 'light' ? '#051220' : '#3a6da7',
          contrastText: '#ffffff',
        },
        secondary: {
          main: mode === 'light' ? '#ffa000' : '#ffc107',
          light: mode === 'light' ? '#ffb74d' : '#ffd54f',
          dark: mode === 'light' ? '#f57c00' : '#ff8f00',
          contrastText: mode === 'light' ? '#000000' : '#000000',
        },
        warning: {
          main: mode === 'light' ? '#ff6d00' : '#ffb74d',
          light: mode === 'light' ? '#ff9e40' : '#ffc947',
          dark: mode === 'light' ? '#c43c00' : '#ff8f00',
          contrastText: '#ffffff',
        },
        background: {
          default: mode === 'light' ? '#f5f7fa' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
          primary: mode === 'light' ? '#1a1a1a' : '#ffffff',
          secondary: mode === 'light' ? '#424242' : '#e0e0e0',
          disabled: mode === 'light' ? '#9e9e9e' : '#7a7a7a',
        },
        grey: {
          50: mode === 'light' ? '#f8f9fa' : '#1e1e1e',
          100: mode === 'light' ? '#f1f3f5' : '#2d2d2d',
          200: mode === 'light' ? '#e9ecef' : '#3d3d3d',
          300: mode === 'light' ? '#dee2e6' : '#4d4d4d',
          400: mode === 'light' ? '#ced4da' : '#5e5e5e',
          500: mode === 'light' ? '#adb5bd' : '#7e7e7e',
          600: mode === 'light' ? '#868e96' : '#9e9e9e',
          700: mode === 'light' ? '#495057' : '#bdbdbd',
          800: mode === 'light' ? '#343a40' : '#e0e0e0',
          900: mode === 'light' ? '#212529' : '#f5f5f5',
        },
        divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, lineHeight: 1.2 },
        h2: { fontWeight: 700, lineHeight: 1.2 },
        h3: { fontWeight: 600, lineHeight: 1.3 },
        h4: { fontWeight: 600, lineHeight: 1.3 },
        h5: { fontWeight: 600, lineHeight: 1.4 },
        h6: { fontWeight: 600, lineHeight: 1.4 },
        body1: { lineHeight: 1.7 },
        body2: { lineHeight: 1.6 },
        button: { fontWeight: 600, textTransform: 'none' },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            'html, body': {
              backgroundColor: 'transparent',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            },
            a: {
              color: mode === 'light' ? '#1a56db' : '#5d9cec',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
              '&.MuiTableCell-head': {
                fontWeight: 700,
                color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '8px 16px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              },
            },
            contained: {
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              },
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
