import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper 
} from '@mui/material';
import { SportsBasketball as BasketballIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function DraftPoolNotFound() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper 
        sx={{ 
          p: 6, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <BasketballIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom color="primary.main">
            404
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Draft Pool Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The draft pool page you're looking for doesn't exist or may have been moved.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            component={Link} 
            href="/draft-pool" 
            variant="contained" 
            size="large"
          >
            Go to Draft Pool
          </Button>
          <Button 
            component={Link} 
            href="/players" 
            variant="outlined" 
            size="large"
          >
            View All Players
          </Button>
          <Button 
            component={Link} 
            href="/" 
            variant="text" 
            size="large"
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
