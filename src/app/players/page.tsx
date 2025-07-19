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
  minutes_per_game: number;
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
type PlayerWithTeam = Omit<Player, 'teams' | 'stats'> & {
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
      
      // Get player stats (simplified - adjust based on your actual stats structure)
      const { data: stats } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', player.id)
        .single();
      
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
        avatar_url: null, // Not available in database
        teams: playerTeams,
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
          minutes_per_game: 0,
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
