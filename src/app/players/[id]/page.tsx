import { notFound } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Player, Team } from '@/utils/supabase';
import PlayerProfile from '@/components/PlayerProfile';

export const revalidate = 30; // Revalidate data every 30 seconds

interface PlayerWithTeam extends Player {
  teams?: {
    id: string;
    name: string;
    logo_url: string | null;
  }[];
  stats?: {
    games_played: number;
    points_per_game: number;
    assists_per_game: number;
    rebounds_per_game: number;
    steals_per_game: number;
    blocks_per_game: number;
    field_goal_percentage: number;
    three_point_percentage: number;
    free_throw_percentage: number;
    minutes_per_game: number;
    turnovers_per_game: number;
    fouls_per_game: number;
    plus_minus: number;
  };
}

async function getPlayerData(id: string): Promise<PlayerWithTeam | null> {
  try {
    // Get player basic info
    const { data: player, error } = await supabase
      .from('players')
      .select(`
        *,
        teams:team_rosters(
          team_id,
          teams(
            id,
            name,
            logo_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !player) {
      console.error('Error fetching player:', error);
      return null;
    }

    // Get player stats (this is a simplified example - adjust based on your actual stats table structure)
    const { data: stats } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', id)
      .single();

    return {
      ...player,
      stats: stats ? {
        games_played: stats.games_played || 0,
        points_per_game: stats.points_per_game || 0,
        assists_per_game: stats.assists_per_game || 0,
        rebounds_per_game: stats.rebounds_per_game || 0,
        steals_per_game: stats.steals_per_game || 0,
        blocks_per_game: stats.blocks_per_game || 0,
        field_goal_percentage: stats.field_goal_percentage || 0,
        three_point_percentage: stats.three_point_percentage || 0,
        free_throw_percentage: stats.free_throw_percentage || 0,
        minutes_per_game: stats.minutes_per_game || 0,
        turnovers_per_game: stats.turnovers_per_game || 0,
        fouls_per_game: stats.fouls_per_game || 0,
        plus_minus: stats.plus_minus || 0,
      } : undefined,
    };
  } catch (error) {
    console.error('Error in getPlayerData:', error);
    return null;
  }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await getPlayerData(params.id);

  if (!player) {
    notFound();
  }

  return <PlayerProfile player={player} />;
}
