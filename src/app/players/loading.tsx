import { Skeleton, Box, Paper } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={300} height={24} sx={{ mb: 4 }} />
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Skeleton variant="rectangular" width={250} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
      </Box>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
        
        {[...Array(10)].map((_, row) => (
          <Box key={row} sx={{ display: 'flex', gap: 2, mb: 1, p: 1 }}>
            {[...Array(12)].map((_, cell) => (
              <Skeleton 
                key={cell} 
                variant="rectangular" 
                width={cell === 1 ? 200 : 80} 
                height={40} 
                sx={{ 
                  borderRadius: 1,
                  flexGrow: cell === 1 ? 1 : 0,
                }} 
              />
            ))}
          </Box>
        ))}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={200} height={20} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    </Box>
  );
}
