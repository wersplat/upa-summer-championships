declare module 'AwardsPageClient' {
  interface PlayerStats {
    id: string;
    gamertag: string;
    position: string;
    team_id: string;
    team_name: string;
    team_logo_url: string | null;
    points_per_game: number;
    assists_per_game: number;
    field_goal_percentage: number;
    three_point_percentage: number;
    steals_per_game: number;
    blocks_per_game: number;
    rebounds_per_game: number;
    games_played: number;
    minutes_per_game: number;
    is_rookie: boolean;
    overall_rating: number;
    offensive_rating?: number;
    defensive_rating?: number;
    rookie_rating?: number;
  }

  interface AwardsPageClientProps {
    omvpCandidates: PlayerStats[];
    dmvpCandidates: PlayerStats[];
    rookieCandidates: PlayerStats[];
  }

  const AwardsPageClient: React.FC<AwardsPageClientProps>;
  export default AwardsPageClient;
}
