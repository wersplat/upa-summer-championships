'use client';

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { LightMode, DarkMode } from '@mui/icons-material';
import { ColorModeContext } from './MuiThemeProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { toggleColorMode, mode } = useContext(ColorModeContext);
  const pathname = usePathname();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(to right,#001F3F,#1E40AF)' }}>
        <Toolbar>
          <Typography component={Link} href="/" variant="h6" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 700 }}>
            UPA Summer Championships
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, mr: 2 }}>
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
            <Typography
              component={Link}
              href="/players"
              sx={{
                color: pathname === '/players' || pathname.startsWith('/players/') ? 'secondary.main' : 'inherit',
                textDecoration: 'none',
                borderBottom: 2,
                borderColor: pathname === '/players' || pathname.startsWith('/players/') ? 'secondary.main' : 'transparent',
                px: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Players
            </Typography>
            <Typography
              component={Link}
              href="/draft-pool"
              sx={{
                color: pathname === '/draft-pool' || pathname.startsWith('/draft-pool/') ? 'secondary.main' : 'inherit',
                textDecoration: 'none',
                borderBottom: 2,
                borderColor: pathname === '/draft-pool' || pathname.startsWith('/draft-pool/') ? 'secondary.main' : 'transparent',
                px: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Draft Pool
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={toggleColorMode} aria-label="Toggle dark mode">
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
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
