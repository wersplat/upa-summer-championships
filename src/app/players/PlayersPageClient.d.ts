import type { PlayerWithTeam } from './page';

declare const PlayersPageClient: React.FC<{
  players: PlayerWithTeam[];
  showFallbackMessage?: boolean;
}>;

export default PlayersPageClient;
