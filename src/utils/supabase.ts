import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enums
export type PositionType = 'Guard' | 'Forward' | 'Center' | 'Point Guard' | 'Shooting Guard' | 'Small Forward' | 'Power Forward';
export type EventTier = 'T1' | 'T2' | 'T3' | 'T4';
export type RosterStatus = 'active' | 'inactive' | 'suspended';

// Core Types
export type Region = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  logo_url: string | null;
  region_id: string | null;
  current_rp: number | null;
  elo_rating: number | null;
  global_rank: number | null;
  leaderboard_tier: string | null;
  created_at: string;
  region?: Region;
};

export type Player = {
  id: string;
  gamertag: string;
  position?: PositionType;
  region_id?: string;
  current_team_id?: string;
  performance_score: number;
  player_rp: number;
  player_rank_score: number;
  monthly_value: number;
  created_at: string;
  team?: Team;
  region?: Region;
};

export type Event = {
  id: string;
  name: string;
  type?: string;
  is_global: boolean;
  region_id?: string;
  start_date?: string;
  end_date?: string;
  max_rp?: number;
  decay_days?: number;
  processed: boolean;
  description?: string;
  banner_url?: string;
  rules_url?: string;
  processed_at?: string;
  status: string;
  tier?: EventTier;
  created_at: string;
  region?: Region;
};

export type Match = {
  id: string;
  event_id: string;
  team_a_id?: string;
  team_b_id?: string;
  winner_id?: string;
  score_a?: number;
  score_b?: number;
  played_at: string;
  event?: Event;
  team_a?: Team;
  team_b?: Team;
  winner?: Team;
};

export type TeamRoster = {
  id: string;
  team_id: string;
  player_id: string;
  is_captain: boolean;
  is_player_coach: boolean;
  joined_at: string;
  left_at?: string;
  event_id?: string;
  player?: Player;
  team?: Team;
  event?: Event;
};

export type PlayerStats = {
  id: string;
  player_id: string;
  match_id: string;
  team_id?: string;
  points?: number;
  assists?: number;
  rebounds?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;
  ps: number; // Performance Score (generated column)
  created_at: string;
  player?: Player;
  match?: Match;
  team?: Team;
};

export type EventResult = {
  id: string;
  event_id: string;
  team_id: string;
  placement?: number;
  rp_awarded?: number;
  bonus_rp: number;
  total_rp: number; // Generated column
  awarded_at: string;
  event?: Event;
  team?: Team;
};

export type RankingPoints = {
  id: string;
  team_id?: string;
  source?: string;
  event_id?: string;
  points?: number;
  awarded_at: string;
  expires_at?: string;
  team?: Team;
  event?: Event;
};

export type RPTransaction = {
  id: string;
  team_id?: string;
  event_id?: string;
  amount: number;
  description: string;
  type: 'event' | 'bonus' | 'penalty' | 'adjustment';
  created_at: string;
  updated_at: string;
  team?: Team;
  event?: Event;
};

export type SalaryTier = {
  id: number;
  salary_tier: string;
  label?: string;
  multiplier: number;
  min_rating?: number;
  max_rating?: number;
  description?: string;
};

export type DraftPool = {
  player_id: string;
  declared_at: string;
  status: string;
  season?: string;
  draft_rating?: number;
  draft_notes?: string;
  player?: Player;
};
