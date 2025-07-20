'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Typography,
  Box,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
} from '@mui/material';
import { Search, EmojiEvents, TrendingUp, Groups } from '@mui/icons-material';

interface TeamCaptain {
  id: string;
  gamertag: string;
}

interface TeamWithRegion {
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
  captain: TeamCaptain | null;
  wins?: number;
  losses?: number;
  points_differential?: number;
}

export default function TeamsPageClient({ teams: initialTeams }: { teams: TeamWithRegion[] }) {
  const router = useRouter();
  
  // Prefetch team data on hover
  const handleTeamHover = useCallback((teamId: string) => {
    router.prefetch(`/teams/${teamId}`);
  }, [router]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'wins' | 'rp' | 'rank' | 'name'>('wins');
  const [filterRegion, setFilterRegion] = useState<string>('all');

  // Get unique regions for filter
  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    initialTeams.forEach(team => {
      if (team.regions?.[0]?.name) {
        uniqueRegions.add(team.regions[0].name);
      }
    });
    return Array.from(uniqueRegions).sort();
  }, [initialTeams]);

  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    const filtered = initialTeams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = filterRegion === 'all' || team.regions?.[0]?.name === filterRegion;
      return matchesSearch && matchesRegion;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'wins':
          // Default to 0 if wins is not available
          const aWins = a.wins || 0;
          const bWins = b.wins || 0;
          return bWins - aWins;
        case 'rp':
          return (b.current_rp || 0) - (a.current_rp || 0);
        case 'rank':
          return (a.global_rank || Infinity) - (b.global_rank || Infinity);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [initialTeams, searchTerm, sortBy, filterRegion]);

  // Get top teams for stats
  const topTeams = useMemo(() => {
    const sorted = [...initialTeams].sort((a, b) => (b.elo_rating || 0) - (a.elo_rating || 0));
    return {
      highest_elo: sorted[0],
      highest_rp: [...initialTeams].sort((a, b) => (b.current_rp || 0) - (a.current_rp || 0))[0],
      highest_rank: [...initialTeams].sort((a, b) => (a.global_rank || Infinity) - (b.global_rank || Infinity))[0]
    };
  }, [initialTeams]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #001F3F 0%, #1E40AF 100%)',
        color: 'white',
        py: 8,
        px: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box 
            sx={{
              position: 'relative',
              height: { xs: 80, sm: 100, md: 120 },
              width: '100%',
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
              '& > span': {
                position: 'relative !important',
                width: 'auto !important',
                height: '100% !important',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                '& img': {
                  objectFit: 'contain',
                  position: 'relative !important',
                  height: '100% !important',
                  width: 'auto !important',
                }
              }
            }}
          >
            <Image
              src="/UPA-Summer-Championships.png"
              alt="UPA Summer Championships"
              width={300}
              height={120}
              style={{
                width: 'auto',
                height: '100%',
                maxWidth: '100%',
              }}
              priority
            />
          </Box>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Summer Championship Teams
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            {initialTeams.length} teams competing in the UPA Summer Championships
          </Typography>
          
          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <EmojiEvents sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Best Record
                </Typography>
                <Typography variant="body1">
                  {topTeams.highest_elo?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Top Win %
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <TrendingUp sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Most RP
                </Typography>
                <Typography variant="body1">
                  {topTeams.highest_rp?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {topTeams.highest_rp?.current_rp || 0} RP
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Groups sx={{ fontSize: 40, mb: 1, color: 'info.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Global #1
                </Typography>
                <Typography variant="body1">
                  {topTeams.highest_rank?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Rank #{topTeams.highest_rank?.global_rank || 'N/A'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
            Find Teams
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search teams..."
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
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value as 'wins' | 'rp' | 'rank' | 'name')}
                >
                  <MenuItem value="wins">Win Record</MenuItem>
                  <MenuItem value="rp">Ranking Points</MenuItem>
                  <MenuItem value="rank">Global Rank</MenuItem>
                  <MenuItem value="name">Team Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Region</InputLabel>
                <Select
                  value={filterRegion}
                  label="Filter by Region"
                  onChange={(e) => setFilterRegion(e.target.value)}
                >
                  <MenuItem value="all">All Regions</MenuItem>
                  {regions.map(region => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Teams Grid */}
        <Grid container spacing={3}>
          {filteredAndSortedTeams
            .filter(team => team?.id) // Only render teams with valid IDs
            .map((team) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
              <Card 
                component={Link} 
                href={`/teams/${team.id}`}
                onMouseEnter={() => handleTeamHover(team.id)}
                sx={{ 
                  height: '100%',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease-in-out',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    '& .rank-badge': {
                      transform: 'scale(1.1)',
                    }
                  },
                  '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${team.name} team details`}
              >
                {/* Rank Badge */}
                {team.global_rank && team.global_rank <= 10 && (
                  <Chip
                    label={`#${team.global_rank}`}
                    className="rank-badge"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      zIndex: 1,
                      bgcolor: team.global_rank === 1 ? 'warning.main' : team.global_rank <= 3 ? 'secondary.main' : 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  />
                )}
                
                <CardHeader
                  avatar={
                    <Box 
                      component="span"
                      sx={{
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {team.logo_url ? (
                        <img 
                          src={team.logo_url}
                          alt={team.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: 4
                          }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Avatar 
                          sx={{ 
                            width: '100%', 
                            height: '100%',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            borderRadius: '50%'
                          }}
                        >
                          {team.name.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </Box>
                  }
                  title={
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {team.name}
                    </Typography>
                  }
                  subheader={
                    team.captain ? (
                      <Box 
                        sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(255, 193, 7, 0.1)',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          border: '1px solid rgba(255, 193, 7, 0.3)'
                        }}
                      >
                        <Box component="span" sx={{ color: 'warning.main', fontSize: '0.8em', lineHeight: 1 }}>©</Box>
                        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                          {team.captain.gamertag}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                        No Captain
                      </Typography>
                    )
                  }
                  sx={{ pb: 1 }}
                />
                
                <CardContent sx={{ pt: 0 }}>
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Record
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {`${team.wins || 0}-${team.losses || 0}`}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Point Diff
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              color: (team.points_differential || 0) >= 0 ? 'success.main' : 'error.main' 
                            }}
                          >
                            {team.points_differential && team.points_differential > 0 ? '+' : ''}{team.points_differential || 0}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                    {team.leaderboard_tier && (
                      <Chip 
                        label={team.leaderboard_tier} 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    )}
                    {team.global_rank && (
                      <Chip 
                        label={`Global #${team.global_rank}`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* No Results */}
        {filteredAndSortedTeams.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No teams found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || filterRegion !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Check back later for updates.'}
            </Typography>
            {(searchTerm || filterRegion !== 'all') && (
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterRegion('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}
