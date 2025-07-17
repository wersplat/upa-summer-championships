import { supabase } from '@/utils/supabase';
import { notFound } from 'next/navigation';
import TeamHeader from '@/components/TeamHeader';
import RosterTable from '@/components/RosterTable';
import MatchHistory from '@/components/MatchHistory';
import TeamStats from '@/components/TeamStats';
import { Team, Player, Match } from '@/utils/supabase';

interface TeamWithRoster extends Team {
  id: string;
  name: string;
  logo_url: string | null;
  region_id: string | null;
  current_rp: number | null;
  elo_rating: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  players: (Player & { 
    team_rosters?: Array<{
      id: string;
      team_id: string;
      player_id: string;
      is_captain: boolean;
      is_player_coach: boolean;
      joined_at: string;
      left_at: string | null;
      event_id: string | null;
    }> 
  })[];
  recent_matches: Match[];
  stats: {
    games_played: number;
    avg_points: number;
    wins: number;
    losses: number;
  };
  regions?: Array<{
    id: string;
    name: string;
  }>;
}

export const revalidate = 3600; // Revalidate data every hour

async function getTeamData(id: string): Promise<TeamWithRoster | null> {
  try {
    // First, get the team by id with region info
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        regions (id, name)
      `)
      .eq('id', id)
      .single();

    if (teamError || !teamData) {
      console.error('Error fetching team:', teamError);
      return null;
    }

    // Fetch team roster with player details
    const { data: rosterData, error: rosterError } = await supabase
      .from('team_rosters')
      .select(`
        id,
        team_id,
        player_id,
        is_captain,
        is_player_coach,
        joined_at,
        left_at,
        event_id,
        players (*)
      `)
      .eq('team_id', teamData.id);

    if (rosterError) {
      console.error('Error fetching team roster:', rosterError);
      throw rosterError;
    }

    // Get recent matches (last 5)
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        event_id,
        team_a_id,
        team_b_id,
        score_a,
        score_b,
        played_at,
        team_a:team_a_id (id, name, logo_url),
        team_b:team_b_id (id, name, logo_url)
      `)
      .or(`team_a_id.eq.${teamData.id},team_b_id.eq.${teamData.id}`)
      .order('played_at', { ascending: false })
      .limit(5)
      .returns<Match[]>();

    if (matchesError) throw matchesError;

    // Calculate team stats
    const gamesPlayed = matchesData?.length || 0;
    const wins = matchesData?.filter(match => {
      const scoreA = match.score_a ?? 0;
      const scoreB = match.score_b ?? 0;
      return (match.team_a_id === teamData.id && scoreA > scoreB) ||
             (match.team_b_id === teamData.id && scoreB > scoreA);
    }).length || 0;
    
    const totalPoints = matchesData?.reduce((sum, match) => {
      return match.team_a_id === teamData.id 
        ? sum + (match.score_a || 0) 
        : sum + (match.score_b || 0);
    }, 0) || 0;

    const avgPoints = gamesPlayed > 0 ? Math.round((totalPoints / gamesPlayed) * 10) / 10 : 0;

    return {
      ...teamData,
      players: rosterData.map(roster => ({
        ...roster.players,
        team_rosters: [{
          id: roster.id,
          team_id: roster.team_id,
          player_id: roster.player_id,
          is_captain: roster.is_captain,
          is_player_coach: roster.is_player_coach || false,
          joined_at: roster.joined_at || new Date().toISOString(),
          left_at: roster.left_at || null,
          event_id: roster.event_id || null
        }]
      })),
      recent_matches: matchesData || [],
      stats: {
        games_played: gamesPlayed,
        avg_points: avgPoints,
        wins: wins,
        losses: gamesPlayed - wins
      }
    };
  } catch (error) {
    console.error('Error fetching team data:', error);
    return null;
  }
}

export default async function TeamPage({ params }: { params: { id: string } }) {
  // Ensure we have the id before proceeding
  if (!params?.id) {
    notFound();
  }
  
  // Fetch team data inside the page component
  const team = await getTeamData(params.id);

  if (!team) {
    notFound();
  }

  // Format team stats for the TeamStats component
  const teamStats = {
    ...team,
    team_stats: {
      games_played: team.stats.games_played,
      wins: team.stats.wins,
      losses: team.stats.losses,
      draws: 0, // This would come from your data if you track draws
      goals_for: 0, // Update if you track goals
      goals_against: 0, // Update if you track goals against
      current_streak: 0, // Update if you track streaks
      form_last_5: [] // Update if you track form
    },
    // Add RP and ELO info if available
    team_rp: team.current_rp || 0,
    team_elo_rating: team.elo_rating || 1500,
    region: team.regions?.[0] // Ensure region is properly passed
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamHeader team={team} />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RosterTable players={team.players} />
            <MatchHistory matches={team.recent_matches} teamId={team.id} />
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            {/* Additional Team Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Region:</span>
                  <span className="font-medium">{team.regions?.[0]?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">ELO Rating:</span>
                  <span className="font-medium">{team.elo_rating?.toFixed(0) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Ranking Points:</span>
                  <span className="font-medium">{team.current_rp || 0}</span>
                </div>
                {team.global_rank && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Global Rank:</span>
                    <span className="font-medium">#{team.global_rank}</span>
                  </div>
                )}
                {team.leaderboard_tier && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tier:</span>
                    <span className="font-medium">{team.leaderboard_tier}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Team Stats */}
            <TeamStats team={teamStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
