'use client';

import { Team, Event } from '@/utils/supabase';
import type { Match } from '@/utils/supabase';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface MatchWithDetails extends Omit<Match, 'score_a' | 'score_b' | 'played_at'> {
  team_a?: Team;
  team_b?: Team;
  winner?: Team;
  event?: Event;
  score_a?: number | null;
  score_b?: number | null;
  played_at?: string | null;
  boxscore_url?: string | null;
}

interface MatchHistoryProps {
  matches: MatchWithDetails[];
  teamId: string;
}

export default function MatchHistory({ matches, teamId }: MatchHistoryProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openBoxScore = (match: MatchWithDetails) => {
    if (match.boxscore_url) {
      setSelectedMatch(match);
      setIsModalOpen(true);
    }
  };

  const closeBoxScore = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  const getMatchResult = (match: MatchWithDetails) => {
    if (!match.team_a || !match.team_b) return null;
    
    const isTeamA = match.team_a.id === teamId;
    const teamScore = isTeamA ? match.score_a : match.score_b;
    const opponentScore = isTeamA ? match.score_b : match.score_a;
    
    if (teamScore === null || teamScore === undefined || 
        opponentScore === null || opponentScore === undefined) {
      return null;
    }
    
    if (teamScore > opponentScore) return 'win';
    if (teamScore < opponentScore) return 'loss';
    return 'draw';
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'win': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'loss': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'draw': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusBadge = (match: MatchWithDetails) => {
    const result = getMatchResult(match);
    const matchDate = match.played_at ? new Date(match.played_at) : null;
    const isUpcoming = matchDate && matchDate > new Date();
    const isLive = matchDate && 
                  matchDate <= new Date() && 
                  matchDate > new Date(Date.now() - 4 * 60 * 60 * 1000) &&
                  result === null; // Only show as live if the match is recent and has no result yet
    
    if (isUpcoming) {
      const timeUntil = matchDate ? formatDistanceToNow(matchDate, { addSuffix: true }) : 'Scheduled';
      
      return (
        <div className="flex items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            {timeUntil}
          </span>
        </div>
      );
    }
    
    if (isLive) {
      return (
        <div className="flex items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
            Live
          </span>
          <span className="ml-2 flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </div>
      );
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(result)}`}>
        {result ? result.charAt(0).toUpperCase() + result.slice(1) : 'N/A'}
      </span>
    );
  };

  const getTeamDisplay = (team: Team | undefined, isWinner?: boolean) => {
    if (!team) return <span className="text-gray-400">TBD</span>;
    
    return (
      <div className={`flex items-center ${isWinner ? 'font-bold' : ''}`}>
        <div className="flex-shrink-0 h-6 w-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-2">
          {team.logo_url ? (
            <Image 
              width={24}
              height={24}
              className="h-6 w-6 object-cover" 
              src={team.logo_url} 
              alt={`${team.name} logo`}
              unoptimized
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-gray-600 dark:text-gray-300"
                 style={{
                   backgroundColor: 'rgb(209, 213, 219)',
                   '--dark-bg': 'rgb(75, 85, 99)'
                 } as React.CSSProperties}
            >
              {team.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="truncate">{team.name}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Match History
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Recent match results and upcoming fixtures
          </p>
        </div>
        <Link 
          href={`/team/${teamId}/matches`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View all matches →
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Match
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {matches.length > 0 ? (
              matches.map((match) => {
                const isTeamA = match.team_a?.id === teamId;
                const team = isTeamA ? match.team_a : match.team_b;
                const opponent = isTeamA ? match.team_b : match.team_a;
                const teamScore = isTeamA ? match.score_a : match.score_b;
                const opponentScore = isTeamA ? match.score_b : match.score_a;
                const result = getMatchResult(match);
                const isWinner = result === 'win';
                const isDraw = result === 'draw';
                const matchDate = match.played_at ? new Date(match.played_at) : null;
                const hasBoxScore = !!match.boxscore_url;
                
                return (
                  <tr 
                    key={match.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${hasBoxScore ? 'cursor-pointer' : ''}`}
                    onClick={() => hasBoxScore && openBoxScore(match)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getTeamDisplay(team, isWinner && !isDraw)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getTeamDisplay(opponent, !isWinner && !isDraw && result !== null)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {match.event ? (
                        <div className="flex items-center">
                          {match.event?.banner_url && (
                            <div className="flex-shrink-0 h-5 w-5 mr-2">
                              {match.event.banner_url ? (
                                <Image 
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 rounded-sm object-cover" 
                                  src={match.event.banner_url} 
                                  alt={`${match.event.name} logo`}
                                  unoptimized
                                />
                              ) : (
                                <div className="h-5 w-5 rounded-sm flex items-center justify-center text-xs"
                                     style={{
                                       backgroundColor: 'rgb(209, 213, 219)',
                                       '--dark-bg': 'rgb(75, 85, 99)'
                                     } as React.CSSProperties}
                                >
                                  {match.event.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {match.event?.name || 'Friendly Match'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {match.event?.tier || 'Exhibition'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Friendly</span>
                      )}
                    </td>
                    <td 
                      className={`px-6 py-4 whitespace-nowrap ${hasBoxScore ? 'group relative' : ''}`}
                    >
                      {match.played_at && match.played_at <= new Date().toISOString() ? (
                        <div className="flex items-center">
                          <span className={`font-mono ${isWinner ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {teamScore}
                          </span>
                          <span className="mx-1">-</span>
                          <span className={`font-mono ${!isWinner && !isDraw ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {opponentScore}
                          </span>
                          {hasBoxScore && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              View Box Score
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-400">vs</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(match)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      {matchDate ? (
                        <>
                          <div className="whitespace-nowrap">{format(matchDate, 'MMM d, yyyy')}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {format(matchDate, 'h:mm a')}
                          </div>
                        </>
                      ) : 'TBD'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No matches found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This team hasn't played any matches yet.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Box Score Modal */}
      {isModalOpen && selectedMatch?.boxscore_url && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeBoxScore}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white dark:bg-gray-700 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={closeBoxScore}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Box Score: {selectedMatch.team_a?.name || 'Team A'} vs {selectedMatch.team_b?.name || 'Team B'}
                  </h3>
                  <div className="mt-4">
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={selectedMatch.boxscore_url || ''} 
                        alt={`Box score for match between ${selectedMatch.team_a?.name || 'Team A'} and ${selectedMatch.team_b?.name || 'Team B'}`}
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  onClick={closeBoxScore}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
