import { getCompletedGames } from '@/lib/api/games';
import GameRecaps from './GameRecaps';

export default async function RecapPage() {
  const games = await getCompletedGames();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Game Recaps</h1>
      <GameRecaps initialGames={games} />
    </div>
  );
}
