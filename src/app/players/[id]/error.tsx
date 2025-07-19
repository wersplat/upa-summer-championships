'use client';

import { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Player profile error:', error);
  }, [error]);

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
      <ErrorOutlineIcon 
        color="error" 
        sx={{ fontSize: 64, mb: 2 }} 
      />
      <Typography variant="h5" component="h1" gutterBottom>
        Oops! Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        We couldn't load the player profile. The player may not exist or there might be a connection issue.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => reset()}
        >
          Try again
        </Button>
        <Button 
          variant="outlined" 
          color="primary"
          href="/players"
          component="a"
        >
          Back to Players
        </Button>
      </Box>
      {process.env.NODE_ENV === 'development' && (
        <Box 
          sx={{ 
            mt: 4, 
            p: 2, 
            bgcolor: 'background.paper', 
            borderRadius: 1,
            textAlign: 'left',
            maxWidth: '100%',
            overflowX: 'auto'
          }}
        >
          <Typography variant="caption" color="error">
            {error.message}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
