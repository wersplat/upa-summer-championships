import Image from 'next/image';
import { Team as BaseTeam } from '@/utils/supabase';

type Team = BaseTeam & {
  region?: {
    id: string;
    name: string;
  };
  stats?: {
    games_played: number;
    wins: number;
    losses: number;
    avg_points: number;
  };
};

interface TeamHeaderProps {
  team: Team;
}

export default function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-navy to-blue rounded-lg shadow-sun overflow-hidden">
      <div className="px-6 py-8 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-sun">
            {team.logo_url ? (
              <Image 
                src={team.logo_url} 
                alt={`${team.name} logo`}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <span className="text-4xl font-bold text-gray-400">
                {team.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-extrabold text-white drop-shadow">
                {team.name}
              </h1>
              {team.leaderboard_tier && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gold text-navy">
                  {team.leaderboard_tier}
                </span>
              )}
            </div>
            
            <div className="mt-2 space-y-3">
              {team.region && (
                <div className="flex items-center">
                  <span className="text-lg text-white/80">
                    {team.region.name}
                  </span>
                  {team.leaderboard_tier && (
                    <span className="ml-3 px-2 py-0.5 text-xs font-medium rounded-full bg-gold text-navy">
                      {team.leaderboard_tier}
                    </span>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/20 p-3 rounded-lg">
                  <div className="text-xs font-medium text-white/80">Ranking Points</div>
                  <div className="text-lg font-bold text-gold">
                    {team.current_rp?.toLocaleString() || 'N/A'}
                  </div>
                </div>

                <div className="bg-white/20 p-3 rounded-lg">
                  <div className="text-xs font-medium text-white/80">ELO Rating</div>
                  <div className="text-lg font-bold text-gold">
                    {team.elo_rating ? Math.round(team.elo_rating) : 'N/A'}
                  </div>
                </div>
                
                {team.global_rank && (
                  <div className="bg-white/20 p-3 rounded-lg">
                    <div className="text-xs font-medium text-white/80">Global Rank</div>
                    <div className="text-lg font-bold text-gold">
                      #{team.global_rank.toLocaleString()}
                    </div>
                  </div>
                )}
                
                {team.stats && (
                  <div className="bg-white/20 p-3 rounded-lg">
                    <div className="text-xs font-medium text-white/80">Record</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-gold">{team.stats.wins}</span>
                      <span className="text-white/80">-</span>
                      <span className="text-lg font-bold text-gold">{team.stats.losses}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue hover:bg-blue/80 transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            View Stats
          </button>
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gold hover:bg-orange transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
          </button>
          
          <a
            href={`/teams/${team.id}/matches`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue hover:bg-blue/80 transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Match History
          </a>
          
          <a
            href={`/teams/${team.id}/roster`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gold hover:bg-orange transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
            </svg>
            View Roster
          </a>
        </div>
      </div>
    </div>
  );
}
