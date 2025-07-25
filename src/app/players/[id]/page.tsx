import { notFound } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import type { Player } from '@/utils/supabase';
import dynamic from 'next/dynamic';

// Define the player stats interface
interface PlayerStats {
  games_played: number;
  points_per_game: number;
  assists_per_game: number;
  rebounds_per_game: number;
  steals_per_game: number;
  blocks_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  free_throw_percentage: number;
  turnovers_per_game: number;
  fouls_per_game: number;
  plus_minus: number;
  mvp_count?: number;
  avg_performance_score?: number;
}

// Define the team interface
interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  region_name?: string | null;
}

// Define the player with team and stats interface
interface PlayerWithTeam extends Player {
  teams?: Team[];
  stats?: PlayerStats;
  match_history?: Array<{
    match_id: string;
    played_at: string;
    event_name: string;
    team_name: string;
    points: number;
    assists: number;
    rebounds: number;
    steals: number;
    blocks: number;
    is_mvp: boolean;
    performance_score: number;
  }>;
}

// Dynamically import the PlayerProfile component with default import
const PlayerProfile = dynamic<{ player: PlayerWithTeam }>(
  () => import('@/components/PlayerProfile'),
  {
    loading: () => <div>Loading player profile...</div>,
  }
);

export const revalidate = 30; // Revalidate data every 30 seconds

async function getPlayerData(id: string): Promise<PlayerWithTeam | null> {
  try {
    // Get player performance summary in a single query
    const { data: playerSummary, error: summaryError } = await supabase
      .from('player_performance_summary')
      .select('*')
      .eq('id', id)
      .single();

    if (summaryError || !playerSummary) {
      console.error('Error fetching player summary:', summaryError);
      return null;
    }

    // Get player match history
    const { data: matchHistory = [] } = await supabase
      .from('player_match_history')
      .select('*')
      .eq('player_id', id)
      .order('played_at', { ascending: false });

    // Get team info if available
    let teams: Team[] = [];
    if (playerSummary.current_team_id) {
      teams = [{
        id: playerSummary.current_team_id,
        name: playerSummary.team_name || 'Unknown Team',
        logo_url: null, // This would need to be fetched separately if needed
        region_name: playerSummary.region_name || null
      }];
    }

    // Format the player data with stats and match history
    return {
      id: playerSummary.id,
      gamertag: playerSummary.gamertag,
      position: playerSummary.position,
      region_id: null, // Not available in the view
      current_team_id: playerSummary.current_team_id || null,
      performance_score: playerSummary.avg_performance_score || 0,
      player_rp: playerSummary.player_rp || 0,
      player_rank_score: playerSummary.player_rank_score || 0,
      monthly_value: playerSummary.monthly_value || 0,
      created_at: new Date().toISOString(), // Default value since not in view
      teams,
      stats: {
        games_played: Number(playerSummary.matches_played) || 0,
        points_per_game: Number(playerSummary.avg_points) || 0,
        assists_per_game: Number(playerSummary.avg_assists) || 0,
        rebounds_per_game: Number(playerSummary.avg_rebounds) || 0,
        steals_per_game: Number(playerSummary.avg_steals) || 0,
        blocks_per_game: Number(playerSummary.avg_blocks) || 0,
        field_goal_percentage: 0, // Not available in the view
        three_point_percentage: 0, // Not available in the view
        free_throw_percentage: 0, // Not available in the view
        turnovers_per_game: 0, // Not available in the view
        fouls_per_game: 0, // Not available in the view
        plus_minus: 0, // Not available in the view
        mvp_count: Number(playerSummary.mvp_count) || 0,
        avg_performance_score: Number(playerSummary.avg_performance_score) || 0
      },
      match_history: matchHistory?.map(match => ({
        match_id: match.match_id,
        played_at: match.played_at,
        event_name: match.event_name,
        team_name: match.team_name,
        points: match.points || 0,
        assists: match.assists || 0,
        rebounds: match.rebounds || 0,
        steals: match.steals || 0,
        blocks: match.blocks || 0,
        is_mvp: match.is_mvp || false,
        performance_score: match.performance_score || 0
      }))
    };
  } catch (error) {
    console.error('Error in getPlayerData:', error);
    return null;
  }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params);
  const player = await getPlayerData(id);

  if (!player) {
    notFound();
  }

  return <PlayerProfile player={player} />;
}
