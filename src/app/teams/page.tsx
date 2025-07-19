import { supabase } from '@/utils/supabase';
import TeamsPageClient from './TeamsPageClient';

export const revalidate = 3600; // Revalidate data every hour

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
}

async function getTeams(): Promise<TeamWithRegion[]> {
  try {
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d';
    
    // Get teams that have roster entries for the specific event
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

    // If no teams found for this event, fall back to showing all teams
    if (uniqueTeamIds.size === 0) {
      console.log('No team rosters found for event, showing all teams as fallback');
      
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
          regions (id, name)
        `)
        .order('elo_rating', { ascending: false });
      
      if (allTeamsError) {
        console.error('Error fetching all teams:', allTeamsError);
        throw allTeamsError;
      }
      
      console.log(`Returning ${allTeams?.length || 0} teams from fallback`);
      return allTeams || [];
    }

    // Fetch team details for teams that have rosters in the event
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
      .in('id', Array.from(uniqueTeamIds))
      .order('elo_rating', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
    
    console.log(`Successfully fetched ${teams?.length || 0} teams for event`);
    return teams || [];
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
