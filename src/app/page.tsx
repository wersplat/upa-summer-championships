import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
} from '@mui/material';
import { Team } from '@/utils/supabase';

interface MatchWithTeams {
  id: string;
  team_a_id: string | null;
  team_b_id: string | null;
  team_a: { id: string; name: string; logo_url: string | null } | null;
  team_b: { id: string; name: string; logo_url: string | null } | null;
  score_a: number | null;
  score_b: number | null;
  played_at: string | null;
}

interface TeamWithRegion extends Team {
  regions: Array<{
    id: string;
    name: string;
  }>;
}

interface PlayerWithRoster {
  id: string;
  gamertag: string;
  position?: string | null;
  region_id?: string | null;
  current_team_id?: string | null;
  performance_score: number;
  player_rp: number;
  player_rank_score: number;
  monthly_value: number;
  created_at: string;
  team_rosters?: Array<{
    id: string;
    team_id: string;
    player_id: string;
    is_captain: boolean;
    is_player_coach: boolean;
    joined_at: string;
    left_at: string | null;
    event_id: string | null;
  }>;
}

async function getRecentMatches(): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `id, team_a_id, team_b_id, score_a, score_b, played_at,
       team_a:team_a_id (id, name, logo_url),
       team_b:team_b_id (id, name, logo_url)`
    )
    .not('score_a', 'is', null)
    .not('score_b', 'is', null)
    .order('played_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent matches', error);
    return [];
  }

  // Map the response to MatchWithTeams interface
  return (data || []).map(match => ({
    ...match,
    team_a: match.team_a?.[0] || null,
    team_b: match.team_b?.[0] || null
  }));
}

async function getUpcomingMatches(): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `id, team_a_id, team_b_id, score_a, score_b, played_at,
       team_a:team_a_id (id, name, logo_url),
       team_b:team_b_id (id, name, logo_url)`
    )
    .is('score_a', null)
    .is('score_b', null)
    .order('played_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching upcoming matches', error);
    return [];
  }

  // Map the response to MatchWithTeams interface
  return (data || []).map(match => ({
    ...match,
    team_a: match.team_a?.[0] || null,
    team_b: match.team_b?.[0] || null
  }));
}

