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
}

async function getTeams(): Promise<TeamWithRegion[]> {
  try {
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d';
    
    // Get teams that have roster entries for the specific event, including captain info
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
          points_differential: 0
        };
      });
    }

    // Process teams to include captain information and calculate stats
    const teamsWithStats = await Promise.all((teams || []).map(async (team) => {
      // Find the captain from team_rosters
      const captainRoster = team.team_rosters?.find(tr => tr.is_captain);
      const captainPlayer = captainRoster?.players as { id: string, gamertag: string } | undefined;
      
      // Get all matches for this team to calculate W-L and points differential
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .or(`team_a_id.eq.${team.id},team_b_id.eq.${team.id}`)
        .not('score_a', 'is', null)
        .not('score_b', 'is', null);
      
      // Calculate W-L and points differential
      let wins = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;
      
      matchesData?.forEach(match => {
        const isTeamA = match.team_a_id === team.id;
        const teamScore = isTeamA ? (match.score_a || 0) : (match.score_b || 0);
        const opponentScore = isTeamA ? (match.score_b || 0) : (match.score_a || 0);
        
        pointsFor += teamScore;
        pointsAgainst += opponentScore;
        
        if (teamScore > opponentScore) wins++;
      });
      
      const losses = (matchesData?.length || 0) - wins;
      const points_differential = pointsFor - pointsAgainst;
      
      return {
        ...team,
        captain: captainPlayer ? {
          id: captainPlayer.id,
          gamertag: captainPlayer.gamertag
        } : null,
        wins,
        losses,
        points_differential
      };
    }));

    // Sort by wins (descending) by default
    return teamsWithStats.sort((a, b) => b.wins - a.wins);
  } catch (error) {
    console.error('Error in getTeams:', error);
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
