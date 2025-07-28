import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { format } from 'date-fns';
import { Whatshot, Shield, Star } from '@mui/icons-material';
import { getAwardsData } from '@/utils/awards';
import StandardCard from '@/components/StandardCard';
import PlayerCard from '@/components/PlayerCard';

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
    teams?: Array<{
      id: string;
      name: string;
      logo_url: string | null;
    }>;
  }>;
}

async function getRecentMatches(): Promise<MatchWithTeams[]> {
  const eventId = '0d974c94-7531-41e9-833f-d1468690d72d'; // UPA Summer Championship 2024
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .eq('event_id', eventId)
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
  const eventId = '0d974c94-7531-41e9-833f-d1468690d72d'; // UPA Summer Championship 2025 
  
  const { data: matches, error } = await supabase
    .from('upcoming_matches_view')
    .select('*')
    .eq('event_id', eventId)
    .order('scheduled_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching upcoming matches', error);
    return [];
  }

  if (!matches || matches.length === 0) return [];

  // Map the view data to MatchWithTeams interface
  return matches.map(match => ({
    id: match.id,
    team_a_id: match.team_a_id,
    team_b_id: match.team_b_id,
    team_a: {
      id: match.team_a_id,
      name: match.team_a_name,
      logo_url: match.team_a_logo
    },
    team_b: {
      id: match.team_b_id,
      name: match.team_b_name,
      logo_url: match.team_b_logo
    },
    score_a: null,  // These are upcoming matches, so scores should be null
    score_b: null,
    played_at: match.scheduled_at,
    round: match.round?.toString()
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
    group_points: number;
  };
  captain: TeamCaptain | null;
}

async function getTopTeams(): Promise<TeamWithStats[]> {
  try {
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d'; // UPA Summer Championship 2025
    
    // Get team standings with group points from the view for the specific event
    const { data: standings, error: standingsError } = await supabase
      .from('group_points_standings')
      .select(`
        group_id,
        group_name,
        event_id,
        event_name,
        team_id,
        team_name,
        position,
        matches_played,
        wins,
        losses,
        total_points,
        wins_by_20_plus,
        regular_wins,
        forfeits,
        points_for,
        points_against,
        point_differential,
        updated_at
      `)
      .eq('event_id', eventId)
      .order('total_points', { ascending: false })
      .order('point_differential', { ascending: false })
      .limit(6);

    if (standingsError) {
      console.error('Error fetching group standings:', standingsError);
      throw standingsError;
    }

    if (!standings || standings.length === 0) {
      console.log('No team standings found');
      return [];
    }

    // Get team IDs from standings
    const teamIds = standings.map(standing => standing.team_id);

    // Get detailed team info for the top teams
    const { data: teams, error: teamsError } = await supabase
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
        team_rosters (
          id,
          is_captain,
          players (
            id,
            gamertag
          )
        )
      `)
      .in('id', teamIds);

    if (teamsError) throw teamsError;
    if (!teams) return [];

    // Combine standings data with team details
    const teamsWithStats = teams.map(team => {
      const standing = standings.find(s => s.team_id === team.id);
      
      // Find the captain from team_rosters
      const captainRoster = team.team_rosters?.find(tr => tr.is_captain);
      const captainPlayer = captainRoster?.players as { id: string, gamertag: string } | undefined;
      
      return {
        ...team,
        captain: captainPlayer ? {
          id: captainPlayer.id,
          gamertag: captainPlayer.gamertag
        } : null,
        // Map the stats from the view
        wins: standing?.wins || 0,
        losses: standing?.losses || 0,
        points_differential: standing?.point_differential || 0,
        group_points: standing?.total_points || 0,
        stats: {
          wins: standing?.wins || 0,
          losses: standing?.losses || 0,
          points_for: standing?.points_for || 0,
          points_against: standing?.points_against || 0,
          points_differential: standing?.point_differential || 0,
          group_points: standing?.total_points || 0
        }
      };
    });

    // Sort by group points, then point differential
    return teamsWithStats.sort((a, b) => {
      if (b.stats.group_points !== a.stats.group_points) {
        return b.stats.group_points - a.stats.group_points;
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
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d'; // UPA Summer Championship 2024
    
    // First, get player IDs that have roster entries for the specific event
    const { data: teamRosters, error: rosterError } = await supabase
      .from('team_rosters')
      .select('player_id')
      .eq('event_id', eventId)
      .is('left_at', null);

    if (rosterError) {
      console.error('Error fetching team rosters:', rosterError);
      throw rosterError;
    }

    // Extract unique player IDs from rosters
    const playerIds = Array.from(new Set(teamRosters?.map(roster => roster.player_id).filter(Boolean)));
    
    if (playerIds.length === 0) {
      console.log('No players found for the event');
      return [];
    }

    // Get top players that are in our event
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
        team_rosters!inner (
          id,
          team_id,
          player_id,
          is_captain,
          is_player_coach,
          joined_at,
          left_at,
          event_id,
          teams (
            id,
            name,
            logo_url
          )
        )
      `)
      .in('id', playerIds)
      .is('team_rosters.left_at', null)
      .eq('team_rosters.event_id', eventId)
      .order('player_rp', { ascending: false })
      .limit(8);

    if (error) throw error;
    return players || [];
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

async function getTeamWithRoster(teamId: string) {
  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      logo_url,
      team_rosters!inner(
        id,
        is_captain,
        event_id,
        players (
          id,
          gamertag,
          position
        )
      )
    `)
    .eq('id', teamId)
    .eq('team_rosters.event_id', '0d974c94-7531-41e9-833f-d1468690d72d')
    .single();

  if (error) {
    console.error(`Error fetching team ${teamId}:`, error);
    return null;
  }
  
  // Filter team_rosters to only include those from the specified event
  if (team && team.team_rosters) {
    team.team_rosters = team.team_rosters.filter(
      (roster: any) => roster.event_id === '0d974c94-7531-41e9-833f-d1468690d72d'
    );
  }
  
  return team;
}

async function MatchTeamCard({ teamId, isHome }: { teamId: string, isHome: boolean }) {
  const team = await getTeamWithRoster(teamId);
  
  if (!team) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography color="error">Error loading team data</Typography>
      </Box>
    );
  }

  const captain = team.team_rosters?.find(tr => tr.is_captain)?.players;
  const players = team.team_rosters?.map(tr => tr.players).filter(Boolean) || [];

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Avatar 
        src={team.logo_url || undefined} 
        sx={{ 
          width: 100, 
          height: 100, 
          mx: 'auto',
          mb: 2,
          border: '2px solid',
          borderColor: 'primary.main'
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        {team.name}
      </Typography>
      {captain && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Captain: {captain.gamertag}
        </Typography>
      )}
      
      <Box sx={{ mt: 2, textAlign: 'left' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          ROSTER:
        </Typography>
        {players.length > 0 ? (
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {players.map((player: any) => (
              <Box component="li" key={player.id} sx={{ mb: 0.5 }}>
                <Typography variant="body2">
                  {player.gamertag} 
                  {player.position && <span style={{ color: 'text.secondary' }}> • {player.position}</span>}
                  {captain?.id === player.id && (
                    <Chip 
                      label="C" 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1, height: 18, '& .MuiChip-label': { px: 0.5 } }} 
                    />
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No roster information available
          </Typography>
        )}
      </Box>
    </Box>
  );
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
          src="/UPA-Summer-Championship.png"
          alt="UPA Summer Championship"
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
          UPA Summer Championship
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

      {/* Championship Sunday Section */}
      <Paper sx={{ mb: 6, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Championship Sunday
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography 
                variant="h6" 
                color="primary" 
                gutterBottom 
                textAlign="center" 
                sx={{ fontWeight: 'bold', mb: 3 }}
              >
                GRAND FINALS - BEST OF 3 (Breakout win will result in a Bracket Reset)
              </Typography>
              
              <Grid container spacing={3}>
                {/* Team A */}
                <Grid item xs={12} md={5}>
                  <MatchTeamCard 
                    teamId="2011b580-616e-4919-aa44-f001c85c4e4f" 
                    isHome={true}
                  />
                </Grid>
                
                {/* VS Separator */}
                <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main',
                      my: 2,
                      transform: 'rotate(-90deg)',
                      '@media (min-width: 900px)': {
                        transform: 'none',
                      }
                    }}
                  >
                    VS
                  </Typography>
                </Grid>
                
                {/* Team B */}
                <Grid item xs={12} md={5}>
                  <MatchTeamCard 
                    teamId="fe0890c1-1303-40e6-a18c-dbcb4e251e01" 
                    isHome={false}
                  />
                </Grid>
              </Grid>
              
              {/* Game Schedule */}
              <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  GAME SCHEDULE
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  <Chip 
                    label="Game 1 - 8:45 PM EST" 
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 600, minWidth: 180 }}
                  />
                  <Chip 
                    label="Game 2 - 9:15 PM EST" 
                    variant="outlined"
                    sx={{ fontWeight: 600, minWidth: 180 }}
                  />
                  <Chip 
                    label="Game 3 (If Needed) - 9:45 PM EST" 
                    variant="outlined"
                    sx={{ fontWeight: 600, minWidth: 180, fontStyle: 'italic', borderStyle: 'dashed' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
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
                    assists_per_game: player.assists_per_game
                  }}
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
          Thanks to our amazing partners for supporting the UPA Summer Championship.
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
