import { notFound } from 'next/navigation';
import { supabase, TeamWithRoster } from '@/utils/supabase';
import TeamHeader from '@/components/TeamHeader';
import RosterTable from '@/components/RosterTable';
import MatchHistory from '@/components/MatchHistory';
import TeamStats from '@/components/TeamStats';
import LoadingSpinner from '@/components/LoadingSpinner';

export const revalidate = 3600; // Revalidate data every hour

async function getTeamData(slug: string): Promise<TeamWithRoster | null> {
  try {
    // First, get the team by slug
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('slug', slug)
      .single();

    if (teamError || !teamData) return null;

    // Get team roster
    const { data: rosterData, error: rosterError } = await supabase
      .from('team_rosters')
      .select(`
        *,
        players!inner(*)
      `)
      .eq('team_id', teamData.id);

    if (rosterError) throw rosterError;

    // Get recent matches (last 5)
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(`home_team_id.eq.${teamData.id},away_team_id.eq.${teamData.id}`)
      .order('match_date', { ascending: false })
      .limit(5);

    if (matchesError) throw matchesError;

    // Calculate team stats
    const gamesPlayed = matchesData.length;
    const wins = matchesData.filter(
      (match) => 
        (match.home_team_id === teamData.id && match.home_score > match.away_score) ||
        (match.away_team_id === teamData.id && match.away_score > match.home_score)
    ).length;
    
    const totalPoints = matchesData.reduce((sum, match) => {
      return match.home_team_id === teamData.id 
        ? sum + match.home_score 
        : sum + match.away_score;
    }, 0);

    const avgPoints = gamesPlayed > 0 ? Math.round((totalPoints / gamesPlayed) * 10) / 10 : 0;

    return {
      ...teamData,
      players: rosterData.map(roster => ({
        ...roster.players,
        is_captain: roster.is_captain
      })),
      recent_matches: matchesData,
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

export default async function TeamPage({ params }: { params: { slug: string } }) {
  const team = await getTeamData(params.slug);

  if (!team) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamHeader team={team} />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RosterTable players={team.players} />
            <MatchHistory matches={team.recent_matches} teamId={team.id} />
          </div>
          
          <div className="lg:col-span-1">
            <TeamStats stats={team.stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
