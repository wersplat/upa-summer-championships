import { supabase } from '@/utils/supabase';
import TeamsPageClient from './TeamsPageClient';

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

interface TeamPlayer {
  id: string;
  gamertag: string;
  is_captain: boolean;
  has_played: boolean;
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
  players: TeamPlayer[];
  wins: number;
  losses: number;
  points_differential: number;
}

async function getTeams(): Promise<TeamWithRegion[]> {
  try {
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d';
    
    // First get all teams with their basic info and all players
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        logo_url,
        created_at,
        team_rosters (
          id,
          is_captain,
          players (
            id,
            gamertag
          )
        )
      `)
      .eq('team_rosters.event_id', eventId);

    if (error) {
      console.error('Error fetching teams with rosters:', error);
      throw error;
    }

    console.log(`Found ${teams?.length || 0} teams with rosters for event ${eventId}`);

    // If no teams found for this event, fall back to showing all teams
    if (!teams || teams.length === 0) {
      console.log('No teams found for the event, falling back to all teams');
      const { data: allTeams, error: allTeamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          logo_url,
          created_at,
          team_rosters (
            id,
            is_captain,
            players (
              id,
              gamertag
            )
          )
        `)
        .order('current_rp', { ascending: false });

      if (allTeamsError) {
        console.error('Error fetching all teams:', allTeamsError);
        throw allTeamsError;
      }

      // Define types for the roster and player objects
      type RosterPlayer = {
        id: string;
        gamertag: string;
      };
      
      type TeamRoster = {
        players: RosterPlayer | null;
        is_captain: boolean;
      };
      
      // Process fallback teams to include all players and default stats
      return (allTeams || []).map(team => {
        // Get all players from team_rosters
        const rosters = (team.team_rosters || []) as unknown as TeamRoster[];
        const players = rosters
          .filter(roster => roster.players?.id)
          .map(roster => ({
            id: roster.players!.id,
            gamertag: roster.players!.gamertag || 'Unknown',
            is_captain: roster.is_captain || false,
            has_played: false // In fallback mode, we don't know if they've played
          }));
        
        return {
          ...team,
          players,
          wins: 0,
          losses: 0,
          points_differential: 0,
        };
      });
    }

    // Get all matches for the event to calculate full event records
    const { data: allEventMatches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('event_id', eventId);
  
    if (matchesError) {
      console.error('Error fetching event matches:', matchesError);
      throw matchesError;
    }
    
    // Get all players who have played at least one game in this event
    const { data: playersWithGames, error: playersError } = await supabase
      .from('player_stats')
      .select('player_id')
      .in('match_id', allEventMatches?.map(m => m.id) || [])
      .not('player_id', 'is', null);
      
    if (playersError) {
      console.error('Error fetching players with games:', playersError);
      throw playersError;
    }
    
    // Create a Set for faster lookups of players with games
    const playersWithGamesSet = new Set(
      (playersWithGames || []).map(p => p.player_id)
    );
    
    console.log(`Found ${playersWithGamesSet.size} players with game stats in this event`);

    // Calculate full event stats for each team
    const teamsWithStats = teams.map(team => {
      // Get all matches for this team in the event
      // No need to filter by status here since we already filtered by stage in the query
      const teamMatches = (allEventMatches || []).filter(match => 
        match.team_a_id === team.id || match.team_b_id === team.id
      );
      
      // Calculate full event stats
      const eventWins = teamMatches.filter(match => {
        if (match.team_a_id === team.id) return (match.score_a || 0) > (match.score_b || 0);
        return (match.score_b || 0) > (match.score_a || 0);
      }).length;
      
      const eventPointsFor = teamMatches.reduce((total, match) => {
        return total + (match.team_a_id === team.id ? (match.score_a || 0) : (match.score_b || 0));
      }, 0);
      
      const eventPointsAgainst = teamMatches.reduce((total, match) => {
        return total + (match.team_a_id === team.id ? (match.score_b || 0) : (match.score_a || 0));
      }, 0);
      
      const eventLosses = teamMatches.length - eventWins;
      const eventPointDiff = eventPointsFor - eventPointsAgainst;
      
      // Define types for the roster and player objects
      type RosterPlayer = {
        id: string;
        gamertag: string;
      };
      
      type TeamRoster = {
        players: RosterPlayer | null;
        is_captain: boolean;
      };
      
      // Get only players who have played at least one game (appear in player_stats)
      const rosters = (team.team_rosters || []) as unknown as TeamRoster[];
      const players = rosters
        .filter(roster => roster.players?.id && playersWithGamesSet.has(roster.players.id))
        .map(roster => ({
          id: roster.players!.id,
          gamertag: roster.players!.gamertag || 'Unknown',
          is_captain: roster.is_captain || false,
          has_played: true
        }))
        // Sort by gamertag
        .sort((a, b) => a.gamertag.localeCompare(b.gamertag));
      
      return {
        ...team,
        players,
        wins: eventWins,
        losses: eventLosses,
        points_for: eventPointsFor,
        points_against: eventPointsAgainst,
        points_differential: eventPointDiff,
        stats: {
          wins: eventWins,
          losses: eventLosses,
          points_for: eventPointsFor,
          points_against: eventPointsAgainst,
          point_differential: eventPointDiff
        }
      };
    });

    // Sort by wins, then point differential
    return teamsWithStats.sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      return b.points_differential - a.points_differential;
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await getTeams();
  console.log(`Server: Passing ${teams.length} teams to client component`);
  
  // Add a simple fallback if teams is empty
  if (!teams || teams.length === 0) {
    console.error('Server: No teams found, this should not happen with fallback');
  }
  
  return <TeamsPageClient teams={teams} />;
}
