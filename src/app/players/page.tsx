import { supabase } from '@/utils/supabase';
import type { Player } from '@/utils/supabase';
import PlayersPageClient from './PlayersPageClient';

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

export interface PlayerWithTeam extends Player {
  avatar_url?: string | null;
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

async function getPlayers(): Promise<PlayerWithTeam[]> {
  try {
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
        team_rosters!inner(
          team_id,
          teams(
            id,
            name,
            logo_url
          )
        )
      `)
      .order('player_rp', { ascending: false })
      .limit(100);

    if (error) throw error;
    
    // Process player data to match expected interface
    const playersWithStats: PlayerWithTeam[] = (players || []).map((player) => {
      // Extract team data from team_rosters relation
      const teams = player.team_rosters?.map((roster: any) => ({
        id: roster.teams.id,
        name: roster.teams.name,
        logo_url: roster.teams.logo_url,
      })) || [];

      return {
        id: player.id,
        gamertag: player.gamertag,
        position: player.position,
        region_id: player.region_id,
        current_team_id: player.current_team_id,
        performance_score: player.performance_score,
        player_rp: player.player_rp,
        player_rank_score: player.player_rank_score,
        monthly_value: player.monthly_value,
        created_at: player.created_at,
        avatar_url: null, // Not available in database
        teams,
        stats: {
          games_played: 0,
          points_per_game: 0,
          assists_per_game: 0,
          rebounds_per_game: 0,
          steals_per_game: 0,
          blocks_per_game: 0,
          field_goal_percentage: 0,
          three_point_percentage: 0,
          free_throw_percentage: 0,
          minutes_per_game: 0,
          turnovers_per_game: 0,
          fouls_per_game: 0,
          plus_minus: 0,
        },
      };
    });

    return playersWithStats;
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

export default async function PlayersPage() {
  const players = await getPlayers();
  return <PlayersPageClient players={players} />;
}