async function getTopTeams(): Promise<TeamWithRegion[]> {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        logo_url,
        region_id,
        current_rp,
        elo_rating,
        global_rank,
        leaderboard_tier,
        created_at,
        regions (id, name)
      `)
      .order('elo_rating', { ascending: false })
      .limit(6);

    if (error) throw error;
    return teams || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

async function getTopPlayers(): Promise<PlayerWithRoster[]> {
  try {
    const { data: players, error } = await supabase
      .from('players')
      .select(`
        id,
        gamertag,
        position,
        region_id,
        current_team_id,
        performance_score,
        player_rp,
        player_rank_score,
        monthly_value,
        created_at,
        team_rosters (
          id,
          team_id,
          player_id,
          is_captain,
          is_player_coach,
          joined_at,
          left_at,
          event_id
        )
      `)
      .is('team_rosters.left_at', null)
      .order('player_rp', { ascending: false })
      .limit(8);

    if (error) throw error;
    return players || [];
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

export default async function Home() {
  const [recent, upcoming, topTeams, topPlayers] = await Promise.all([
    getRecentMatches(),
    getUpcomingMatches(),
    getTopTeams(),
    getTopPlayers()
  ]);



  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.contrastText',
            mb: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          UPA Summer Championships
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'text.secondary',
            mb: 4
          }}
        >
          NBA 2K Pro Am Tournament
        </Typography>
      </Box>

      {/* Tournament Standings Explanation Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
        role="region"
        aria-labelledby="standings-title"
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            id="standings-title"
            variant="h5" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary',
              mb: 1
            }}
          >
            Tournament Standings
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary'
            }}
          >
            How teams are ranked in the championship
          </Typography>
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="body2" sx={{ mb: 1.5, color: 'text.primary' }}>
              Teams are ranked by <strong>wins</strong>, then by <strong>points differential</strong> (total points scored minus points allowed). 
              Higher win percentage and positive point differential indicate stronger performance.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label="Wins First" 
                size="small" 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  fontWeight: 500
                }}
              />
              <Chip 
                label="Point Differential" 
                size="small" 
                sx={{ 
                  bgcolor: 'secondary.main', 
                  color: 'secondary.contrastText',
                  fontWeight: 500
                }}
              />
              <Chip 
                label="Clear Rankings" 
                size="small" 
                sx={{ 
                  bgcolor: 'success.main', 
                  color: 'success.contrastText',
                  fontWeight: 500
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 1.5,
                  minWidth: 90,
                  bgcolor: 'success.dark',
                  color: 'success.contrastText',
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: 'success.main'
                }}
                role="img"
                aria-label="Wins statistic"
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                  WINS
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  Primary Rank
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 1.5,
                  minWidth: 90,
                  bgcolor: 'warning.dark',
                  color: 'warning.contrastText',
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: 'warning.main'
                }}
                role="img"
                aria-label="Losses statistic"
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                  LOSSES
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  Record
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  textAlign: 'center',
                  p: 1.5,
                  minWidth: 90,
                  bgcolor: 'info.dark',
                  color: 'info.contrastText',
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: 'info.main'
                }}
                role="img"
                aria-label="Points differential statistic"
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                  +/- DIFF
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  Tiebreaker
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Teams Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Top Teams
          </Typography>
          <Button 
            component={Link} 
            href="/teams" 
            variant="outlined" 
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            View All Teams
          </Button>
        </Box>
        <Grid container spacing={3}>
          {topTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <Card 
                component={Link} 
                href={`/teams/${team.id}`}
                sx={{ 
                  height: '100%',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  cursor: 'pointer'
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar 
                      src={team.logo_url || undefined} 
                      imgProps={{ referrerPolicy: 'no-referrer' }}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {team.logo_url ? '' : team.name.charAt(0)}
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {team.name}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="body2" color="text.secondary">
                      {team.regions?.[0]?.name || 'No Region'}
                    </Typography>
                  }
                />
                <CardContent sx={{ pt: 0 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {team.global_rank && (
                      <Chip 
                        label={`#${team.global_rank} Global`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    {team.leaderboard_tier && (
                      <Chip 
                        label={team.leaderboard_tier} 
                        size="small" 
                        color="secondary"
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ELO Rating
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {team.elo_rating || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Current RP
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {team.current_rp || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Top Players Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 3 }}>
          Featured Players
        </Typography>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Grid container spacing={2}>
            {topPlayers.slice(0, 8).map((player) => {
              const rosterInfo = player.team_rosters?.[0];
              return (
                <Grid item xs={12} sm={6} md={3} key={player.id}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'grey.50',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        '& .MuiTypography-root': {
                          color: 'primary.contrastText',
                        },
                      },
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        mr: 2,
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      {player.gamertag.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {player.gamertag}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {player.position && (
                          <Chip 
                            label={player.position} 
                            size="small" 
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                            }}
                          />
                        )}
                        {rosterInfo?.is_captain && (
                          <Chip 
                            label="C" 
                            size="small" 
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              bgcolor: 'warning.main',
                              color: 'warning.contrastText',
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Box>

      {/* Recent Results Section */}
      <Paper sx={{ mb: 6, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Recent Results
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
              <Box component="tr">
                <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Home</Box>
                <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Away</Box>
                <Box component="th" sx={{ p: 2, textAlign: 'center', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Score</Box>
                <Box component="th" sx={{ p: 2, textAlign: 'right', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Played</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {recent.map((match) => {
                const date = match.played_at ? new Date(match.played_at) : null;
                const score = match.score_a !== null && match.score_b !== null ? (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.primary' }}>
                    {match.score_a}-{match.score_b}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">vs</Typography>
                );

                return (
                  <Box 
                    component="tr" 
                    key={match.id}
                    sx={{ 
                      borderTop: 1, 
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'grey.50'
                      }
                    }}
                  >
                    <Box component="td" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={match.team_a?.logo_url || undefined} 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 2,
                            bgcolor: 'grey.200',
                            color: 'text.primary'
                          }}
                        >
                          {match.team_a?.logo_url ? '' : match.team_a?.name?.[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {match.team_a?.name}
                        </Typography>
                      </Box>
                    </Box>
                    <Box component="td" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={match.team_b?.logo_url || undefined} 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 2,
                            bgcolor: 'grey.200',
                            color: 'text.primary'
                          }}
                        >
                          {match.team_b?.logo_url ? '' : match.team_b?.name?.[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {match.team_b?.name}
                        </Typography>
                      </Box>
                    </Box>
                    <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                      {score}
                    </Box>
                    <Box component="td" sx={{ p: 2, textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        {date ? format(date, 'MMM d, h:mm a') : 'TBD'}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              {recent.length === 0 && (
                <Box component="tr">
                  <Box component="td" colSpan={4} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent matches
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Upcoming Schedule Section */}
      <Paper sx={{ mb: 6, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Upcoming Schedule
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
              <Box component="tr">
                <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Home</Box>
                <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Away</Box>
                <Box component="th" sx={{ p: 2, textAlign: 'center', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Score</Box>
                <Box component="th" sx={{ p: 2, textAlign: 'right', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Tip Off</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {upcoming.length === 0 ? (
                <Box component="tr">
                  <Box component="td" colSpan={4} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No upcoming games
                    </Typography>
                  </Box>
                </Box>
              ) : (
                upcoming.map((match) => {
                  const date = match.played_at ? new Date(match.played_at) : null;
                  const score = match.score_a !== null && match.score_b !== null ? (
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.primary' }}>
                      {match.score_a}-{match.score_b}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">vs</Typography>
                  );

                  return (
                    <Box 
                      component="tr" 
                      key={match.id}
                      sx={{ 
                        borderTop: 1, 
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'grey.50'
                        }
                      }}
                    >
                      <Box component="td" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={match.team_a?.logo_url || undefined} 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                              bgcolor: 'grey.200',
                              color: 'text.primary'
                            }}
                          >
                            {match.team_a?.logo_url ? '' : match.team_a?.name?.[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {match.team_a?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={match.team_b?.logo_url || undefined} 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                              bgcolor: 'grey.200',
                              color: 'text.primary'
                            }}
                          >
                            {match.team_b?.logo_url ? '' : match.team_b?.name?.[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {match.team_b?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                        {score}
                      </Box>
                      <Box component="td" sx={{ p: 2, textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          {date ? format(date, 'MMM d, h:mm a') : 'TBD'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Sponsors Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'primary.contrastText', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Sponsors
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Thanks to our amazing partners for supporting the UPA Summer Championships.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          <Typography variant="body1" color="text.secondary">Sponsor 1</Typography>
          <Typography variant="body1" color="text.secondary">Sponsor 2</Typography>
          <Typography variant="body1" color="text.secondary">Sponsor 3</Typography>
        </Box>
      </Box>

      {/* Footer Section */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'primary.contrastText', mb: 1, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Organized by UPA
        </Typography>
        <Typography variant="body1" color="text.secondary">
          For inquiries contact info@unitedproam.gg
        </Typography>
      </Box>
    </Box>
  );
}
