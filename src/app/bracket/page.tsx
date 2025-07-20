import { Metadata } from 'next';
import { Box, Container, Typography, Paper } from '@mui/material';

export const metadata: Metadata = {
  title: 'Tournament Bracket | UPA Summer Championships',
  description: 'View the current tournament bracket and group stage standings',
};

export default function BracketPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box
          component="img"
          src="/UPA-Summer-Championships.png"
          alt="UPA Summer Championships"
          sx={{
            height: 80,
            width: 'auto',
            mb: 2,
            mx: 'auto',
            display: 'block'
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Tournament Bracket & Group Stage
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Follow the progress of the UPA Summer Championships tournament
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <div style={{ position: 'relative', paddingBottom: '75%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
          <iframe 
            src="https://rt25k.challonge.com/SummerClash/module" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px'
            }}
            title="Tournament Bracket"
          />
        </div>
      </Paper>
    </Container>
  );
}
