'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { Player as BasePlayer } from '@/utils/supabase';

type Player = BasePlayer & {
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  position?: string | null;
  team_rosters?: Array<{
    id: string;
    team_id: string;
    player_id: string;
    is_captain: boolean;
    is_player_coach: boolean;
    joined_at: string;
    left_at: string | null;
    event_id: string | null;
  }>;
};

type SortConfig = {
  key: keyof Player;
  direction: 'asc' | 'desc';
};

interface RosterTableProps {
  players: Player[];
}

export default function RosterTable({ players }: RosterTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'gamertag', 
    direction: 'asc' 
  });
  
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAndFilteredPlayers = useMemo(() => {
    const filtered = players.filter(player => {
      const searchLower = searchTerm.toLowerCase();
      return (
        player.gamertag.toLowerCase().includes(searchLower) ||
        (player.position?.toLowerCase() || '').includes(searchLower) ||
        (player.first_name?.toLowerCase() || '').includes(searchLower) ||
        (player.last_name?.toLowerCase() || '').includes(searchLower)
      );
    });

    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Compare values
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [players, sortConfig, searchTerm]);

  const requestSort = (key: keyof Player) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };


  const getStatusBadge = (player: Player) => {
    const rosterInfo = player.team_rosters?.[0];
    if (!rosterInfo) return null;
    
    const badges = [];
    
    if (rosterInfo.is_captain) {
      badges.push(
        <span 
          key="captain" 
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/50"
          title="Team Captain"
        >
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Captain
        </span>
      );
    }
    
    if (rosterInfo.is_player_coach) {
      badges.push(
        <span 
          key="coach" 
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border border-purple-200 dark:border-purple-800/50"
          title="Player Coach"
        >
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          Coach
        </span>
      );
    }
    
    // If no specific role badges, show Player
    if (badges.length === 0) {
      badges.push(
        <span 
          key="player" 
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800/50"
          title="Team Player"
        >
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
          </svg>
          Player
        </span>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-1.5">
        {badges}
      </div>
    );
  };

  const SortIndicator = ({ column, sortConfig }: { column: keyof Player; sortConfig: SortConfig }) => (
    <span className="ml-1.5">
      {sortConfig.key === column ? (
        sortConfig.direction === 'asc' ? (
          <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )
      ) : (
        <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )}
    </span>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Team Roster</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {players.length} {players.length === 1 ? 'player' : 'players'} on roster
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search players..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                onClick={() => requestSort('gamertag')}
              >
                <div className="flex items-center">
                  Player
                  <SortIndicator column="gamertag" sortConfig={sortConfig} />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                onClick={() => requestSort('position')}
              >
                <div className="flex items-center">
                  Position
                  <SortIndicator column="position" sortConfig={sortConfig} />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAndFilteredPlayers.length > 0 ? (
              sortedAndFilteredPlayers.map((player, index) => (
                <tr 
                  key={player.id} 
                  className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/30'} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 border border-gray-200 dark:border-gray-600">
                        {player.avatar_url ? (
                          <Image
                            src={player.avatar_url}
                            alt={player.gamertag}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                            {player.gamertag.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {player.gamertag}
                        </div>
                        {(player.first_name || player.last_name) && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {player.first_name} {player.last_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {player.position ? (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                        {player.position}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(player)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No players match your search.' : 'No players found on the roster.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
