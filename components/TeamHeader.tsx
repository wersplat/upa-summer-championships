import Image from 'next/image';
import { Team } from '@/utils/supabase';

interface TeamHeaderProps {
  team: Team;
}

export default function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-8 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {team.logo_url ? (
              <Image 
                src={team.logo_url} 
                alt={`${team.name} logo`}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-gray-400">
                {team.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {team.name}
            </h1>
            <p className="mt-1 text-lg text-gray-500 dark:text-gray-300">
              {team.region || 'No region specified'}
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600">
            Follow Team
          </span>
        </div>
      </div>
    </div>
  );
}
