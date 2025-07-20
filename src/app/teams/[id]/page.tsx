import { supabase } from '@/utils/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  Divider,
  Button,
} from '@mui/material';
import {
  ArrowBack,
  EmojiEvents,
  TrendingUp,
  Groups,
  LocationOn,
} from '@mui/icons-material';
import RosterTable from '@/components/RosterTable';
import { Team, Player, Match } from '@/utils/supabase';

interface TeamWithRoster extends Team {
  id: string;
  name: string;
  logo_url: string | null;
  region_id: string | null;
  current_rp: number | null;
  elo_rating: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  players: (Player & { 
    team_rosters?: Array<{
      id: string;
      team_id: string;
      player_id: string;
      is_captain: boolean;
      is_player_coach: boolean;
      joined_at: string;
      left_at: string | null;
      event_id: string | null;
    }> 
  })[];
  recent_matches: Match[];
  stats: {
    games_played: number;
    avg_points: number;
    wins: number;
    losses: number;
    points_for: number;
    points_against: number;
    points_differential: number;
  };
  regions?: Array<{
    id: string;
    name: string;
  }>;
}

export const revalidate = 3600; // Revalidate data every hour

async function getTeamData(id: string): Promise<TeamWithRoster | null> {
  try {
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d';
    
    // First, verify the team has a roster for the specific event
    const { data: teamRoster, error: rosterError } = await supabase
      .from('team_rosters')
      .select('team_id')
      .eq('event_id', eventId)
      .eq('team_id', id);

    if (rosterError) {
      console.error('Error checking team roster:', rosterError);
      return null;
    }

    // If team has no roster for this event, continue anyway (fallback behavior)
    if (!teamRoster || teamRoster.length === 0) {
      console.log(`Team ${id} has no roster for event ${eventId}, showing team anyway`);
      // Don't return null, continue to show the team
    }

    // Get the team by id with region info
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        regions (id, name)
      `)
      .eq('id', id)
      .single();

    if (teamError || !teamData) {
      console.error('Error fetching team:', teamError);
      return null;
    }

    // Fetch team roster with player details
    const { data: rosterData, error: rosterDataError } = await supabase
      .from('team_rosters')
      .select(`
        id,
        team_id,
        player_id,
        is_captain,
        is_player_coach,
        joined_at,
        left_at,
        event_id,
        players (*)
      `)
      .eq('team_id', teamData.id);

    if (rosterDataError) {
      console.error('Error fetching team roster:', rosterDataError);
      throw rosterDataError;
    }

    // Get all matches for the team in the specific event
    let { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        event_id,
        team_a_id,
        team_b_id,
        score_a,
        score_b,
        played_at,
        team_a:team_a_id (id, name, logo_url),
        team_b:team_b_id (id, name, logo_url)
      `)
      .eq('event_id', eventId)
      .or(`team_a_id.eq.${teamData.id},team_b_id.eq.${teamData.id}`)
      .not('score_a', 'is', null)  // Only include completed matches
      .not('score_b', 'is', null)  // Only include completed matches
      .order('played_at', { ascending: false });

    // If no matches found for the specific event, get all completed matches for the team
    if (!matchesData || matchesData.length === 0) {
      console.log(`No matches found for team ${teamData.id} in event ${eventId}, showing all completed matches`);
      const { data: allMatchesData, error: allMatchesError } = await supabase
        .from('matches')
        .select(`
          id,
          event_id,
          team_a_id,
          team_b_id,
          score_a,
          score_b,
          played_at,
          team_a:team_a_id (id, name, logo_url),
          team_b:team_b_id (id, name, logo_url)
        `)
        .or(`team_a_id.eq.${teamData.id},team_b_id.eq.${teamData.id}`)
        .not('score_a', 'is', null)  // Only include completed matches
        .not('score_b', 'is', null)  // Only include completed matches
        .order('played_at', { ascending: false });
      
      matchesData = allMatchesData;
      matchesError = allMatchesError;
    }

    if (matchesError) throw matchesError;

    // Process matches to handle array responses from Supabase
    const processedMatches = (matchesData || []).map(match => ({
      ...match,
      team_a: Array.isArray(match.team_a) ? match.team_a[0] : match.team_a,
      team_b: Array.isArray(match.team_b) ? match.team_b[0] : match.team_b
    }));

    // Calculate team stats
    let wins = 0;
    let losses = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;
    
    processedMatches?.forEach(match => {
      const isTeamA = match.team_a_id === teamData.id;
      const teamScore = isTeamA ? (match.score_a || 0) : (match.score_b || 0);
      const opponentScore = isTeamA ? (match.score_b || 0) : (match.score_a || 0);
      
      pointsFor += teamScore;
      pointsAgainst += opponentScore;
      
      if (teamScore > opponentScore) {
        wins++;
      } else if (teamScore < opponentScore) {
        losses++;
      }
      // If scores are equal, it's a tie - we don't increment wins or losses
    });
    
    const gamesPlayed = wins + losses; // Only count games with a win or loss, excluding ties
    const pointsDifferential = pointsFor - pointsAgainst;





    return {
      ...teamData,
      players: (rosterData || []).map(roster => ({
        ...roster.players,
        team_rosters: [{
          id: roster.id,
          team_id: roster.team_id,
          player_id: roster.player_id,
          is_captain: roster.is_captain,
          is_player_coach: roster.is_player_coach || false,
          joined_at: roster.joined_at || new Date().toISOString(),
          left_at: roster.left_at || null,
          event_id: roster.event_id || null
        }]
      })),
      recent_matches: processedMatches || [],
      stats: {
        games_played: gamesPlayed,
        avg_points: gamesPlayed > 0 ? pointsFor / gamesPlayed : 0,
        wins,
        losses: gamesPlayed - wins,
        points_for: pointsFor,
        points_against: pointsAgainst,
        points_differential: pointsDifferential,
      },
    };
  } catch (error) {
    console.error('Error fetching team data:', error);
    return null;
  }
}

