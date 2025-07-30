'use client';

import { Box, Typography, Container, Grid, Paper, Divider, Chip } from '@mui/material';
import { notFound } from 'next/navigation';

interface TeamData {
  id: string;
  name: string;
  logo_url?: string;
  stats: {
    wins: number;
    losses: number;
    games_played: number;
    avg_points: number;
    avg_points_against: number;
    point_differential: number;
  };
  players?: Array<{
    id: string;
    name: string;
    number?: number;
    position?: string;
  }>;
  regions?: string[];
  elo_rating?: number;
  global_rank?: number;
  leaderboard_tier?: string;
}

async function getTeamData(id: string): Promise<TeamData | null> {
  try {
    const response = await fetch(`/api/teams/${id}`);
    if (!response.ok) throw new Error('Failed to fetch team data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching team data:', error);
    return null;
  }
}

export default async function TeamPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  if (!id) {
    notFound();
  }
  
  try {
    const team = await getTeamData(id);
    if (!team) {
      notFound();
    }

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
        <Container maxWidth="lg">
          {/* Team Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {team.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
              <Chip 
                label={`Record: ${team.stats.wins}-${team.stats.losses}`} 
                color="primary" 
                variant="outlined"
              />
              {team.global_rank && (
                <Chip 
                  label={`Global Rank: #${team.global_rank}`} 
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {/* Team Stats Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  Team Stats
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {team.stats.games_played}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Games Played
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {team.stats.wins}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wins
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {team.stats.losses}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Losses
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {team.stats.avg_points.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        PPG
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {team.stats.avg_points_against.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        OPP PPG
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600, 
                          color: team.stats.point_differential >= 0 ? 'success.main' : 'error.main' 
                        }}
                      >
                        {team.stats.point_differential > 0 ? '+' : ''}{team.stats.point_differential.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Point Diff
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {team.stats.games_played > 0 && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Win Percentage
                    </Typography>
                    <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                      <Box 
                        sx={{
                          width: `${(team.stats.wins / team.stats.games_played) * 100}%`,
                          height: 8,
                          bgcolor: 'primary.main',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'right' }}>
                      {((team.stats.wins / team.stats.games_played) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Player Roster */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Player Roster
                  </Typography>
                  <Chip 
                    label={`${team.players?.length || 0} Players`} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {team.players && team.players.length > 0 ? (
                  <Box sx={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px 16px 8px 0', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>#</th>
                          <th style={{ textAlign: 'left', padding: '8px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Name</th>
                          <th style={{ textAlign: 'right', padding: '8px 0 8px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.players.map((player) => (
                          <tr key={player.id} style={{ borderBottom: '1px solid rgba(224, 224, 224, 0.5)' }}>
                            <td style={{ padding: '12px 16px 12px 0', textAlign: 'left', color: 'text.primary', fontWeight: 500 }}>
                              {player.number || '-'}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'left' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box 
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'primary.contrastText',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {player.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {player.name}
                                </Typography>
                              </Box>
                            </td>
                            <td style={{ padding: '12px 0 12px 16px', textAlign: 'right', color: 'text.secondary' }}>
                              {player.position || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    py: 4,
                    textAlign: 'center'
                  }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: 'action.hover', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#757575"/>
                      </svg>
                    </Box>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No players found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Player information will appear here when available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Coming Soon: Recent Matches */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Matches
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Recent matches will be displayed here
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  } catch (error) {
    console.error('Error in TeamPage:', error);
    notFound();
  }
}
