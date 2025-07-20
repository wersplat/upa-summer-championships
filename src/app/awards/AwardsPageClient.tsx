'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha
} from '@mui/material';
import {
  Shield,
  Star,
  Whatshot
} from '@mui/icons-material';
import Link from 'next/link';

interface PlayerStats {
  id: string;
  gamertag: string;
  position: string;
  team_id: string;
  team_name: string;
  team_logo_url: string | null;
  points_per_game: number;
  assists_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  steals_per_game: number;
  blocks_per_game: number;
  rebounds_per_game: number;
  games_played: number;
  minutes_per_game: number;
  is_rookie: boolean;
  overall_rating: number;
  offensive_rating?: number;
  defensive_rating?: number;
  rookie_rating?: number;
}

interface AwardsPageClientProps {
  omvpCandidates: PlayerStats[];
  dmvpCandidates: PlayerStats[];
  rookieCandidates: PlayerStats[];
}

const getPositionColor = (position: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default' => {
  switch (position) {
    case 'Point Guard': return 'primary';
    case 'Shooting Guard': return 'secondary';
    case 'Lock': return 'success';
    case 'Power Forward': return 'warning';
    case 'Center': return 'error';
    default: return 'default';
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    case 4: return '4️⃣';
    case 5: return '5️⃣';
    default: return '';
  }
};

