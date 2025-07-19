import { Box, Skeleton, Stack } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Skeleton variant="circular" width={120} height={120} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" height={48} />
            <Skeleton variant="text" width="40%" height={32} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rounded" width={100} height={32} />
              <Skeleton variant="rounded" width={120} height={32} />
            </Box>
          </Box>
        </Box>

        {/* Stats Overview Skeleton */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton 
              key={i} 
              variant="rounded" 
              width="100%"
              height={100}
              sx={{ flex: '1 1 180px', minWidth: 0 }}
            />
          ))}
        </Box>

        {/* Tabs Skeleton */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Box sx={{ display: 'flex' }}>
              {['Overview', 'Statistics', 'Game Log', 'Awards'].map((tab) => (
                <Skeleton 
                  key={tab}
                  variant="text" 
                  width={100} 
                  height={48}
                  sx={{ mx: 2 }}
                />
              ))}
            </Box>
          </Box>
          
          {/* Tab Content Skeleton */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <Skeleton 
                variant="rounded" 
                width="100%" 
                height={400}
                sx={{ flex: 1 }}
              />
              <Skeleton 
                variant="rounded" 
                width="100%" 
                height={400}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
