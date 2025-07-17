interface TeamStatsProps {
  stats: {
    games_played: number;
    avg_points: number;
    wins: number;
    losses: number;
  };
}

export default function TeamStats({ stats }: TeamStatsProps) {
  const winPercentage = stats.games_played > 0 
    ? Math.round((stats.wins / stats.games_played) * 100) 
    : 0;

  const statsList = [
    { name: 'Games Played', value: stats.games_played },
    { name: 'Wins', value: stats.wins },
    { name: 'Losses', value: stats.losses },
    { name: 'Win %', value: `${winPercentage}%` },
    { name: 'Avg. Points/Game', value: stats.avg_points.toFixed(1) },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Season Stats
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {statsList.map((item) => (
            <div key={item.name} className="px-4 py-5 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate">
                {item.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
