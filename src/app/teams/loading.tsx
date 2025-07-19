import { Box, Skeleton, Stack, Grid, Card, CardContent } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header Skeleton */}
        <Box>
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={32} />
        </Box>

        {/* Search and Filter Skeleton */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Skeleton variant="rounded" width={300} height={40} />
          <Skeleton variant="rounded" width={180} height={40} />
        </Box>

        {/* Teams Grid Skeleton */}
        <Grid container spacing={3}>
          {[...Array(12)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="80%" height={28} />
                      <Skeleton variant="text" width="60%" height={20} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Skeleton variant="rounded" width="30%" height={24} />
                    <Skeleton variant="rounded" width="30%" height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Skeleton variant="rounded" width={300} height={36} />
        </Box>
      </Stack>
    </Box>
  );
}
