import Link from 'next/link';
import { Button, Typography, Box, Container } from '@mui/material';

export default function NotFound() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          p: 3,
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Player Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px' }}>
          We couldn't find the player you're looking for. The player may have been removed or the URL might be incorrect.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link}
            href="/players"
          >
            View All Players
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link}
            href="/"
          >
            Return Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
