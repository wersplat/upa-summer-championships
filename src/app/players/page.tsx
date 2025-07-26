import dynamic from 'next/dynamic';
import { supabase } from '@/utils/supabase';
import type { Player } from '@/utils/supabase';

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
}

// Define the team interface
type TeamInfo = {
  id: string;
  name: string;
  logo_url: string | null;
};

// Define the player with team and stats interface
export type PlayerWithTeam = Omit<Player, 'teams' | 'stats'> & {
  avatar_url?: string | null;
  teams?: TeamInfo[];
  stats?: PlayerStats;
}

// Dynamically import the PlayersPageClient component with proper typing
const PlayersPageClient = dynamic<{ 
  players: PlayerWithTeam[];
  showFallbackMessage: boolean;
}>(
  () => import('./PlayersPageClient').then(mod => mod.default),
  { 
    loading: () => <div>Loading players...</div> 
  }
);

export const revalidate = 30; // Revalidate data every 30 seconds for near-live updates

async function getPlayers(): Promise<PlayerWithTeam[]> {
  try {
    const eventId = '0d974c94-7531-41e9-833f-d1468690d72d'; // UPA Summer Championship 2024
    
    // First, get players that have roster entries for the specific event
    const { data: teamRosters, error: rosterError } = await supabase
      .from('team_rosters')
      .select('player_id, teams (id, name, logo_url)')
      .eq('event_id', eventId)
      .not('player_id', 'is', null);

    if (rosterError) {
      console.error('Error fetching team rosters:', rosterError);
      throw rosterError;
    }

    // Group teams by player ID
    const playersMap = new Map<string, PlayerWithTeam>();
    
    if (teamRosters && teamRosters.length > 0) {
      // Process players with event rosters
      teamRosters.forEach(roster => {
        if (!roster.player_id) return;
        
        const playerId = roster.player_id;
        const team = roster.teams;
        
        if (!team || !Array.isArray(team) || team.length === 0) return;
        
        const teamInfo = team[0]; // Get the first team
        
        if (!playersMap.has(playerId)) {
          playersMap.set(playerId, {
            id: playerId,
            gamertag: '', // Will be filled in the next query
            performance_score: 0,
            player_rp: 0,
            player_rank_score: 0,
            monthly_value: 0,
            created_at: new Date().toISOString(),
            teams: []
          });
        }
        
        const player = playersMap.get(playerId)!;
        
        if (teamInfo) {
          const newTeamInfo = {
            id: teamInfo.id || '',
            name: teamInfo.name || 'Unknown Team',
            logo_url: teamInfo.logo_url || null
          };
          
          if (!player.teams?.some(t => t.id === newTeamInfo.id)) {
            player.teams = [...(player.teams || []), newTeamInfo];
          }
        }
      });
      
      console.log(`Found ${playersMap.size} unique players with rosters for event ${eventId}`);
    } else {
      console.log('No player rosters found for event, showing all players as fallback');
    }
    
    // Get player details for all players in the map (or all players if map is empty)
    const playerIds = playersMap.size > 0 ? Array.from(playersMap.keys()) : [];
    
    let playerQuery = supabase
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
        created_at
      `);
      
    if (playerIds.length > 0) {
      playerQuery = playerQuery.in('id', playerIds);
    }
    
    const { data: players, error } = await playerQuery
      .order('player_rp', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    
    // Get player stats in batch for better performance
    const { data: statsData, error: statsError } = await supabase
      .from('player_stats')
      .select('*')
      .in('player_id', players.map(p => p.id));
    
    if (statsError) {
      console.error('Error fetching player stats:', statsError);
    }
    
    // Create a map of player_id to aggregated stats
    const statsMap = new Map<string, any>();
    
    // Aggregate stats by player_id
    statsData?.forEach(stat => {
      const playerId = stat.player_id;
      if (!statsMap.has(playerId)) {
        statsMap.set(playerId, {
          games_played: 0,
          total_points: 0,
          total_assists: 0,
          total_rebounds: 0,
          total_steals: 0,
          total_blocks: 0,
          total_fgm: 0,
          total_fga: 0,
          total_3pm: 0,
          total_3pa: 0,
          total_ftm: 0,
          total_fta: 0,
          total_turnovers: 0,
          total_fouls: 0,
          total_plus_minus: 0
        });
      }
      
      const playerStats = statsMap.get(playerId)!;
      playerStats.games_played++;
      playerStats.total_points += Number(stat.points) || 0;
      playerStats.total_assists += Number(stat.assists) || 0;
      playerStats.total_rebounds += Number(stat.rebounds) || 0;
      playerStats.total_steals += Number(stat.steals) || 0;
      playerStats.total_blocks += Number(stat.blocks) || 0;
      playerStats.total_fgm += Number(stat.fgm) || 0;
      playerStats.total_fga += Number(stat.fga) || 0;
      playerStats.total_3pm += Number(stat.three_points_made) || 0;
      playerStats.total_3pa += Number(stat.three_points_attempted) || 0;
      playerStats.total_ftm += Number(stat.ftm) || 0;
      playerStats.total_fta += Number(stat.fta) || 0;
      playerStats.total_turnovers += Number(stat.turnovers) || 0;
      playerStats.total_fouls += Number(stat.fouls) || 0;
      playerStats.total_plus_minus += Number(stat.plus_minus) || 0;
    });
    
    // Process player data to match expected interface
    const playersWithStats: PlayerWithTeam[] = [];
    
    for (const player of players || []) {
      // Get teams from the map if available, otherwise fetch current team
      let playerTeams = playersMap.get(player.id)?.teams || [];
      
      // If no teams from roster, try to get current team
      if (playerTeams.length === 0 && player.current_team_id) {
        const { data: currentTeam } = await supabase
          .from('teams')
          .select('id, name, logo_url')
          .eq('id', player.current_team_id)
          .single();
          
        if (currentTeam) {
          playerTeams = [{
            id: currentTeam.id,
            name: currentTeam.name || 'Unknown Team',
            logo_url: currentTeam.logo_url
          }];
        }
      }
      
      // Get aggregated player stats
      const aggregatedStats = statsMap.get(player.id);
      
      playersWithStats.push({
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
        avatar_url: null,
        teams: playerTeams,
        stats: aggregatedStats ? {
          games_played: aggregatedStats.games_played,
          points_per_game: aggregatedStats.games_played > 0 
            ? aggregatedStats.total_points / aggregatedStats.games_played 
            : 0,
          assists_per_game: aggregatedStats.games_played > 0 
            ? aggregatedStats.total_assists / aggregatedStats.games_played 
            : 0,
          rebounds_per_game: aggregatedStats.games_played > 0 
            ? aggregatedStats.total_rebounds / aggregatedStats.games_played 
            : 0,
          steals_per_game: aggregatedStats.games_played > 0 
            ? aggregatedStats.total_steals / aggregatedStats.games_played 
            : 0,
          blocks_per_game: aggregatedStats.games_played > 0 
            ? aggregatedStats.total_blocks / aggregatedStats.games_played 
            : 0,
          field_goal_percentage: aggregatedStats.total_fga > 0 
            ? (aggregatedStats.total_fgm / aggregatedStats.total_fga) * 100 
            : 0,
          three_point_percentage: aggregatedStats.total_3pa > 0 
            ? (aggregatedStats.total_3pm / aggregatedStats.total_3pa) * 100 
            : 0,
          free_throw_percentage: aggregatedStats.total_fta > 0 
            ? (aggregatedStats.total_ftm / aggregatedStats.total_fta) * 100 
            : 0,
          turnovers_per_game: aggregatedStats.games_played > 0 
            ? aggregatedStats.total_turnovers / aggregatedStats.games_played 
            : 0,
          fouls_per_game: aggregatedStats.games_played > 0 
            ? aggregatedStats.total_fouls / aggregatedStats.games_played 
            : 0,
          plus_minus: aggregatedStats.games_played > 0 
            ? aggregatedStats.total_plus_minus / aggregatedStats.games_played 
            : 0,
        } : {
          games_played: 0,
          points_per_game: 0,
          assists_per_game: 0,
          rebounds_per_game: 0,
          steals_per_game: 0,
          blocks_per_game: 0,
          field_goal_percentage: 0,
          three_point_percentage: 0,
          free_throw_percentage: 0,
          turnovers_per_game: 0,
          fouls_per_game: 0,
          plus_minus: 0,
        },
      });
    }
    
    // If we have players from the roster but no player details, try to get them
    if (playersWithStats.length === 0 && playersMap.size > 0) {
      console.warn('Found rosters but no matching player details. This may indicate a data consistency issue.');
      
      // If we have rosters but no player details, we'll still want to show the fallback UI
      return [];
    }
    
    return playersWithStats;
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

// This is a server component that fetches data and passes it to the client component
export default async function PlayersPage() {
  const players = await getPlayers();
  
  // Check if we should show the fallback message (no players found for event)
  const showFallbackMessage = players.length === 0;
  
  // For server components, we'll pass a flag to the client component
  // The client component will handle the refresh functionality
  return (
    <PlayersPageClient players={players} showFallbackMessage={showFallbackMessage} />
  );
}
