'use client';

import { useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  InputAdornment, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Chip, 
  SelectChangeEvent 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

interface TeamPlayer {
  id: string;
  gamertag: string;
  is_captain: boolean;
  has_played: boolean;  // True if player has played at least one game
}

export interface TeamWithRegion {
  id: string;
  name: string;
  logo_url: string | null;
  region_id: string | null;
  current_rp: number | null;
  elo_rating: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  regions: Array<{
    id: string;
    name: string;
  }>;
  players: TeamPlayer[];
  wins: number;
  losses: number;
  points_differential: number;
  captain?: {
    id: string;
    gamertag: string;
  } | null;
}

export default function TeamsPageClient({ teams: initialTeams }: { teams: TeamWithRegion[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'wins' | 'points_differential' | 'name' | 'roster_size'>('wins');

  const handleSortChange = (event: SelectChangeEvent<'wins' | 'points_differential' | 'name' | 'roster_size'>) => {
    setSortBy(event.target.value as 'wins' | 'points_differential' | 'name' | 'roster_size');
  };

  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    const filtered = initialTeams.filter(team => 
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'wins':
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.points_differential - a.points_differential;
        case 'points_differential':
          return b.points_differential - a.points_differential;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'roster_size':
          return b.players.length - a.players.length;
        default:
          return 0;
      }
    });
  }, [initialTeams, searchTerm, sortBy]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
          Teams
        </Typography>
        
        {/* Search and Sort */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search teams..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={handleSortChange}
            >
              <MenuItem value="wins">Wins</MenuItem>
              <MenuItem value="points_differential">Point Differential</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="roster_size">Roster Size</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Teams Grid */}
        <Grid container spacing={3}>
          {filteredAndSortedTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Avatar 
                    src={team.logo_url || ''} 
                    alt={team.name}
                    sx={{ 
                      width: 60, 
                      height: 60,
                      mr: 2,
                      bgcolor: 'primary.main'
                    }}
                  />
                  <Box>
                    <Typography variant="h6" component="div">
                      {team.name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Roster:</Typography>
                    <List dense sx={{ py: 0 }}>
                      {(() => {
                        // Ensure we always show at least 5 player slots
                        const minPlayers = 5;
                        const playerCount = team.players.length;
                        const playersToShow = [...team.players];
                        
                        // Add placeholder players if needed
                        for (let i = playerCount; i < minPlayers; i++) {
                          playersToShow.push({
                            id: `placeholder-${i}-${team.id}`,
                            gamertag: 'TBD',
                            is_captain: false,
                            has_played: false
                          });
                        }
                        
                        return playersToShow.map((player) => (
                          <ListItem 
                            key={player.id} 
                            disableGutters 
                            sx={{ py: 0.5 }}
                          >
                            <ListItemAvatar sx={{ minWidth: 32 }}>
                              {player.is_captain ? (
                                <PersonIcon color="primary" fontSize="small" />
                              ) : (
                                <PersonOutlineIcon color="action" fontSize="small" />
                              )}
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <span>{player.gamertag}</span>
                                  {player.is_captain && (
                                    <Chip 
                                      label="Captain" 
                                      size="small" 
                                      color="primary" 
                                      variant="outlined"
                                      sx={{ height: 20, fontSize: '0.6rem' }}
                                    />
                                  )}
                                </Box>
                              }
                              primaryTypographyProps={{
                                variant: 'body2',
                                color: 'text.secondary'
                              }}
                            />
                          </ListItem>
                        ));
                      })()}
                    </List>
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Record
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {team.wins}-{team.losses}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Point Diff
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="medium"
                        color={team.points_differential > 0 ? 'success.main' : 'error.main'}
                      >
                        {team.points_differential > 0 ? `+${team.points_differential}` : team.points_differential}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {team.captain && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Captain
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {team.captain.gamertag}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {filteredAndSortedTeams.length === 0 && (
            <Grid item xs={12} sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No teams found matching your search
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
