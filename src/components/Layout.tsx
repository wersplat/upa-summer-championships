'use client';

import { useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { LightMode, DarkMode, Menu as MenuIcon } from '@mui/icons-material';
import { ColorModeContext } from './MuiThemeProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { toggleColorMode, mode } = useContext(ColorModeContext);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Bracket', href: '/bracket' },
    { text: 'Teams', href: '/teams' },
    { text: 'Players', href: '/players' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(to right,#001F3F,#1E40AF)' }}>
        <Toolbar>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            <Box
              component="img"
              src="/UPA-Summer-Championships.png"
              alt="UPA Summer Championships"
              sx={{
                height: 40,
                width: 'auto',
                mr: 1,
                display: { xs: 'none', sm: 'block' }
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' } }}>
              UPA Summer Championships
            </Typography>
          </Box>
          
          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, mr: 2 }}>
            {menuItems.map((item) => (
              <Typography
                key={item.href}
                component={Link}
                href={item.href}
                sx={{
                  color: pathname === item.href || pathname.startsWith(item.href + '/') ? 'secondary.main' : 'inherit',
                  textDecoration: 'none',
                  borderBottom: 2,
                  borderColor: pathname === item.href || pathname.startsWith(item.href + '/') ? 'secondary.main' : 'transparent',
                  px: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {item.text}
              </Typography>
            ))}
          </Box>
          
          <IconButton color="inherit" onClick={toggleColorMode} aria-label="Toggle dark mode">
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <Box
              component="img"
              src="/UPA-Summer-Championships.png"
              alt="UPA Summer Championships"
              sx={{
                height: 60,
                width: 'auto',
                mb: 1
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
              UPA Summer Championships
            </Typography>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    textAlign: 'center',
                    backgroundColor: pathname === item.href || pathname.startsWith(item.href + '/') ? 'primary.light' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  <ListItemText 
                    primary={item.text} 
                    sx={{
                      color: pathname === item.href || pathname.startsWith(item.href + '/') ? 'primary.main' : 'text.primary',
                      fontWeight: pathname === item.href || pathname.startsWith(item.href + '/') ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <IconButton onClick={toggleColorMode} aria-label="Toggle dark mode">
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>
        </Box>
      </Drawer>
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
