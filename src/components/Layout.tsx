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
    { text: 'Awards', href: '/awards' },
    { text: 'FAQ', href: '/faq' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: 'url(/event%20wallpaper.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        zIndex: 0,
      },
      color: 'text.primary'
    }}>
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(135deg, #0b2a4a 0%, #1a365d 100%)',
        position: 'relative', 
        zIndex: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        '& .MuiTypography-root': {
          color: '#ffffff',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }
      }}>
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
              alt="UPA Summer Championship"
              sx={{
                height: 40,
                width: 'auto',
                mr: 1,
                display: { xs: 'none', sm: 'block' },
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' }, '&:hover': { opacity: 0.9 } }}>
              UPA Summer Championship
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
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box
              component="img"
              src="/UPA-Summer-Championships.png"
              alt="UPA Summer Championship"
              sx={{
                height: 40,
                width: 'auto',
                mx: 'auto',
                mb: 1,
                display: 'block',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>
              UPA Summer Championship
            </Typography>
          </Link>
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
      <Box component="main" sx={({ palette }) => ({
        flexGrow: 1, 
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: { xs: 0, sm: 2 },
        m: { xs: 0, sm: 2 },
        p: { xs: 2, sm: 3 },
        '@media (min-width: 900px)': {
          maxWidth: 1400,
          mx: 'auto',
          my: 3,
          p: 4,
          width: 'calc(100% - 48px)',
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          color: 'text.primary',
          fontWeight: 700,
          mb: 2,
          '&:not(:first-of-type)': {
            mt: 4
          }
        },
        '& p': {
          color: 'text.secondary',
          lineHeight: 1.7,
          mb: 2,
          fontSize: '1.05rem'
        },
        '& a': {
          color: 'primary.main',
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: 'primary.dark',
            textDecoration: 'underline',
          }
        },
        '& .MuiButton-contained': {
          background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
          color: 'white',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 2,
          px: 3,
          py: 1,
          '&:hover': {
            background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
            boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)'
          }
        },
        '& .MuiCard-root': {
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          }
        },
        '& .MuiPaper-root': {
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
        },
        '& .MuiTableContainer-root': {
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          '& .MuiTableHead-root': {
            backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'
          },
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: 'text.primary',
            backgroundColor: 'transparent'
          },
          '& .MuiTableBody-root .MuiTableRow-root': {
            '&:nth-of-type(odd)': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'
            },
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)'
            }
          }
        }
      })}>
        {children}
      </Box>
      <Box component="footer" sx={{ mt: 4, py: 3, backgroundColor: '#001F3F', color: 'white' }}>
        <Container>
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            &copy; {new Date().getFullYear()} UPA Summer Championship. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
