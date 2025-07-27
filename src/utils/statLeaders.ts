import { createClient } from '@/utils/supabase/server';

export interface StatLeader {
  id: string;
  gamertag: string;
  team_name: string | null;
  position: string | null;
  games_played: number;
  value: number;
  display_value: string;
}

export async function getStatLeaders() {
  const supabase = createClient();
  
  // Get all players with at least 3 games played
  const { data: players, error } = await supabase
    .from('player_stats')
    .select(`
      id,
      gamertag,
      position,
      team_name,
      games_played,
      points_per_game,
      assists_per_game,
      rebounds_per_game,
      steals_per_game,
      field_goal_percentage,
      three_point_percentage
    `)
    .gte('games_played', 3)
    .order('games_played', { ascending: false });

  if (error || !players) {
    console.error('Error fetching players for stat leaders:', error);
    return {};
  }

  // Helper function to get top 5 players for a stat
  const getTopPlayers = (stat: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    return [...players]
      .sort((a, b) => {
        const aVal = a[stat as keyof typeof a] as number;
        const bVal = b[stat as keyof typeof b] as number;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      })
      .slice(0, 5)
      .map(player => ({
        id: player.id,
        gamertag: player.gamertag,
        team_name: player.team_name,
        position: player.position,
        games_played: player.games_played,
        value: player[stat as keyof typeof player] as number,
        display_value: stat.includes('percentage') 
          ? `${(player[stat as keyof typeof player] as number).toFixed(1)}%`
          : (player[stat as keyof typeof player] as number).toFixed(1)
      }));
  };

  return {
    points: getTopPlayers('points_per_game'),
    assists: getTopPlayers('assists_per_game'),
    rebounds: getTopPlayers('rebounds_per_game'),
    steals: getTopPlayers('steals_per_game'),
    fieldGoalPercentage: getTopPlayers('field_goal_percentage'),
    threePointPercentage: getTopPlayers('three_point_percentage').filter(p => p.games_played >= 3)
  };
}
