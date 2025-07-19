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
    
    // Get teams that have matches in the specific event
    const { data: teamIds, error: matchError } = await supabase
      .from('matches')
      .select('team_a_id, team_b_id')
      .eq('event_id', eventId);

    if (matchError) throw matchError;

    // Extract unique team IDs from matches
    const uniqueTeamIds = new Set<string>();
    teamIds?.forEach(match => {
      if (match.team_a_id) uniqueTeamIds.add(match.team_a_id);
      if (match.team_b_id) uniqueTeamIds.add(match.team_b_id);
    });

    if (uniqueTeamIds.size === 0) {
      return [];
    }

    // Fetch team details for teams participating in the event
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

    if (error) throw error;
    return teams || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}



export default async function TeamsPage() {
  const teams = await getTeams();
  return <TeamsPageClient teams={teams} />;
}
