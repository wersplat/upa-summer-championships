import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 3600; // Revalidate data every hour

interface TeamWithRegion {
  id: string;
  name: string;
  logo_url: string | null;
  region_id: string | null;
  current_rp: number | null;
  elo_rating: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  regions: Array<{
    id: string;
    name: string;
  }>;
}

async function getTeams(): Promise<TeamWithRegion[]> {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        logo_url,
        region_id,
        current_rp,
        elo_rating,
        global_rank,
        leaderboard_tier,
        created_at,
        regions (id, name)
      `)
      .order('elo_rating', { ascending: false });

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
              href={`/teams/${team.id}`}
              className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {team.logo_url ? (
                      <Image
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover"
                        src={team.logo_url}
                        alt={`${team.name} logo`}
                        unoptimized
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
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {team.regions?.[0]?.name || 'No region'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                          ELO: {team.elo_rating?.toFixed(0) || 'N/A'}
                        </span>
                        {team.current_rp !== null && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
                            {team.current_rp} RP
                          </span>
                        )}
                      </div>
                    </div>
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
