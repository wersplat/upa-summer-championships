'use client';

import { Team } from '@/utils/supabase';

interface TeamStatsProps {
  team: Team & {
    team_rp?: number;
    team_rp_change?: number;
    team_elo_rating?: number;
    team_elo_change?: number;
    team_stats?: {
      games_played: number;
      wins: number;
      losses: number;
      draws: number;
      goals_for: number;
      goals_against: number;
      current_streak: number;
      form_last_5: string[];
    };
  };
}

export default function TeamStats({ team }: TeamStatsProps) {
  const stats = team.team_stats;
  
  if (!stats) {
    return (
      <div className="bg-navy/80 shadow-sun overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-blue">
          <h3 className="text-lg leading-6 font-extrabold text-white drop-shadow">
            Team Statistics
          </h3>
        </div>
        <div className="px-4 py-12 text-center">
          <p className="text-white/80">No statistics available yet</p>
        </div>
      </div>
    );
  }

  const winPercentage = stats.games_played > 0 
    ? Math.round((stats.wins / stats.games_played) * 100) 
    : 0;
  
  const goalDifference = stats.goals_for - stats.goals_against;
  const avgGoalsFor = stats.games_played > 0 
    ? (stats.goals_for / stats.games_played).toFixed(1) 
    : 0;
  const avgGoalsAgainst = stats.games_played > 0 
    ? (stats.goals_against / stats.games_played).toFixed(1) 
    : 0;

  const statsList = [
    { 
      name: 'Ranking Points', 
      value: team.team_rp?.toLocaleString() || '0',
      change: team.team_rp_change || 0,
      icon: '🏆',
      description: 'Current season ranking points'
    },
    { 
      name: 'ELO Rating', 
      value: team.team_elo_rating?.toFixed(0) || '1500',
      change: team.team_elo_change || 0,
      icon: '📊',
      description: 'Current ELO rating'
    },
    { 
      name: 'Record', 
      value: `${stats.wins}-${stats.losses}${stats.draws > 0 ? `-${stats.draws}` : ''}`,
      icon: '📈',
      description: 'Win-Loss-Draw record'
    },
    { 
      name: 'Win %', 
      value: `${winPercentage}%`,
      icon: '🎯',
      description: 'Win percentage'
    },
    { 
      name: 'Goal Difference', 
      value: goalDifference > 0 ? `+${goalDifference}` : goalDifference,
      icon: '⚽',
      description: 'Goals for minus goals against'
    },
    { 
      name: 'Current Streak', 
      value: stats.current_streak !== 0 
        ? `${stats.current_streak > 0 ? 'W' : 'L'} ${Math.abs(stats.current_streak)}`
        : '—',
      icon: '🔥',
      description: 'Current win/loss streak'
    },
    { 
      name: 'Avg. Goals For', 
      value: avgGoalsFor,
      icon: '⬆️',
      description: 'Average goals scored per game'
    },
    { 
      name: 'Avg. Goals Against', 
      value: avgGoalsAgainst,
      icon: '⬇️',
      description: 'Average goals conceded per game'
    },
  ];

  const renderFormIndicator = (result: string, index: number) => {
    const baseClasses = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium';
    
    switch (result) {
      case 'W':
        return (
          <div key={index} className={`${baseClasses} bg-green-500 text-white`}>
            W
          </div>
        );
      case 'L':
        return (
          <div key={index} className={`${baseClasses} bg-red text-white`}>
            L
          </div>
        );
      case 'D':
        return (
          <div key={index} className={`${baseClasses} bg-gold text-navy`}>
            D
          </div>
        );
      default:
        return (
          <div key={index} className={`${baseClasses} bg-blue text-white`}>
            —
          </div>
        );
    }
  };

  return (
    <div className="bg-navy/80 shadow-sun overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-blue flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-extrabold text-white drop-shadow">
            Team Statistics
          </h3>
          <p className="mt-1 text-sm text-white/80">
            Season {new Date().getFullYear()} performance metrics
          </p>
        </div>
        
        {stats.form_last_5 && stats.form_last_5.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-white/80 mr-2">Form:</span>
            {stats.form_last_5.map((result, index) => renderFormIndicator(result, index))}
          </div>
        )}
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statsList.map((item) => (
            <div 
              key={item.name} 
              className="px-4 py-5 bg-white/10 rounded-lg overflow-hidden sm:p-6 hover:bg-white/20 transition-colors duration-150"
              title={item.description}
            >
              <div className="flex items-center">
                <span className="text-lg mr-2" aria-hidden="true">{item.icon}</span>
                <dt className="text-sm font-medium text-white/80 truncate">
                  {item.name}
                </dt>
              </div>
              <div className="mt-2 flex items-baseline">
                <dd className="text-2xl font-semibold text-white">
                  {item.value}
                </dd>
                {item.change !== undefined && item.change !== 0 && (
                  <span className={`ml-2 text-sm font-medium ${item.change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
