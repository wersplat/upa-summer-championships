import { Suspense } from 'react';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import AwardsClientWrapper from './AwardsClientWrapper';

// Define interfaces for the data structure
export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface TeamRoster {
  team_id: string;
  teams: Team[];
}

export interface PlayerStatsData {
  points_per_game: number;
  assists_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  steals_per_game: number;
  blocks_per_game: number;
  rebounds_per_game: number;
  games_played: number;
  minutes_per_game: number;
  is_rookie: boolean;
  overall_rating: number;
}

export interface Player {
  id: string;
  gamertag: string;
  position: string | null;
  team_rosters: TeamRoster[];
  player_stats: PlayerStatsData[];
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
  minutes_per_game: number;
  is_rookie: boolean;
  overall_rating: number;
  offensive_rating?: number;
  defensive_rating?: number;
  rookie_rating?: number;
}

export const metadata: Metadata = {
  title: 'Awards Race - UPA Summer Championships',
  description: 'Track the race for Offensive MVP, Defensive MVP, and Rookie of Tournament awards in the UPA Summer Championships.',
};

export const revalidate = 30;

interface PlayerStats {
  id: string;
  gamertag: string;
  position: string;
  team_id: string;
  team_name: string;
  team_logo_url: string | null;
  // Offensive stats
  points_per_game: number;
  assists_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  // Defensive stats
  steals_per_game: number;
  blocks_per_game: number;
  rebounds_per_game: number;
  // General stats
  games_played: number;
  minutes_per_game: number;
  is_rookie: boolean;
  overall_rating: number;
}

async function getAwardsData() {
  try {
    // Log environment variables (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing');
      console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );
    
    // Test the connection first
    const { error: testError } = await supabase
      .from('players')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      throw testError;
    }
    
    console.log('Supabase connection successful, fetching players...');
    
    // Get all players with their team info and stats
    const { data: players, error, status, statusText } = await supabase
      .from('players')
      .select(`
        id,
        gamertag,
        position,
        team_rosters!inner (
          team_id,
          teams!inner (
            id,
            name,
            logo_url
          )
        ),
        player_stats (
          points_per_game,
          assists_per_game,
          field_goal_percentage,
          three_point_percentage,
          steals_per_game,
          blocks_per_game,
          rebounds_per_game,
          games_played,
          minutes_per_game,
          is_rookie,
          overall_rating
        )
      `)
      .order('gamertag');
      
    console.log(`Query status: ${status} - ${statusText}`);
    
    if (error) {
      console.error('Detailed Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    if (!players || players.length === 0) {
      console.warn('No player data returned from the database');
      return {
        omvpCandidates: [],
        dmvpCandidates: [],
        rookieCandidates: []
      };
    }

    // Process and transform the data
    const processedPlayers: PlayerStats[] = (players as unknown as Player[])
      .map((player) => {
        const teamRoster = player.team_rosters?.[0];
        const team = teamRoster?.teams?.[0]; // Get first team if exists
        const stats = player.player_stats?.[0]; // Get first stats entry
        
        if (!stats) {
          console.warn(`Player ${player.gamertag} has no stats`);
          return null;
        }

        if (!team) {
          console.warn(`Player ${player.gamertag} has no team information`);
        }
        
        return {
          id: player.id,
          gamertag: player.gamertag,
          position: player.position || 'Unknown',
          team_id: team?.id || '',
          team_name: team?.name || 'Free Agent',
          team_logo_url: team?.logo_url || null,
          points_per_game: stats.points_per_game || 0,
          assists_per_game: stats.assists_per_game || 0,
          field_goal_percentage: stats.field_goal_percentage || 0,
          three_point_percentage: stats.three_point_percentage || 0,
          steals_per_game: stats.steals_per_game || 0,
          blocks_per_game: stats.blocks_per_game || 0,
          rebounds_per_game: stats.rebounds_per_game || 0,
          games_played: stats.games_played || 0,
          minutes_per_game: stats.minutes_per_game || 0,
          is_rookie: stats.is_rookie || false,
          overall_rating: stats.overall_rating || 0
        };
      })
      .filter((player): player is PlayerStats => 
        player !== null && player.games_played > 0
      ); // Only include valid players who have played

  // Calculate OMVP candidates (top 5 by offensive rating)
  const omvpCandidates = processedPlayers
    .map((player: PlayerStats) => ({
      ...player,
      offensive_rating: (player.points_per_game * 0.4) + 
                      (player.assists_per_game * 0.3) + 
                      (player.field_goal_percentage * 0.2) + 
                      (player.three_point_percentage * 0.1)
    }))
    .sort((a, b) => b.offensive_rating - a.offensive_rating)
    .slice(0, 5);

  // Calculate DMVP candidates (top 5 by defensive rating)
  const dmvpCandidates = processedPlayers
    .map((player: PlayerStats) => ({
      ...player,
      defensive_rating: (player.steals_per_game * 0.4) + 
                       (player.blocks_per_game * 0.3) + 
                       (player.rebounds_per_game * 0.3)
    }))
    .sort((a, b) => b.defensive_rating - a.defensive_rating)
    .slice(0, 5);

  // Calculate Rookie candidates (top 5 rookies by overall performance)
  const rookieCandidates = processedPlayers
    .filter((player: PlayerStats) => player.is_rookie)
    .map((player: PlayerStats) => ({
      ...player,
      rookie_rating: (player.points_per_game * 0.3) + 
                    (player.assists_per_game * 0.2) + 
                    (player.steals_per_game * 0.2) + 
                    (player.field_goal_percentage * 0.15) + 
                    (player.overall_rating * 0.15)
    }))
    .sort((a, b) => b.rookie_rating - a.rookie_rating)
    .slice(0, 5);

    console.log('Successfully processed awards data', {
      totalPlayers: processedPlayers.length,
      omvpCandidates: omvpCandidates.length,
      dmvpCandidates: dmvpCandidates.length,
      rookieCandidates: rookieCandidates.length
    });
    
    return {
      omvpCandidates,
      dmvpCandidates,
      rookieCandidates
    };
  } catch (error) {
    console.error('Error in getAwardsData:', error);
    // Return empty arrays to prevent the page from breaking
    return {
      omvpCandidates: [],
      dmvpCandidates: [],
      rookieCandidates: []
    };
  }
}

export default async function AwardsPage() {
  const awardsData = await getAwardsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      }>
        <AwardsClientWrapper 
          omvpCandidates={awardsData.omvpCandidates}
          dmvpCandidates={awardsData.dmvpCandidates}
          rookieCandidates={awardsData.rookieCandidates}
        />
      </Suspense>
    </div>
  );
}
