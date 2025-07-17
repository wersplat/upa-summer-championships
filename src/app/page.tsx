import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';

interface MatchWithTeams {
  id: string;
  team_a?: { id: string; name: string; logo_url: string | null };
  team_b?: { id: string; name: string; logo_url: string | null };
  score_a?: number | null;
  score_b?: number | null;
  played_at?: string | null;
  status?: string | null;
}

async function getRecentMatches(): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `id, team_a_id, team_b_id, score_a, score_b, played_at, status,
       team_a:team_a_id (id, name, logo_url),
       team_b:team_b_id (id, name, logo_url)`
    )
    .eq('status', 'completed')
    .order('played_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent matches', error);
    return [];
  }
  return data || [];
}

async function getUpcomingMatches(): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `id, team_a_id, team_b_id, score_a, score_b, played_at, status,
       team_a:team_a_id (id, name, logo_url),
       team_b:team_b_id (id, name, logo_url)`
    )
    .eq('status', 'scheduled')
    .order('played_at', { ascending: true })
    .limit(5);

  if (error) {
    console.error('Error fetching upcoming matches', error);
    return [];
  }
  return data || [];
}

export default async function Home() {
  const [recent, upcoming] = await Promise.all([getRecentMatches(), getUpcomingMatches()]);

  const renderMatch = (m: MatchWithTeams) => {
    const date = m.played_at ? new Date(m.played_at) : null;
    const score = m.score_a !== null && m.score_b !== null ? (
      <span className="font-mono">{m.score_a}-{m.score_b}</span>
    ) : (
      <span className="text-gray-400">vs</span>
    );

    return (
      <tr key={m.id} className="border-t border-gray-200 dark:border-gray-700">
        <td className="px-4 py-2">
          <div className="flex items-center space-x-2">
            {m.team_a?.logo_url ? (
              <Image src={m.team_a.logo_url} alt={m.team_a.name} width={24} height={24} className="rounded-full" unoptimized />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">{m.team_a?.name[0]}</div>
            )}
            <span>{m.team_a?.name}</span>
          </div>
        </td>
        <td className="px-4 py-2">
          <div className="flex items-center space-x-2">
            {m.team_b?.logo_url ? (
              <Image src={m.team_b.logo_url} alt={m.team_b.name} width={24} height={24} className="rounded-full" unoptimized />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">{m.team_b?.name[0]}</div>
            )}
            <span>{m.team_b?.name}</span>
          </div>
        </td>
        <td className="px-4 py-2 text-center">{score}</td>
        <td className="px-4 py-2 text-right">{date ? format(date, 'MMM d, h:mm a') : 'TBD'}</td>
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
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Home</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Away</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Score</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Played</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {recent.map(renderMatch)}
            {recent.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No recent matches</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Upcoming Schedule</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Home</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Away</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Score</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Tip Off</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {upcoming.map(renderMatch)}
            {upcoming.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No upcoming games</td></tr>
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
