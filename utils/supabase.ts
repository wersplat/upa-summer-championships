import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database tables
export type Team = {
  id: string;
  name: string;
  logo_url: string;
  region: string;
  created_at: string;
};

export type Player = {
  id: string;
  gamertag: string;
  position: string;
  is_captain: boolean;
  team_id: string;
};

export type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  match_date: string;
  status: 'scheduled' | 'completed' | 'postponed';
};

export type TeamRoster = Player & {
  team: Team;
};

export type TeamWithRoster = Team & {
  players: Player[];
  recent_matches: Match[];
  stats: {
    games_played: number;
    avg_points: number;
    wins: number;
    losses: number;
  };
};
