import { Player } from '@/utils/supabase';

export interface PlayerStats {
  games_played: number;
  points_per_game: number;
  assists_per_game: number;
  rebounds_per_game: number;
  steals_per_game: number;
  blocks_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  free_throw_percentage: number;
  minutes_per_game: number;
  turnovers_per_game: number;
  fouls_per_game: number;
  plus_minus: number;
}

export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface PlayerWithTeam extends Player {
  teams?: Team[];
  stats?: PlayerStats;
}

declare module '@/components/PlayerProfile' {
  import { FC } from 'react';
  import { PlayerWithTeam } from '@/types/player';

  interface PlayerProfileProps {
    player: PlayerWithTeam;
  }

  const PlayerProfile: FC<PlayerProfileProps>;
  export default PlayerProfile;
}

declare module './PlayersPageClient' {
  import { FC } from 'react';
  import { PlayerWithTeam } from '@/types/player';

  interface PlayersPageClientProps {
    players: PlayerWithTeam[];
  }

  const PlayersPageClient: FC<PlayersPageClientProps>;
  export default PlayersPageClient;
}
