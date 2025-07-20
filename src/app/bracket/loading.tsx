import { Box, Skeleton } from '@mui/material';

export default function BracketLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
      <Skeleton variant="text" width={400} height={30} sx={{ mb: 4 }} />
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={800} 
        sx={{ 
          borderRadius: 2,
          bgcolor: 'grey.200',
        }} 
      />
    </Box>
  );
}
