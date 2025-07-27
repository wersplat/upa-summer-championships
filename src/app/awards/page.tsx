import { Metadata } from 'next';
import { getAwardsData } from '@/utils/awards';
import AwardsPage from './AwardsPage';

// Define interfaces for the data structure
export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface PlayerStats {
  id: string;
  gamertag: string;
  position: string;
  team_id: string;
  team_name: string;
  team_logo_url: string | null;
  points_per_game: number;
  assists_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  steals_per_game: number;
  blocks_per_game: number;
  rebounds_per_game: number;
  games_played: number;
  is_rookie: boolean;
  overall_rating: number;
  offensive_rating?: number;
  defensive_rating?: number;
  rookie_rating?: number;
}

export const metadata: Metadata = {
  title: 'Awards Race - UPA Summer Championship',
  description: 'Track the race for Offensive MVP, Defensive MVP, and Rookie of Tournament awards in the UPA Summer Championship.',
};

export const revalidate = 30;

export default async function Awards() {
  const { omvpCandidates, dmvpCandidates, rookieCandidates } = await getAwardsData();

  return (
    <AwardsPage 
      omvpCandidates={omvpCandidates}
      dmvpCandidates={dmvpCandidates}
      rookieCandidates={rookieCandidates}
    />
  );
}