export default async function TeamPage({ params }: { params: { id: string } }) {
  // Ensure params is properly awaited
  const { id } = await Promise.resolve(params);
  
  if (!id) {
    notFound();
  }
  
  // Ensure we have the id before proceeding
  if (!id) {
    notFound();
  }
  
  try {
    
    // Fetch team data inside the page component
    const team = await getTeamData(id);

    if (!team) {
      notFound();
    }



    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header Section */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #001F3F 0%, #1E40AF 100%)',
          color: 'white',
          py: 4,
          px: 3
        }}>
          <Container maxWidth="lg">
            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
              <Button
                component={Link}
                href="/teams"
                startIcon={<ArrowBack />}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Back to Teams
              </Button>
            </Box>

            {/* Team Header */}
            <Grid container spacing={3} alignItems="center" sx={{ flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
              <Grid item sx={{ mb: { xs: 2, sm: 0 } }}>
                <Box 
                  sx={{
                    width: { xs: 100, sm: 120, md: 140 },
                    height: { xs: 100, sm: 120, md: 140 },
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    mx: 'auto',
                    mb: { xs: 1, sm: 0 }
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
                        padding: 8
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Typography 
                      variant="h2" 
                      component="div"
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'white',
                        lineHeight: 1,
                        fontSize: { xs: '2.5rem', sm: '3rem' }
                      }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  gap: 2, 
                  mb: 1,
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                      lineHeight: 1.2,
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                  >
                    {team.name}
                  </Typography>
                  {team.global_rank && team.global_rank <= 10 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: { xs: 'center', sm: 'flex-start' },
                      width: { xs: '100%', sm: 'auto' },
                      mb: { xs: 1, sm: 0 }
                    }}>
                      <Chip
                        label={`#${team.global_rank}`}
                        sx={{
                          bgcolor: team.global_rank === 1 ? 'warning.main' : team.global_rank <= 3 ? 'secondary.main' : 'primary.main',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.9rem', sm: '1.1rem' },
                          height: { xs: 30, sm: 36 },
                          px: 1
                        }}
                      />
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  mb: 2,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  flexWrap: 'wrap'
                }}>
                  {/* Captain Info */}
                  {team.players?.some(p => p.team_rosters?.[0]?.is_captain) && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: 'rgba(255, 193, 7, 0.1)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      border: '1px solid rgba(255, 193, 7, 0.3)'
                    }}>
                      <Box component="span" sx={{ color: 'warning.main', fontWeight: 'bold', mr: 0.5 }}>©</Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'warning.main' }}>
                        Captain: {team.players.find(p => p.team_rosters?.[0]?.is_captain)?.gamertag}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Region Info - Moved here as secondary info */}
                  {team.regions?.[0]?.name && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: { xs: 16, sm: 18 }, mr: 0.5, color: 'grey.400' }} />
                      <Typography variant="body2" sx={{ color: 'grey.400' }}>
                        {team.regions[0].name}
                      </Typography>
                    </Box>
                  )}
                  {team.leaderboard_tier && (
                    <Chip 
                      label={team.leaderboard_tier} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        ml: { xs: 0, sm: 1 },
                        mt: { xs: 1, sm: 0 },
                        fontSize: '0.8rem',
                        height: 24
                      }}
                    />
                  )}
                </Box>

                {/* Quick Stats - Enhanced for Mobile */}
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: { xs: 1, sm: 2 } }}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ 
                      p: { xs: 1, sm: 2 }, 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(10px)', 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <TrendingUp sx={{ 
                        fontSize: { xs: 24, sm: 32 }, 
                        mb: { xs: 0.5, sm: 1 }, 
                        color: team.stats.points_differential >= 0 ? 'success.main' : 'error.main' 
                      }} />
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600, 
                          color: team.stats.points_differential >= 0 ? 'success.main' : 'error.main',
                          fontSize: { xs: '1.1rem', sm: '1.5rem' }
                        }}
                      >
                        {team.stats.points_differential > 0 ? `+${team.stats.points_differential}` : team.stats.points_differential}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Point Diff
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ 
                      p: { xs: 1, sm: 2 }, 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(10px)', 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <EmojiEvents sx={{ 
                        fontSize: { xs: 24, sm: 32 }, 
                        mb: { xs: 0.5, sm: 1 }, 
                        color: 'warning.main' 
                      }} />
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1.1rem', sm: '1.5rem' }
                        }}
                      >
                        {team.current_rp || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Ranking Pts
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ 
                      p: { xs: 1, sm: 2 }, 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(10px)', 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <Groups sx={{ 
                        fontSize: { xs: 24, sm: 32 }, 
                        mb: { xs: 0.5, sm: 1 }, 
                        color: 'success.main' 
                      }} />
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'success.main',
                          fontSize: { xs: '1.1rem', sm: '1.5rem' }
                        }}
                      >
                        {team.stats.wins}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Wins
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ 
                      p: { xs: 1, sm: 2 }, 
                      bgcolor: 'rgba(255,255,255,0.1)', 
                      backdropFilter: 'blur(10px)', 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'error.main',
                          fontSize: { xs: '1.1rem', sm: '1.5rem' },
                          mb: { xs: 0.5, sm: 1 }
                        }}
                      >
                        {team.stats.losses}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Losses
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            {/* Left Column - Roster and Match History */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                    Team Roster
                  </Typography>
                  <RosterTable players={team.players} />
                </Paper>
              </Box>

              {/* Recent Matches */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Matches
                </Typography>
                {team.recent_matches.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {team.recent_matches.map((match) => {
                      const isTeamA = match.team_a_id === team.id;
                      const teamScore = isTeamA ? match.score_a : match.score_b;
                      const opponentScore = isTeamA ? match.score_b : match.score_a;
                      const opponent = isTeamA ? match.team_b : match.team_a;
                      const won = (teamScore || 0) > (opponentScore || 0);
                      
                      return (
                        <Card key={match.id} sx={{ 
                          bgcolor: won ? 'success.light' : 'error.light',
                          color: won ? 'success.contrastText' : 'error.contrastText'
                        }}>
                          <CardContent>
                            <Grid container alignItems="center" spacing={2}>
                              <Grid item xs={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar 
                                    src={opponent?.logo_url || undefined}
                                    sx={{ width: 40, height: 40 }}
                                  >
                                    {opponent?.name?.charAt(0) || '?'}
                                  </Avatar>
                                  <Typography variant="h6">
                                    vs {opponent?.name || 'Unknown'}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                  {teamScore} - {opponentScore}
                                </Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                                  {match.played_at ? new Date(match.played_at).toLocaleDateString() : 'TBD'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No recent matches found
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Right Column - Team Details and Stats */}
            <Grid item xs={12} lg={4}>
              {/* Team Details */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 3 }}>
                  Team Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Region
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {team.regions?.[0]?.name || 'N/A'}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      ELO Rating
                    </Typography>
                    <Chip 
                      label={team.elo_rating?.toFixed(0) || 'N/A'} 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Ranking Points
                    </Typography>
                    <Chip 
                      label={team.current_rp || 0} 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                  {team.global_rank && (
                    <>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Global Rank
                        </Typography>
                        <Chip 
                          label={`#${team.global_rank}`} 
                          color="warning" 
                          variant="outlined"
                        />
                      </Box>
                    </>
                  )}
                  {team.leaderboard_tier && (
                    <>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Tier
                        </Typography>
                        <Chip 
                          label={team.leaderboard_tier} 
                          color="info" 
                          variant="outlined"
                        />
                      </Box>
                    </>
                  )}
                </Box>
              </Paper>

              {/* Performance Stats */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 3 }}>
                  Performance Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {team.stats.games_played}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Games Played
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                        {team.stats.avg_points.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Points
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.contrastText' }}>
                        {team.stats.wins}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.contrastText', opacity: 0.8 }}>
                        Wins
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.contrastText' }}>
                        {team.stats.losses}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'error.contrastText', opacity: 0.8 }}>
                        Losses
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Win Rate */}
                {team.stats.games_played > 0 && (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Win Rate
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {((team.stats.wins / team.stats.games_played) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  } catch (error) {
    console.error('Error in TeamPage:', error);
    notFound();
  }
}
