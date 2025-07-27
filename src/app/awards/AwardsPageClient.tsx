'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  useTheme
} from '@mui/material';
import {
  Shield,
  Star,
  Whatshot
} from '@mui/icons-material';
import { PlayerStats } from './page';
import PlayerCard from '@/components/PlayerCard';
import StandardCard from '@/components/StandardCard';

interface AwardsPageClientProps {
  omvpCandidates: PlayerStats[];
  dmvpCandidates: PlayerStats[];
  rookieCandidates: PlayerStats[];
}

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
              color: 'rgba(255, 255, 255, 0.7)',
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
              color: 'rgba(255, 255, 255, 0.6)',
              fontStyle: 'italic',
              mb: 3
            }}
          >
            * Players must have played in at least 3 games to be eligible for awards
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Offensive MVP */}
          <Grid item xs={12} md={4}>
            <StandardCard
              title="Offensive MVP"
              icon={<Whatshot color="error" sx={{ mr: 1 }} />}
              variant="default"
              elevation={1}
            >
              {omvpCandidates.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  id={player.id}
                  gamertag={player.gamertag}
                  position={player.position}
                  teamName={player.team_name}
                  rating={player.offensive_rating}
                  ratingColor={index === 0 ? 'primary' : 'default'}
                  avatarColor="primary.main"
                  isHighlighted={index === 0}
                  rank={index + 1}
                  stats={{
                    field_goal_percentage: player.field_goal_percentage,
                    points_per_game: player.points_per_game,
                    assists_per_game: player.assists_per_game
                  }}
                />
              ))}
            </StandardCard>
          </Grid>

          {/* Defensive MVP */}
          <Grid item xs={12} md={4}>
            <StandardCard
              title="Defensive MVP"
              icon={<Shield color="info" sx={{ mr: 1 }} />}
              variant="default"
              elevation={1}
            >
              {dmvpCandidates.map((player, index) => (
                <PlayerCard
                  key={`def-${player.id}`}
                  id={player.id}
                  gamertag={player.gamertag}
                  position={player.position}
                  teamName={player.team_name}
                  rating={player.defensive_rating}
                  ratingColor={index === 0 ? 'info' : 'default'}
                  avatarColor="info.main"
                  isHighlighted={index === 0}
                  rank={index + 1}
                  stats={{
                    field_goal_percentage: player.field_goal_percentage,
                    steals_per_game: player.steals_per_game,
                    blocks_per_game: player.blocks_per_game,
                    rebounds_per_game: player.rebounds_per_game
                  }}
                />
              ))}
            </StandardCard>
          </Grid>

          {/* Rookie of Tournament */}
          <Grid item xs={12} md={4}>
            <StandardCard
              title="Rookie of Tournament"
              icon={<Star color="warning" sx={{ mr: 1 }} />}
              variant="default"
              elevation={1}
            >
              {rookieCandidates.map((player, index) => (
                <PlayerCard
                  key={`rookie-${player.id}`}
                  id={player.id}
                  gamertag={player.gamertag}
                  position={player.position}
                  teamName={player.team_name}
                  rating={player.rookie_rating}
                  ratingColor={index === 0 ? 'warning' : 'default'}
                  avatarColor="warning.main"
                  isHighlighted={index === 0}
                  rank={index + 1}
                  stats={{
                    field_goal_percentage: player.field_goal_percentage,
                    points_per_game: player.points_per_game,
                    rebounds_per_game: player.rebounds_per_game,
                    assists_per_game: player.assists_per_game
                  }}
                />
              ))}
            </StandardCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
