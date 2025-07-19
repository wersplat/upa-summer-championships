import { PlayerWithTeam } from '@/app/players/page';

declare module '@/components/PlayerProfile' {
  const PlayerProfile: React.ComponentType<{ player: PlayerWithTeam }>;
  export { PlayerProfile };
}
