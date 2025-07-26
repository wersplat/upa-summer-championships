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
    
    // Get all players with their team info
    const { data: players, error: playersError, status, statusText } = await supabase
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
        )
      `)
      .order('gamertag');
      
    console.log(`Query status: ${status} - ${statusText}`);
    console.log('Number of players found:', players?.length || 0);
    
    if (playersError) {
      console.error('Detailed Supabase error:', {
        message: playersError.message,
        details: playersError.details,
        hint: playersError.hint,
        code: playersError.code
      });
      throw playersError;
    }

    if (!players || players.length === 0) {
      console.warn('No player data returned from the database');
      return {
        omvpCandidates: [],
        dmvpCandidates: [],
        rookieCandidates: []
      };
    }

    console.log('First player sample:', JSON.stringify(players[0], null, 2));

    // Get stats for all players
    const playersWithStats = [];
    console.log('Fetching player stats...');
    
    for (const player of players as unknown as Player[]) {
      // Remove .single() to get all stats rows
      const { data: statsList, error: statsError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', player.id);
        
      if (statsError) {
        console.error(`Error fetching stats for player ${player.id} (${player.gamertag}):`, statsError);
        continue;
      }
      
      if (statsList && statsList.length > 0) {
        console.log(`Raw stats for ${player.gamertag}:`, JSON.stringify(statsList, null, 2));
        
        // Aggregate stats if there are multiple entries
        const aggregatedStats = {
          points_per_game: 0,
          assists_per_game: 0,
          field_goal_percentage: 0,
          three_point_percentage: 0,
          steals_per_game: 0,
          blocks_per_game: 0,
          rebounds_per_game: 0,
          games_played: statsList.length, // Each stat entry represents one game
          is_rookie: statsList.some(stat => stat.is_rookie),
          overall_rating: 0
        };

        // Sum up stats from all entries
        statsList.forEach(stat => {
          console.log(`Processing stat entry for ${player.gamertag}:`, {
            points: stat.points,
            assists: stat.assists,
            fg: stat.fgm && stat.fga ? (stat.fgm / stat.fga) * 100 : 0,
            raw_stat: stat
          });
          
          aggregatedStats.points_per_game += Number(stat.points) || 0;
          aggregatedStats.assists_per_game += Number(stat.assists) || 0;
          aggregatedStats.steals_per_game += Number(stat.steals) || 0;
          aggregatedStats.blocks_per_game += Number(stat.blocks) || 0;
          aggregatedStats.rebounds_per_game += Number(stat.rebounds) || 0;
          
          // Calculate field goal percentage for this game
          if (stat.fga > 0) {
            const gameFgPct = (stat.fgm / stat.fga) * 100;
            console.log(`Game FG% for ${player.gamertag}:`, {
              fgm: stat.fgm,
              fga: stat.fga,
              fgPct: gameFgPct.toFixed(1) + '%',
              gameId: stat.match_id
            });
            aggregatedStats.field_goal_percentage += gameFgPct;
          }
          
          // Calculate three point percentage for this game
          if (stat.three_points_attempted > 0) {
            aggregatedStats.three_point_percentage += (stat.three_points_made / stat.three_points_attempted) * 100;
          }
          
          // Calculate overall rating (example formula, adjust as needed)
          aggregatedStats.overall_rating += (
            (Number(stat.points) || 0) +
            (Number(stat.assists) * 1.5) +
            (Number(stat.rebounds) * 1.2) +
            (Number(stat.steals) * 2) +
            (Number(stat.blocks) * 2) -
            (Number(stat.turnovers) * 1.5)
          );
        });

        // Calculate averages
        const gameCount = aggregatedStats.games_played;
        if (gameCount > 0) {
          aggregatedStats.points_per_game = aggregatedStats.points_per_game / gameCount;
          aggregatedStats.assists_per_game = aggregatedStats.assists_per_game / gameCount;
          aggregatedStats.steals_per_game = aggregatedStats.steals_per_game / gameCount;
          aggregatedStats.blocks_per_game = aggregatedStats.blocks_per_game / gameCount;
          aggregatedStats.rebounds_per_game = aggregatedStats.rebounds_per_game / gameCount;
          aggregatedStats.field_goal_percentage = aggregatedStats.field_goal_percentage / gameCount;
          aggregatedStats.three_point_percentage = aggregatedStats.three_point_percentage / gameCount;
          aggregatedStats.overall_rating = aggregatedStats.overall_rating / gameCount;
        }
        
        const teamRoster = player.team_rosters?.[0];
        const team = teamRoster?.teams;
        
        console.log(`Player ${player.gamertag} team data:`, {
          teamRoster,
          team,
          hasTeam: !!team
        });
        
        playersWithStats.push({
          id: player.id,
          gamertag: player.gamertag,
          position: player.position || 'Unknown',
          team_id: team?.id || '',
          team_name: team?.name || 'Free Agent',
          team_logo_url: team?.logo_url || null,
          ...aggregatedStats
        });
      } else {
        console.log(`No stats found for player ${player.id} (${player.gamertag})`);
      }
    }
    
    console.log(`Processed ${playersWithStats.length} players with stats`);
    
    // Filter out players with no games played
    const processedPlayers = playersWithStats.filter(player => player.games_played > 0);
    console.log(`Players with games played: ${processedPlayers.length}`);

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
      rookieCandidates: rookieCandidates.length,
      sampleOmvp: omvpCandidates[0],
      sampleDmvp: dmvpCandidates[0],
      sampleRookie: rookieCandidates[0]
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
