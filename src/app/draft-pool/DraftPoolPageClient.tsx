'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import Link from 'next/link';

interface DraftPoolPlayer {
  player_id: string;
  declared_at: string;
  status: string;
  season?: string;
  draft_rating?: number;
  draft_notes?: string;
  player: {
    id: string;
    gamertag: string;
    position?: string | null;
    region_id?: string | null;
    current_team_id?: string | null;
    teams?: Array<{
      id: string;
      name: string;
      logo_url: string | null;
    }>;
  };
}

interface DraftPoolPageClientProps {
  draftPlayers: DraftPoolPlayer[];
  showFallbackMessage: boolean;
}

const DraftPoolPageClient: React.FC<DraftPoolPageClientProps> = ({
  draftPlayers,
  showFallbackMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');

  // Get unique statuses and positions for filter options
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(draftPlayers.map(dp => dp.status));
    return Array.from(statuses).sort();
  }, [draftPlayers]);

  const uniquePositions = useMemo(() => {
    const positions = new Set(
      draftPlayers
        .map(dp => dp.player.position)
        .filter(Boolean)
    );
    return Array.from(positions).sort();
  }, [draftPlayers]);

  // Filter players based on search and filters
  const filteredPlayers = useMemo(() => {
    return draftPlayers.filter(draftPlayer => {
      const matchesSearch = draftPlayer.player.gamertag
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || draftPlayer.status === statusFilter;
      
      const matchesPosition = positionFilter === 'all' || 
        draftPlayer.player.position === positionFilter;

      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [draftPlayers, searchTerm, statusFilter, positionFilter]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'drafted':
        return 'primary';
      case 'withdrawn':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderStarRating = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Box key={i} component="span" sx={{ color: i <= fullStars ? '#ffd700' : '#e0e0e0' }}>
          {i <= fullStars ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {stars}
        <Typography variant="caption" sx={{ ml: 1 }}>
          ({rating}/5)
        </Typography>
      </Box>
    );
  };

  if (showFallbackMessage) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Draft Pool Players
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No players in the draft pool yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Players who declare for the draft will appear here.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Draft Pool Players
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {draftPlayers.length} player{draftPlayers.length !== 1 ? 's' : ''} declared for the draft
      </Typography>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {uniqueStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={positionFilter}
                label="Position"
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <MenuItem value="all">All Positions</MenuItem>
                {uniquePositions.map(position => (
                  <MenuItem key={position} value={position || ''}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Players Grid */}
      <Grid container spacing={3}>
        {filteredPlayers.map((draftPlayer) => (
          <Grid item xs={12} sm={6} md={4} key={draftPlayer.player_id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{ width: 56, height: 56, mr: 2 }}
                  >
                    {draftPlayer.player.gamertag.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Link 
                      href={`/players/${draftPlayer.player.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography 
                        variant="h6" 
                        component="h2"
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {draftPlayer.player.gamertag}
                      </Typography>
                    </Link>
                    {draftPlayer.player.position && (
                      <Typography variant="body2" color="text.secondary">
                        {draftPlayer.player.position}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={draftPlayer.status.charAt(0).toUpperCase() + draftPlayer.status.slice(1)}
                    color={getStatusColor(draftPlayer.status) as any}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  {draftPlayer.player.teams && draftPlayer.player.teams.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {draftPlayer.player.teams[0].logo_url ? (
                        <img 
                          src={draftPlayer.player.teams[0].logo_url} 
                          alt={draftPlayer.player.teams[0].name}
                          style={{
                            width: 24,
                            height: 24,
                            objectFit: 'contain',
                            marginRight: 8,
                            borderRadius: '50%',
                            border: '1px solid rgba(0, 0, 0, 0.12)'
                          }}
                        />
                      ) : (
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.75rem',
                            mr: 1,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText'
                          }}
                        >
                          {draftPlayer.player.teams[0].name.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {draftPlayer.player.teams[0].name}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {draftPlayer.draft_rating && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Draft Rating:
                    </Typography>
                    {renderStarRating(draftPlayer.draft_rating)}
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary">
                  Declared: {format(new Date(draftPlayer.declared_at), 'MMM d, yyyy')}
                </Typography>

                {draftPlayer.draft_notes && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 1, 
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    "{draftPlayer.draft_notes}"
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPlayers.length === 0 && !showFallbackMessage && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No players match your search criteria
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search terms or filters.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default DraftPoolPageClient;
