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
