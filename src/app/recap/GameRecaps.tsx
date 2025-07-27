'use client';

import { useState, useMemo } from 'react';
import { Game } from '@/types/game';
import GameCard from './GameCard';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  Typography, 
  Grid,
  Paper
} from '@mui/material';
import { Search } from '@mui/icons-material';

interface GameRecapsProps {
  initialGames: Game[];
}

export default function GameRecaps({ initialGames }: GameRecapsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [games] = useState<Game[]>(initialGames);

  const filteredGames = useMemo(() => {
    if (!searchTerm) return games;
    
    const term = searchTerm.toLowerCase();
    return games.filter(game => 
      game.team1.name.toLowerCase().includes(term) ||
      game.team2.name.toLowerCase().includes(term) ||
      game.tournamentStage?.toLowerCase().includes(term) ||
      game.location?.toLowerCase().includes(term) ||
      game.highlights?.toLowerCase().includes(term) ||
      game.mvp?.toLowerCase().includes(term)
    );
  }, [games, searchTerm]);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: '1px',
              },
            },
          }}
        />
      </Paper>
      
      {filteredGames.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {searchTerm 
              ? 'No matching games found. Try a different search term.' 
              : 'No completed games yet. Check back soon for recaps!'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredGames.map((game) => (
            <Grid item xs={12} key={game.id}>
              <GameCard game={game} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
