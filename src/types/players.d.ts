import { PlayerWithTeam } from '@/app/players/page';

declare module '@/app/players/PlayersPageClient' {
  const PlayersPageClient: React.ComponentType<{ players: PlayerWithTeam[] }>;
  export default PlayersPageClient;
}
