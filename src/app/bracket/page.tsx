'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Paper, Skeleton } from '@mui/material';

// Metadata in a client component needs to be handled differently
// We'll use a layout.tsx or page.tsx in a parent directory for metadata

export default function BracketPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
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
          p: { xs: 1, sm: 2, md: 3 }, 
          mb: 4,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '100%', mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Tournament Bracket
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Interactive bracket - pinch to zoom on mobile devices
          </Typography>
        </Box>
        
        <Box sx={{ 
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '8px',
          bgcolor: 'background.default',
          aspectRatio: '16/9',
          minHeight: '400px',
          '& iframe': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
          },
          '& .challonge-iframe-placeholder': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            color: 'text.secondary',
          },
        }}>
          {hasError ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error" gutterBottom>
                Failed to load tournament bracket
              </Typography>
              <Link href="https://challonge.com/SummerClash" target="_blank" rel="noopener noreferrer">
                View bracket on Challonge
              </Link>
            </Box>
          ) : (
            <>
              <Box
                component="iframe"
                src={`https://rt25k.challonge.com/SummerClash/module?theme=2&scale_to_fit=1&show_final_results=1&show_standings=1&show_live_status=1&multiplier=0.9&match_width_multiplier=1.1&show_tournament_name=1&tab=final`}
                title="Tournament Bracket | UPA Summer Championships"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onLoad={() => setIsLoading(false)}
                onError={() => setHasError(true)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                  opacity: isLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              />
              {isLoading && (
                <Box className="challonge-iframe-placeholder">
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                </Box>
              )}
            </>
          )}
        </Box>
        
        <Box sx={{ 
          mt: 2, 
          textAlign: 'center',
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">
            Powered by <Link href="https://challonge.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Challonge</Link>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>•</Typography>
          <Link href="https://challonge.com/SummerClash" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Typography variant="caption" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              View on Challonge
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
