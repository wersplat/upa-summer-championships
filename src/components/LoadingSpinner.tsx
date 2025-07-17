import Image from 'next/image';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function LoadingSpinner() {
  return (
    <Backdrop open sx={{ zIndex: 1300, color: '#fff' }}>
      <Box textAlign="center">
        <CircularProgress color="inherit" sx={{ mb: 2 }} />
        <Box position="relative" width={48} height={48} mx="auto" mb={1}>
          <Image src="/logo.png" alt="UPA Logo" fill style={{ objectFit: 'contain' }} priority />
        </Box>
        <Typography variant="h6" component="p">
          Loading team data...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          This may take a moment
        </Typography>
      </Box>
    </Backdrop>
  );
}
