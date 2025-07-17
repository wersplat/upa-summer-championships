import { supabase } from '@/utils/supabase';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate data every hour

async function getTeams() {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select('id, name, logo_url, region, slug')
      .order('name', { ascending: true });

    if (error) throw error;
    return teams || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            UPA Summer Championship
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Explore teams and track their progress throughout the season
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.slug || team.id}`}
              className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {team.logo_url ? (
                      <img
                        className="h-full w-full object-cover"
                        src={team.logo_url}
                        alt={`${team.name} logo`}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {team.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {team.region || 'No region'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No teams found. Check back later for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
