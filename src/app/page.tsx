import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { format } from 'date-fns';

interface MatchWithTeams {
  id: string;
  team_a_id: string | null;
  team_b_id: string | null;
  team_a: { id: string; name: string; logo_url: string | null } | null;
  team_b: { id: string; name: string; logo_url: string | null } | null;
  score_a: number | null;
  score_b: number | null;
  played_at: string | null;
}

async function getRecentMatches(): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `id, team_a_id, team_b_id, score_a, score_b, played_at,
       team_a:team_a_id (id, name, logo_url),
       team_b:team_b_id (id, name, logo_url)`
    )
    .not('score_a', 'is', null)
    .not('score_b', 'is', null)
    .order('played_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent matches', error);
    return [];
  }

  // Map the response to MatchWithTeams interface
  return (data || []).map(match => ({
    ...match,
    team_a: match.team_a?.[0] || null,
    team_b: match.team_b?.[0] || null
  }));
}

async function getUpcomingMatches(): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `id, team_a_id, team_b_id, score_a, score_b, played_at,
       team_a:team_a_id (id, name, logo_url),
       team_b:team_b_id (id, name, logo_url)`
    )
    .is('score_a', null)
    .is('score_b', null)
    .order('played_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching upcoming matches', error);
    return [];
  }

  // Map the response to MatchWithTeams interface
  return (data || []).map(match => ({
    ...match,
    team_a: match.team_a?.[0] || null,
    team_b: match.team_b?.[0] || null
  }));
}

export default async function Home() {
  const [recent, upcoming] = await Promise.all([getRecentMatches(), getUpcomingMatches()]);

  const renderMatchRow = (match: MatchWithTeams) => {
    const date = match.played_at ? new Date(match.played_at) : null;
    const score = match.score_a !== null && match.score_b !== null ? (
      <span className="font-mono text-gray-900 dark:text-gray-100">{match.score_a}-{match.score_b}</span>
    ) : (
      <span className="text-gray-500 dark:text-gray-400">vs</span>
    );

    return (
      <tr key={match.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
              {match.team_a?.logo_url ? (
                <Image 
                  src={match.team_a.logo_url} 
                  alt={match.team_a.name} 
                  width={32} 
                  height={32} 
                  className="rounded-full" 
                  unoptimized 
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                  {match.team_a?.name[0]}
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {match.team_a?.name}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
              {match.team_b?.logo_url ? (
                <Image 
                  src={match.team_b.logo_url} 
                  alt={match.team_b.name} 
                  width={32} 
                  height={32} 
                  className="rounded-full" 
                  unoptimized 
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                  {match.team_b?.name[0]}
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {match.team_b?.name}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {score}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {date ? format(date, 'MMM d, h:mm a') : 'TBD'}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-white drop-shadow">UPA Summer Championships</h1>
        <p className="text-lg text-gray-200">NBA 2K Pro Am Tournament</p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Results</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <colgroup>
            <col className="w-2/5" />
            <col className="w-2/5" />
            <col className="w-1/10" />
            <col className="w-1/5" />
          </colgroup>
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Home</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Away</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Played</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {recent.map((match) => renderMatchRow(match))}
            {recent.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No recent matches</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Upcoming Schedule</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <colgroup>
            <col className="w-2/5" />
            <col className="w-2/5" />
            <col className="w-1/10" />
            <col className="w-1/5" />
          </colgroup>
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Home</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Away</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tip Off</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {upcoming.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No upcoming games
                </td>
              </tr>
            ) : (
              upcoming.map((match) => renderMatchRow(match))
            )}
          </tbody>
        </table>
      </section>

      <section className="space-y-4 text-center">
        <h2 className="text-2xl font-bold text-white drop-shadow">Sponsors</h2>
        <p className="text-gray-200">Thanks to our amazing partners for supporting the UPA Summer Championships.</p>
        <div className="flex justify-center space-x-8">
          <span className="text-gray-300">Sponsor 1</span>
          <span className="text-gray-300">Sponsor 2</span>
          <span className="text-gray-300">Sponsor 3</span>
        </div>
      </section>

      <section className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white drop-shadow">Organized by UPA</h2>
        <p className="text-gray-200">For inquiries contact info@unitedproam.gg</p>
      </section>
    </div>
  );
}
