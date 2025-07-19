import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Skeleton, 
  Box,
  Paper 
} from '@mui/material';

export default function DraftPoolLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Draft Pool Players
      </Typography>
      
      <Skeleton variant="text" width={300} height={24} sx={{ mb: 4 }} />

      {/* Search and Filter Controls Skeleton */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={56} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={56} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={56} />
          </Grid>
        </Grid>
      </Paper>

      {/* Players Grid Skeleton */}
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ mb: 1, borderRadius: 12 }} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Skeleton variant="text" width="50%" height={20} />
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Skeleton key={starIndex} variant="circular" width={16} height={16} />
                    ))}
                  </Box>
                </Box>

                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
