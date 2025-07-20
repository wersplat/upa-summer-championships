import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
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
      <Typography variant="h4" component="h1" gutterBottom>
        Bracket Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
        The tournament bracket you're looking for couldn't be found. It may not be available yet or the link might be incorrect.
      </Typography>
      <Button 
        component={Link} 
        href="/bracket" 
        variant="contained"
        size="large"
      >
        View Current Bracket
      </Button>
    </Box>
  );
}
