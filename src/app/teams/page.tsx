import { supabase } from '@/utils/supabase';
import TeamsPageClient from './TeamsPageClient';

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

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
  elo_rating: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  regions: Array<{
    id: string;
    name: string;
  }>;
  captain: TeamCaptain | null;
  wins: number;
  losses: number;
  points_differential: number;
  group_points: number;
}

async function getTeams(): Promise<TeamWithRegion[]> {
  try {
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d';
    
    // First get all teams with their basic info and captain
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
      .eq('team_rosters.event_id', eventId)
      .eq('team_rosters.is_captain', true);

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
          region_id,
          current_rp,
          elo_rating,
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
        .order('current_rp', { ascending: false });

      if (allTeamsError) {
        console.error('Error fetching all teams:', allTeamsError);
        throw allTeamsError;
      }

      // Process fallback teams to include captain information and default stats
      return (allTeams || []).map(team => {
        // Find the captain from team_rosters
        const captainRoster = team.team_rosters?.find(tr => tr.is_captain);
        const captainPlayer = captainRoster?.players as { id: string, gamertag: string } | undefined;
        
        return {
          ...team,
          captain: captainPlayer ? {
            id: captainPlayer.id,
            gamertag: captainPlayer.gamertag
          } : null,
          wins: 0,
          losses: 0,
          points_differential: 0,
          group_points: 0
        };
      });
    }

    // Get match data and group points for all teams
    const teamIds = teams.map(team => team.id);
    const [
      { data: matches },
      { data: groupPoints },
    ] = await Promise.all([
      supabase
        .from('matches')
        .select('*')
        .or(`team_a_id.in.(${teamIds.join(',')}),team_b_id.in.(${teamIds.join(',')})`)
        .eq('event_id', eventId),
      supabase
        .from('group_points_standings')
        .select('*')
        .in('team_id', teamIds)
        .eq('event_id', eventId)  // Ensure we only get points for the current event
    ]);

    // Create a map of team_id to group points and other stats for quick lookup
    const teamStatsMap = new Map();
    (groupPoints || []).forEach(gp => {
      teamStatsMap.set(gp.team_id, {
        total_points: gp.total_points || 0,
        wins: gp.wins || 0,
        losses: gp.losses || 0,
        points_for: gp.points_for || 0,
        points_against: gp.points_against || 0,
        point_differential: gp.point_differential || 0
      });
    });

    // Calculate stats for each team
    const teamsWithStats = teams.map(team => {
      const teamMatches = (matches || []).filter(match => 
        match.team_a_id === team.id || match.team_b_id === team.id
      );
      
      const teamWins = teamMatches.filter(match => {
        if (match.team_a_id === team.id) return (match.score_a || 0) > (match.score_b || 0);
        return (match.score_b || 0) > (match.score_a || 0);
      }).length;
      
      const teamPointsFor = teamMatches.reduce((total, match) => {
        return total + (match.team_a_id === team.id ? (match.score_a || 0) : (match.score_b || 0));
      }, 0);
      
      const teamPointsAgainst = teamMatches.reduce((total, match) => {
        return total + (match.team_a_id === team.id ? (match.score_b || 0) : (match.score_a || 0));
      }, 0);
      
      const teamLosses = teamMatches.length - teamWins;
      const pointsDiff = teamPointsFor - teamPointsAgainst;
      
      // Find the captain from team_rosters
      const captainRoster = team.team_rosters?.find(tr => tr.is_captain);
      const captainPlayer = captainRoster?.players as { id: string, gamertag: string } | undefined;
      
      // Get stats from group_points_standings if available, otherwise use calculated values
      const teamStats = teamStatsMap.get(team.id) || {
        total_points: 0,
        wins: teamWins,
        losses: teamLosses,
        points_for: teamPointsFor,
        points_against: teamPointsAgainst,
        point_differential: pointsDiff
      };
      
      return {
        ...team,
        captain: captainPlayer ? {
          id: captainPlayer.id,
          gamertag: captainPlayer.gamertag
        } : null,
        wins: teamStats.wins,
        losses: teamStats.losses,
        points_for: teamStats.points_for,
        points_against: teamStats.points_against,
        points_differential: teamStats.point_differential,
        group_points: teamStats.total_points
      };
    });

    // Sort by group points, then point differential
    return teamsWithStats.sort((a, b) => {
      if (a.group_points !== b.group_points) return b.group_points - a.group_points;
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
