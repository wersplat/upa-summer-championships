import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { format } from 'date-fns';
import { Whatshot, Shield, Star } from '@mui/icons-material';
import { getAwardsData } from '@/utils/awards';
import StandardCard from '@/components/StandardCard';
import PlayerCard from '@/components/PlayerCard';
import { SPACING } from '@/theme/constants';
import { AWARD_COLORS } from '@/theme/colors';

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

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

interface MatchWithTeams {
  id: string;
  team_a_id: string | null;
  team_b_id: string | null;
  team_a: { id: string; name: string; logo_url: string | null } | null;
  team_b: { id: string; name: string; logo_url: string | null } | null;
  score_a: number | null;
  score_b: number | null;
  played_at: string | null;
  round?: string; // Optional round/group information
}

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
  elo_rating?: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  regions: Array<{
    id: string;
    name: string;
  }>;
  captain: TeamCaptain | null;
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
    teams?: {
      id: string;
      name: string;
      logo_url: string | null;
    };
  }>;
}

async function getRecentMatches(): Promise<MatchWithTeams[]> {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .not('score_a', 'is', null)
    .not('score_b', 'is', null)
    .order('played_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent matches', error);
    return [];
  }

  if (!matches || matches.length === 0) return [];

  // Get unique team IDs
  const teamIds = new Set<string>();
  matches.forEach(match => {
    if (match.team_a_id) teamIds.add(match.team_a_id);
    if (match.team_b_id) teamIds.add(match.team_b_id);
  });

  // Fetch all teams data in a single query
  const { data: teamsData } = await supabase
    .from('teams')
    .select('id, name, logo_url')
    .in('id', Array.from(teamIds));

  // Create a map of team IDs to team data
  const teamsMap = new Map(
    teamsData?.map(team => [team.id, { id: team.id, name: team.name, logo_url: team.logo_url }]) || []
  );

  // Map matches with team data
  return matches.map(match => ({
    ...match,
    team_a: match.team_a_id ? teamsMap.get(match.team_a_id) || null : null,
    team_b: match.team_b_id ? teamsMap.get(match.team_b_id) || null : null
  }));
}

async function getUpcomingMatches(): Promise<MatchWithTeams[]> {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .is('score_a', null)
    .is('score_b', null)
    .order('played_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching upcoming matches', error);
    return [];
  }

  if (!matches || matches.length === 0) return [];

  // Get unique team IDs
  const teamIds = new Set<string>();
  matches.forEach(match => {
    if (match.team_a_id) teamIds.add(match.team_a_id);
    if (match.team_b_id) teamIds.add(match.team_b_id);
  });

  // Fetch all teams data in a single query
  const { data: teamsData } = await supabase
    .from('teams')
    .select('id, name, logo_url')
    .in('id', Array.from(teamIds));

  // Create a map of team IDs to team data
  const teamsMap = new Map(
    teamsData?.map(team => [team.id, { id: team.id, name: team.name, logo_url: team.logo_url }]) || []
  );

  // Map matches with team data
  return matches.map(match => ({
    ...match,
    team_a: match.team_a_id ? teamsMap.get(match.team_a_id) || null : null,
    team_b: match.team_b_id ? teamsMap.get(match.team_b_id) || null : null
  }));
}

// Extend the base TeamWithRegion but omit elo_rating since we're not using it
interface TeamWithStats extends Omit<TeamWithRegion, 'elo_rating'> {
  stats: {
    wins: number;
    losses: number;
    points_for: number;
    points_against: number;
    points_differential: number;
  };
  captain: TeamCaptain | null;
}

