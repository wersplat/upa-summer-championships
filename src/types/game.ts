export interface PlayerStats {
  id: string;
  name: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  field_goals_made: number;
  field_goals_attempted: number;
  three_points_made: number;
  three_points_attempted: number;
  free_throws_made: number;
  free_throws_attempted: number;
  plus_minus: number;
  performance_score: number;
}

export interface TeamScore {
  id: string;
  name: string;
  score: number;
  logo_url?: string;
  stats?: {
    field_goals_made: number;
    field_goals_attempted: number;
    three_points_made: number;
    three_points_attempted: number;
    free_throws_made: number;
    free_throws_attempted: number;
    offensive_rebounds: number;
    defensive_rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fouls: number;
  };
  playerStats?: PlayerStats[];
}

export interface Game {
  id: string;
  team1: TeamScore;
  team2: TeamScore;
  date: string; // ISO date string
  location?: string;
  highlights?: string;
  mvp?: string;
  status: 'completed' | 'upcoming' | 'in_progress';
  tournamentStage?: string;
}
