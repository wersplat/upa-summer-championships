'use client';

import { useState, useMemo } from 'react';
import type { Player as BasePlayer } from '@/utils/supabase';

type Player = BasePlayer & {
  avatar_url?: string | null;
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
import Image from 'next/image';

type SortConfig = {
  key: keyof Player;
  direction: 'asc' | 'desc';
};

interface RosterTableProps {
  players: Player[];
}

export default function RosterTable({ players }: RosterTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'gamertag', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  const sortedAndFilteredPlayers = useMemo(() => {
    const filtered = players.filter(player => {
      const searchLower = searchTerm.toLowerCase();
      return (
        player.gamertag.toLowerCase().includes(searchLower) ||
        (player.position?.toLowerCase() || '').includes(searchLower)
      );
    });

    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Compare values
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [players, sortConfig, searchTerm]);

  const requestSort = (key: keyof Player) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIndicator = ({ column }: { column: keyof Player }) => (
    <span className="ml-1">
      {sortConfig.key === column ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const getStatusBadge = (player: RosterTableProps['players'][0]) => {
    const rosterInfo = player.team_rosters?.[0];
    if (!rosterInfo) return null;
    
    const badges = [];
    
    if (rosterInfo.is_captain) {
      badges.push(
        <span key="captain" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200 mr-1">
          C
        </span>
      );
    }
    
    if (rosterInfo.is_player_coach) {
      badges.push(
        <span key="coach" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-200 mr-1">
          CO
        </span>
      );
    }
    
    // If no specific role badges, show Player
    if (badges.length === 0) {
      badges.push(
        <span key="player" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200">
          P
        </span>
      );
    }
    
    return <div className="flex space-x-1">{badges}</div>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Team Roster
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {players.length} players on the active roster
          </p>
        </div>
        <div className="w-64">
          <input
            type="text"
            placeholder="Search players..."
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('gamertag')}
              >
                <div className="flex items-center">
                  Player
                  <SortIndicator column="gamertag" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('position')}
              >
                <div className="flex items-center">
                  Position
                  <SortIndicator column="position" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('player_rp')}
              >
                <div className="flex items-center">
                  RP
                  <SortIndicator column="player_rp" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('performance_score')}
              >
                <div className="flex items-center">
                  PS
                  <SortIndicator column="performance_score" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAndFilteredPlayers.length > 0 ? (
              sortedAndFilteredPlayers.map((player) => {
                const rosterInfo = player.team_rosters?.[0];
                
                return (
                  <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 overflow-hidden">
                          {player.avatar_url ? (
                            <Image
                              width={40}
                              height={40}
                              className="h-10 w-10 object-cover"
                              src={player.avatar_url}
                              alt={`${player.gamertag}'s avatar`}
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium">
                              {player.gamertag.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {player.gamertag}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {player.performance_score?.toFixed(1) || '0.0'} PS
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {player.position || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(player)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {player.player_rp?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {player.performance_score.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {rosterInfo ? (
                        <>
                          <div>{new Date(rosterInfo.joined_at).toLocaleDateString()}</div>
                          {rosterInfo.left_at && (
                            <div className="text-xs text-red-500 dark:text-red-400">
                              Left: {new Date(rosterInfo.left_at).toLocaleDateString()}
                            </div>
                          )}
                        </>
                      ) : 'N/A'}
                    </td>
                  </tr>
                );
              })
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