async function getTopTeams(): Promise<TeamWithStats[]> {
  try {
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d'; // UPA Summer Championship 2024
    
    // First, get teams that have roster entries for the specific event
    const { data: teamRosters, error: rosterError } = await supabase
      .from('team_rosters')
      .select('team_id')
      .eq('event_id', eventId);

    if (rosterError) {
      console.error('Error fetching team rosters:', rosterError);
      throw rosterError;
    }

    // Extract unique team IDs from rosters
    const uniqueTeamIds = new Set<string>();
    teamRosters?.forEach(roster => {
      if (roster.team_id) uniqueTeamIds.add(roster.team_id);
    });

    console.log(`Found ${uniqueTeamIds.size} teams with rosters for event ${eventId}`);

    // If no teams found for this event, return empty array
    if (uniqueTeamIds.size === 0) {
      console.log('No team rosters found for event');
      return [];
    }

    // Get the top teams by current_rp that are in our event
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        logo_url,
        region_id,
        current_rp,
        global_rank,
        leaderboard_tier,
        created_at,
        regions (id, name),
        team_rosters!inner (
          id,
          is_captain,
          players (
            id,
            gamertag
          )
        )
      `)
      .in('id', Array.from(uniqueTeamIds))
      .eq('team_rosters.is_captain', true)
      .order('current_rp', { ascending: false })
      .limit(6);

    if (error) throw error;
    if (!teams) return [];

    // Get match data for all teams
    const teamIds = teams.map(team => team.id);
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .or(`team_a_id.in.(${teamIds.join(',')}),team_b_id.in.(${teamIds.join(',')})`);

    // Calculate stats and captain to each team
    const teamsWithStats = teams.map(team => {
      const teamMatches = (matches || []).filter(match => 
        match.team_a_id === team.id || match.team_b_id === team.id
      );
      
      const wins = teamMatches.filter(match => {
        if (match.team_a_id === team.id) return (match.score_a || 0) > (match.score_b || 0);
        return (match.score_b || 0) > (match.score_a || 0);
      }).length;
      
      const pointsFor = teamMatches.reduce((total, match) => {
        return total + (match.team_a_id === team.id ? (match.score_a || 0) : (match.score_b || 0));
      }, 0);
      
      const pointsAgainst = teamMatches.reduce((total, match) => {
        return total + (match.team_a_id === team.id ? (match.score_b || 0) : (match.score_a || 0));
      }, 0);
      
      const losses = teamMatches.length - wins;
      const pointsDifferential = pointsFor - pointsAgainst;
      
      // Find the captain from team_rosters
      const captainRoster = team.team_rosters?.find(tr => tr.is_captain);
      const captainPlayer = captainRoster?.players as { id: string, gamertag: string } | undefined;
      
      return {
        ...team,
        captain: captainPlayer ? {
          id: captainPlayer.id,
          gamertag: captainPlayer.gamertag
        } : null,
        stats: {
          wins,
          losses,
          points_for: pointsFor,
          points_against: pointsAgainst,
          points_differential: pointsDifferential
        }
      };
    });

    // Sort by wins, then point differential
    return teamsWithStats.sort((a, b) => {
      if (a.stats.wins !== b.stats.wins) {
        return b.stats.wins - a.stats.wins;
      }
      return b.stats.points_differential - a.stats.points_differential;
    });
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
  const [recent, upcoming, topTeams, , awardsData] = await Promise.all([
    getRecentMatches(),
    getUpcomingMatches(),
    getTopTeams(),
    getTopPlayers(), // Keep this for potential future use
    getAwardsData()
  ]);

  const { omvpCandidates, dmvpCandidates, rookieCandidates } = awardsData;



  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box 
          component="img"
          src="/UPA-Summer-Championships.png"
          alt="UPA Summer Championships"
          sx={{
            height: { xs: 120, sm: 160, md: 200 },
            width: 'auto',
            mb: 2,
            mx: 'auto',
            display: 'block',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
          }}
        />
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'primary.contrastText',
            mb: 1,
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
      <Paper sx={{ mb: 6, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Top Teams
          </Typography>
          <Button 
            component={Link} 
            href="/teams" 
            variant="outlined" 
            color="primary"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            View All Teams
          </Button>
        </Box>
        <Box sx={{ p: 3 }}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Record
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {team.stats?.wins || 0}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">-</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {team.stats?.losses || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Point Diff
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          color: (team.stats?.points_differential || 0) >= 0 ? 'success.main' : 'error.main' 
                        }}
                      >
                        {(team.stats?.points_differential || 0) > 0 ? '+' : ''}{team.stats?.points_differential || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>

      {/* Tournament Awards Races Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Tournament Awards Races
          </Typography>
          <Link href="/awards" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
              View Full Awards Race →
            </Typography>
          </Link>
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
                />
              ))}
            </StandardCard>
          </Grid>
        </Grid>
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
                <Box component="th" sx={{ p: 2, textAlign: 'center', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>Group/Round</Box>
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
                  const roundInfo = match.round || 'Group Stage';

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
                            src={match.team_a?.logo_url || ''} 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                              bgcolor: 'grey.200',
                              color: 'text.primary'
                            }}
                          >
                            {match.team_a?.logo_url ? null : (match.team_a?.name?.[0] || '?')}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {match.team_a?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={match.team_b?.logo_url || ''} 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2,
                              bgcolor: 'grey.200',
                              color: 'text.primary'
                            }}
                          >
                            {match.team_b?.logo_url ? null : (match.team_b?.name?.[0] || '?')}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {match.team_b?.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {roundInfo}
                        </Typography>
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
          Our Sponsors
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Thanks to our amazing partners for supporting the UPA Summer Championships.
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 6,
          maxWidth: 1000,
          mx: 'auto',
          px: 2
        }}>
          <Box 
            component="a"
            href="https://linktr.ee/2kfilmroom"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box 
              component="img"
              src="/sponsors/2k-film-room-logo.png"
              alt="2K Film Room Logo"
              sx={{
                height: 80,
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                mb: 1
              }}
            />
            <Typography variant="body2" color="text.secondary">
              2K Film Room
            </Typography>
          </Box>
          
          <Box 
            component="a"
            href="https://bodegacatsgc.gg"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box 
              component="img"
              src="/sponsors/bodega-sponsor-logo.png"
              alt="Bodega Logo"
              sx={{
                height: 80,
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                mb: 1
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Bodega Cats Gaming Club
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer Section */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'primary.contrastText', mb: 1, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Organized by Unified Pro Am & Bodega Cats Gaming Club
        </Typography>
        <Typography variant="body1" color="text.secondary">
          For inquiries contact info@unitedproam.gg
        </Typography>
      </Box>
    </Box>
  );
}