const PlayerCard = ({ player, rank, category }: { player: PlayerStats; rank: number; category: 'omvp' | 'dmvp' | 'rookie' }) => {
  const theme = useTheme();
  
  const statValue = React.useMemo(() => {
    switch (category) {
      case 'omvp':
        return `${player.points_per_game.toFixed(1)} PPG`;
      case 'dmvp':
        return `${player.steals_per_game.toFixed(1)} SPG`;
      case 'rookie':
        return `${player.overall_rating} OVR`;
      default:
        return '';
    }
  }, [player, category]);
  
  const secondaryStats = React.useMemo(() => {
    switch (category) {
      case 'omvp':
        return `${player.assists_per_game.toFixed(1)} APG • ${(player.field_goal_percentage * 100).toFixed(1)}% FG`;
      case 'dmvp':
        return `${player.blocks_per_game.toFixed(1)} BPG • ${player.rebounds_per_game.toFixed(1)} RPG`;
      case 'rookie':
        return `${player.points_per_game.toFixed(1)} PPG • ${player.assists_per_game.toFixed(1)} APG`;
      default:
        return '';
    }
  }, [player, category]);
  
  return (
    <ListItem
      key={player.id}
      component={Link}
      href={`/players/${player.id}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: { xs: 1.5, sm: 2 },
        mb: 1,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.1),
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.2),
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
          bgcolor: alpha(theme.palette.background.paper, 0.2),
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[2],
        },
        '&:focus-visible': {
          outline: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          outlineOffset: '2px',
        },
        transition: 'all 0.2s ease-in-out',
      }}
      aria-label={`View ${player.gamertag}'s profile`}
    >
      <ListItemAvatar>
        <Box sx={{ position: 'relative' }}>
          {player.team_logo_url ? (
            <Avatar
              src={player.team_logo_url}
              alt={player.team_name}
              sx={{ width: 48, height: 48 }}
            />
          ) : (
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
              {player.team_name.charAt(0)}
            </Avatar>
          )}
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              fontSize: '1.2rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            {getRankIcon(rank)}
          </Box>
        </Box>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {player.gamertag}
            </Typography>
            <Chip
              label={player.position}
              size="small"
              color={getPositionColor(player.position)}
              variant="outlined"
            />
            {player.is_rookie && (
              <Chip
                label="ROOKIE"
                size="small"
                color="info"
                variant="filled"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {player.team_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {secondaryStats}
            </Typography>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {statValue}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {player.games_played} GP
          </Typography>
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default function AwardsPageClient({ omvpCandidates, dmvpCandidates, rookieCandidates }: AwardsPageClientProps) {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2
            }}
          >
            Awards Race
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: alpha(theme.palette.common.white, 0.8),
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Track the race for tournament MVP awards
          </Typography>
        </Box>

        {/* Awards Categories */}
        {/* Legend Section */}
        <Box sx={{ mb: { xs: 4, sm: 6 } }}>
          <Paper
            sx={{
              p: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.1),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.2),
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: 'white',
                mb: 3,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', sm: '2.125rem' }
              }}
            >
              Award Calculation Formulas
            </Typography>
            
            <Grid container spacing={{ xs: 2, sm: 4 }}>
              {/* OMVP Formula */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.2),
                      display: 'inline-flex',
                      mb: 2
                    }}
                  >
                    <Whatshot sx={{ color: 'warning.main', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Offensive MVP Formula
                  </Typography>
                  <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.3), p: 2, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 1 }}>
                      <strong>Rating = </strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8), lineHeight: 1.6 }}>
                      • Points per Game × 40%<br/>
                      • Assists per Game × 30%<br/>
                      • Field Goal % × 20%<br/>
                      • 3-Point % × 10%
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* DMVP Formula */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.2),
                      display: 'inline-flex',
                      mb: 2
                    }}
                  >
                    <Shield sx={{ color: 'info.main', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Defensive MVP Formula
                  </Typography>
                  <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.3), p: 2, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 1 }}>
                      <strong>Rating = </strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8), lineHeight: 1.6 }}>
                      • Steals per Game × 40%<br/>
                      • Blocks per Game × 30%<br/>
                      • Rebounds per Game × 30%
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Rookie Formula */}
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.2),
                      display: 'inline-flex',
                      mb: 2
                    }}
                  >
                    <Star sx={{ color: 'success.main', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Rookie of Tournament Formula
                  </Typography>
                  <Box sx={{ bgcolor: alpha(theme.palette.background.paper, 0.3), p: 2, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 1 }}>
                      <strong>Rating = </strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8), lineHeight: 1.6 }}>
                      • Points per Game × 30%<br/>
                      • Assists per Game × 20%<br/>
                      • Steals per Game × 20%<br/>
                      • Field Goal % × 15%<br/>
                      • Overall Rating × 15%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Additional Notes */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 1 }}
              >
                <strong>Note:</strong> Only players with at least 1 game played are eligible for awards.
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: alpha(theme.palette.common.white, 0.7) }}
              >
                Rookie eligibility is determined by the &quot;is_rookie&quot; flag in player stats.
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 4 }}>
          {/* Offensive MVP */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.1),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.2),
                borderRadius: 3,
                height: 'fit-content'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                    mr: 2
                  }}
                >
                  <Whatshot sx={{ color: 'warning.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    Offensive MVP
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    Top offensive performers
                  </Typography>
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                {omvpCandidates.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                    category="omvp"
                  />
                ))}
                {omvpCandidates.length === 0 && (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: 'center', py: 4, color: alpha(theme.palette.common.white, 0.6) }}
                  >
                    No candidates available yet
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Defensive MVP */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.1),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.2),
                borderRadius: 3,
                height: 'fit-content'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.2),
                    mr: 2
                  }}
                >
                  <Shield sx={{ color: 'info.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    Defensive MVP
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    Elite defensive players
                  </Typography>
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                {dmvpCandidates.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                    category="dmvp"
                  />
                ))}
                {dmvpCandidates.length === 0 && (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: 'center', py: 4, color: alpha(theme.palette.common.white, 0.6) }}
                  >
                    No candidates available yet
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Rookie of Tournament */}
          <Grid item xs={12} lg={4}>
            <Paper
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.1),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.2),
                borderRadius: 3,
                height: 'fit-content'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.2),
                    mr: 2
                  }}
                >
                  <Star sx={{ color: 'success.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    Rookie of Tournament
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    Outstanding first-year players
                  </Typography>
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                {rookieCandidates.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                    category="rookie"
                  />
                ))}
                {rookieCandidates.length === 0 && (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: 'center', py: 4, color: alpha(theme.palette.common.white, 0.6) }}
                  >
                    No rookie candidates available yet
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Footer Note */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{ 
              color: alpha(theme.palette.common.white, 0.6),
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Rankings are updated every 30 seconds based on current tournament performance
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
