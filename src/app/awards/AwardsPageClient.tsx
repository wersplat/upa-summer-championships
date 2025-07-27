'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  Shield,
  Star,
  Whatshot
} from '@mui/icons-material';
import { PlayerStats } from './page';
import PlayerCard from '@/components/PlayerCard';

interface AwardsPageClientProps {
  omvpCandidates: PlayerStats[];
  dmvpCandidates: PlayerStats[];
  rookieCandidates: PlayerStats[];
}

export default function AwardsPageClient({ omvpCandidates, dmvpCandidates, rookieCandidates }: AwardsPageClientProps) {
  const theme = useTheme();

  // Map player stats to PlayerCard props format
  const mapPlayerToCardProps = (player: PlayerStats, category: 'omvp' | 'dmvp' | 'rookie') => {
    const baseProps = {
      id: player.id,
      gamertag: player.gamertag,
      position: player.position || 'Unknown',
      teamName: player.team_name,
      rating: category === 'omvp' ? player.offensive_rating : 
              category === 'dmvp' ? player.defensive_rating : 
              player.rookie_rating,
      isHighlighted: false,
      rank: 0, // Will be set when mapping
      stats: {
        field_goal_percentage: player.field_goal_percentage * 100, // Convert to percentage
        points_per_game: player.points_per_game,
        assists_per_game: player.assists_per_game,
        steals_per_game: player.steals_per_game,
        blocks_per_game: player.blocks_per_game,
        rebounds_per_game: player.rebounds_per_game,
        games_played: player.games_played
      }
    };

    // Set rating color based on category
    const ratingColor = category === 'omvp' ? 'error' : 
                       category === 'dmvp' ? 'info' : 'warning';

    return { ...baseProps, ratingColor };
  };

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
              mb: 2,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Track the race for tournament MVP awards
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: alpha(theme.palette.common.white, 0.6),
              fontStyle: 'italic'
            }}
          >
            * Players must have played in at least 3 games to be eligible for awards
          </Typography>
        </Box>

        {/* Awards Grid */}
        <Grid container spacing={3}>
          {/* Offensive MVP */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                bgcolor: alpha(theme.palette.background.paper, 0.1),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.2),
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Whatshot color="error" sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    Offensive MVP
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    Top offensive performers
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                {omvpCandidates.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    {...mapPlayerToCardProps(player, 'omvp')}
                    rank={index + 1}
                    isHighlighted={index === 0}
                    ratingLabel={`${player.offensive_rating?.toFixed(1)} OVR`}
                  />
                ))}
                {omvpCandidates.length === 0 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                    No candidates available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Defensive MVP */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                bgcolor: alpha(theme.palette.background.paper, 0.1),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.2),
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Shield color="info" sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    Defensive MVP
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    Top defensive performers
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                {dmvpCandidates.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    {...mapPlayerToCardProps(player, 'dmvp')}
                    rank={index + 1}
                    isHighlighted={index === 0}
                    ratingLabel={`${player.defensive_rating?.toFixed(1)} OVR`}
                  />
                ))}
                {dmvpCandidates.length === 0 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                    No candidates available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Rookie of Tournament */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                bgcolor: alpha(theme.palette.background.paper, 0.1),
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.2),
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Star color="warning" sx={{ mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                    Rookie of Tournament
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    Top first-year players
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                {rookieCandidates.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    {...mapPlayerToCardProps(player, 'rookie')}
                    rank={index + 1}
                    isHighlighted={index === 0}
                    ratingLabel={`${player.rookie_rating?.toFixed(1)} OVR`}
                  />
                ))}
                {rookieCandidates.length === 0 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                    No candidates available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
