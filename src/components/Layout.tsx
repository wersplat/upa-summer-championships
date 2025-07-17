'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { LightMode, DarkMode } from '@mui/icons-material';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(to right,#001F3F,#1E40AF)' }}>
        <Toolbar>
          <Typography component={Link} href="/" variant="h6" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 700 }}>
            UPA Summer Championships
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
            <Typography
              component={Link}
              href="/teams"
              sx={{
                color: pathname === '/teams' ? 'secondary.main' : 'inherit',
                textDecoration: 'none',
                borderBottom: 2,
                borderColor: pathname === '/teams' ? 'secondary.main' : 'transparent',
                px: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Teams
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 2 }}>{children}</Container>
      <Box component="footer" sx={{ mt: 4, py: 3, backgroundColor: '#001F3F', color: 'white' }}>
        <Container>
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            &copy; {new Date().getFullYear()} UPA Summer Championships. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
