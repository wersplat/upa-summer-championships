import { supabase } from '@/utils/supabase';
import { Game } from '@/types/game';

export async function getCompletedGames(): Promise<Game[]> {
  try {
    // First, fetch the completed matches with basic info
    console.log('Fetching matches from Supabase...');
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        played_at,
        team_a_id,
        team_b_id,
        score_a,
        score_b,
        event_id,
        events:event_id(name, banner_url, description),
        team_a:team_a_id(id, name, logo_url, region_id),
        team_b:team_b_id(id, name, logo_url, region_id),
        winner_id,
        team_match_stats(
          team_id,
          points,
          rebounds,
          assists,
          steals,
          blocks,
          turnovers,
          field_goals_made,
          field_goals_attempted,
          three_points_made,
          three_points_attempted,
          free_throws_made,
          free_throws_attempted,
          fouls,
          plus_minus
        )
      `)
      .order('played_at', { ascending: false });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      throw matchesError;
    }

    if (!matches || matches.length === 0) {
      console.log('No matches found');
      return [];
    }

    console.log(`Found ${matches.length} matches`);
    
    // Fetch player stats for all matches in batches to avoid too many requests
    const matchIds = matches.map(match => match.id);
    console.log('Fetching player stats for matches:', matchIds);
    
    // Use the player_match_history view which already has all the stats we need
    const { data: playerStats, error: statsError } = await supabase
      .from('player_match_history')
      .select(`
        match_id,
        player_id,
        team_id,
        team_name,
        gamertag,
        points,
        assists,
        rebounds,
        steals,
        blocks,
        turnovers,
        fouls,
        field_goals_made: fgm,
        field_goals_attempted: fga,
        three_points_made,
        three_points_attempted,
        free_throws_made: ftm,
        free_throws_attempted: fta,
        plus_minus,
        performance_score,
        is_mvp
      `)
      .in('match_id', matchIds);

    if (statsError) {
      console.error('Error fetching player stats:', statsError);
      // Continue without player stats if we can't fetch them
    } else {
      console.log(`Found player stats for ${playerStats?.length || 0} player-game combinations`);
    }

    // Group player stats by match_id and team_id
    const statsByMatchAndTeam: Record<string, Record<string, any[]>> = {};
    
    playerStats?.forEach(stat => {
      if (!statsByMatchAndTeam[stat.match_id]) {
        statsByMatchAndTeam[stat.match_id] = {};
      }
      if (!statsByMatchAndTeam[stat.match_id][stat.team_id]) {
        statsByMatchAndTeam[stat.match_id][stat.team_id] = [];
      }
      statsByMatchAndTeam[stat.match_id][stat.team_id].push(stat);
    });

    // Transform the data to match our Game type
    console.log('Transforming match data...');
    const games: Game[] = [];
    
    for (const match of matches) {
      try {
        const team1Stats = match.team_match_stats?.find(stat => stat.team_id === match.team_a_id);
        const team2Stats = match.team_match_stats?.find(stat => stat.team_id === match.team_b_id);
        
        // Get player stats for this match
        const matchPlayerStats = statsByMatchAndTeam[match.id] || {};
        const team1PlayerStats = matchPlayerStats[match.team_a_id] || [];
        const team2PlayerStats = matchPlayerStats[match.team_b_id] || [];

        const game: Game = {
          id: match.id,
          team1: {
            id: match.team_a_id,
            name: match.team_a?.name || 'Team A',
            score: match.score_a || 0,
            logo_url: match.team_a?.logo_url || '/team-placeholder.png',
            stats: team1Stats ? {
              field_goals_made: team1Stats.field_goals_made || 0,
              field_goals_attempted: team1Stats.field_goals_attempted || 0,
              three_points_made: team1Stats.three_points_made || 0,
              three_points_attempted: team1Stats.three_points_attempted || 0,
              free_throws_made: team1Stats.free_throws_made || 0,
              free_throws_attempted: team1Stats.free_throws_attempted || 0,
              offensive_rebounds: team1Stats.rebounds || 0,
              defensive_rebounds: team1Stats.rebounds || 0,
              assists: team1Stats.assists || 0,
              steals: team1Stats.steals || 0,
              blocks: team1Stats.blocks || 0,
              turnovers: team1Stats.turnovers || 0,
              fouls: team1Stats.fouls || 0
            } : undefined,
            playerStats: team1PlayerStats.map(stat => ({
              id: stat.player_id,
              name: stat.gamertag || 'Unknown Player',
              position: stat.position || 'N/A',
              points: stat.points || 0,
              rebounds: stat.rebounds || 0,
              assists: stat.assists || 0,
              steals: stat.steals || 0,
              blocks: stat.blocks || 0,
              turnovers: stat.turnovers || 0,
              fouls: stat.fouls || 0,
              field_goals_made: stat.field_goals_made || 0,
              field_goals_attempted: stat.field_goals_attempted || 0,
              three_points_made: stat.three_points_made || 0,
              three_points_attempted: stat.three_points_attempted || 0,
              free_throws_made: stat.free_throws_made || 0,
              free_throws_attempted: stat.free_throws_attempted || 0,
              plus_minus: stat.plus_minus || 0,
              performance_score: stat.performance_score || 0,
              is_mvp: stat.is_mvp || false
            }))
          },
          team2: {
            id: match.team_b_id,
            name: match.team_b?.name || 'Team B',
            score: match.score_b || 0,
            logo_url: match.team_b?.logo_url || '/team-placeholder.png',
            stats: team2Stats ? {
              field_goals_made: team2Stats.field_goals_made || 0,
              field_goals_attempted: team2Stats.field_goals_attempted || 0,
              three_points_made: team2Stats.three_points_made || 0,
              three_points_attempted: team2Stats.three_points_attempted || 0,
              free_throws_made: team2Stats.free_throws_made || 0,
              free_throws_attempted: team2Stats.free_throws_attempted || 0,
              offensive_rebounds: team2Stats.rebounds || 0,
              defensive_rebounds: team2Stats.rebounds || 0,
              assists: team2Stats.assists || 0,
              steals: team2Stats.steals || 0,
              blocks: team2Stats.blocks || 0,
              turnovers: team2Stats.turnovers || 0,
              fouls: team2Stats.fouls || 0
            } : undefined,
            playerStats: team2PlayerStats.map(stat => ({
              id: stat.player_id,
              name: stat.gamertag || 'Unknown Player',
              position: stat.position || 'N/A',
              points: stat.points || 0,
              rebounds: stat.rebounds || 0,
              assists: stat.assists || 0,
              steals: stat.steals || 0,
              blocks: stat.blocks || 0,
              turnovers: stat.turnovers || 0,
              fouls: stat.fouls || 0,
              field_goals_made: stat.field_goals_made || 0,
              field_goals_attempted: stat.field_goals_attempted || 0,
              three_points_made: stat.three_points_made || 0,
              three_points_attempted: stat.three_points_attempted || 0,
              free_throws_made: stat.free_throws_made || 0,
              free_throws_attempted: stat.free_throws_attempted || 0,
              plus_minus: stat.plus_minus || 0,
              performance_score: stat.performance_score || 0,
              is_mvp: stat.is_mvp || false
            }))
          },
          date: match.played_at,
          location: match.events?.name || 'UPA Arena',
          tournamentStage: match.events?.name || 'UPA Match',
        };
        
        games.push(game);
      } catch (error) {
        console.error(`Error processing match ${match.id}:`, error);
        // Skip this match but continue with others
      }
    }

    console.log(`Successfully processed ${games.length} games`);
    return games;
  } catch (error) {
    console.error('Error in getCompletedGames:', error);
    // Return empty array on error to prevent breaking the UI
    return [];
  }
}
