import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enums
export type PositionType = 'Center' | 'Point Guard' | 'Shooting Guard' | 'Lock' | 'Power Forward';
export type EventTier = 'T1' | 'T2' | 'T3' | 'T4';
export type RosterStatus = 'active' | 'inactive' | 'suspended';

// Core Types
export type Region = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
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
  updated_at?: string;
  region?: Region;
};

export type Player = {
  id: string;
  gamertag: string;
  position?: PositionType;
  region_id?: string | null;
  current_team_id?: string | null;
  performance_score: number;
  player_rp: number;
  player_rank_score: number;
  monthly_value: number;
  created_at: string;
  updated_at?: string;
  team?: Team;
  region?: Region;
};

export type Event = {
  id: string;
  name: string;
  type?: string;
  is_global: boolean;
  region_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  max_rp?: number | null;
  decay_days?: number | null;
  processed: boolean;
  description?: string | null;
  banner_url?: string | null;
  rules_url?: string | null;
  processed_at?: string | null;
  status: string;
  tier?: EventTier | null;
  created_at: string;
  updated_at?: string;
  region?: Region;
};

export type EventGroup = {
  id: string;
  event_id: string;
  name: string;
  group_number: number;
  created_at: string;
  updated_at?: string;
  event?: Event;
};

export type Match = {
  id: string;
  event_id: string;
  team_a_id?: string | null;
  team_b_id?: string | null;
  winner_id?: string | null;
  score_a?: number | null;
  score_b?: number | null;
  played_at: string;
  created_at: string;
  updated_at?: string;
  event?: Event;
  team_a?: Team;
  team_b?: Team;
  winner?: Team;
  group_id?: string | null;
  round?: number | null;
  match_number?: number | null;
  boxscore_url?: string | null;
  group?: EventGroup;
};

export type TeamRoster = {
  id: string;
  team_id: string;
  player_id: string;
  is_captain: boolean;
  is_player_coach: boolean;
  joined_at: string;
  left_at?: string | null;
  event_id?: string | null;
  created_at: string;
  updated_at?: string;
  player?: Player;
  team?: Team;
  event?: Event;
};

export type PlayerStats = {
  id: string;
  player_id: string;
  match_id: string;
  team_id?: string | null;
  points?: number | null;
  assists?: number | null;
  rebounds?: number | null;
  steals?: number | null;
  blocks?: number | null;
  turnovers?: number | null;
  fouls?: number | null;
  ps: number; // Performance Score (generated column)
  created_at: string;
  updated_at?: string;
  player?: Player;
  match?: Match;
  team?: Team;
};

export type EventResult = {
  id: string;
  event_id: string;
  team_id: string;
  placement?: number | null;
  rp_awarded?: number | null;
  bonus_rp: number;
  total_rp: number; // Generated column
  awarded_at: string;
  created_at: string;
  updated_at?: string;
  event?: Event;
  team?: Team;
};

export type RankingPoints = {
  id: string;
  team_id?: string | null;
  source?: string | null;
  event_id?: string | null;
  points?: number | null;
  awarded_at: string;
  expires_at?: string | null;
  created_at: string;
  updated_at?: string;
  team?: Team;
  event?: Event;
};

export type RPTransaction = {
  id: string;
  team_id?: string | null;
  event_id?: string | null;
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
  label?: string | null;
  multiplier: number;
  min_rating?: number | null;
  max_rating?: number | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DraftPool = {
  player_id: string;
  declared_at: string;
  status: string;
  season?: string | null;
  draft_rating?: number | null;
  draft_notes?: string | null;
  event_id?: string | null;
  created_at?: string;
  updated_at?: string;
  player?: Player;
  event?: Event;
};

export type MatchPoints = {
  id: string;
  match_id: string;
  team_id: string;
  group_id: string | null;
  points_earned: number;
  point_type: 'win_by_20_plus' | 'regular_win' | 'loss' | 'forfeit';
  created_at: string;
  updated_at: string;
  match?: Match;
  team?: Team;
  group?: EventGroup;
};

export type GroupPointsStanding = {
  group_id: string | null;
  group_name: string | null;
  event_id: string | null;
  event_name: string | null;
  team_id: string | null;
  team_name: string | null;
  position: number | null;
  matches_played: number | null;
  wins: number | null;
  losses: number | null;
  total_points: number | null;
  wins_by_20_plus: number | null;
  regular_wins: number | null;
  forfeits: number | null;
  points_for: number | null;
  points_against: number | null;
  point_differential: number | null;
  updated_at: string | null;
  team?: Team;
  event?: Event;
  group?: EventGroup;
};

export type TournamentSchedule = {
  event_id: string | null;
  event_name: string | null;
  start_date: string | null;
  group_name: string | null;
  team_a_name: string | null;
  team_b_name: string | null;
  team_a_score?: number | null;
  team_b_score?: number | null;
  start_time: string | null;
  end_time: string | null;
  start_time_formatted: string | null;
  end_time_formatted: string | null;
  venue: string | null;
  status: string | null;
  notes?: string | null;
  event?: Event;
};

// View Types
export type TeamPerformanceSummary = {
  id: string;
  name: string;
  region_id: string;
  region_name: string;
  win_percentage: number;
  matches_won: number;
  matches_lost: number;
  total_matches: number;
  current_rp: number;
  elo_rating: number;
  global_rank: number;
  leaderboard_tier: string;
};

export type TeamMatchStats = {
  id: string;
  team_id: string;
  match_id: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  field_goals_made: number;
  field_goals_attempted: number;
  three_points_made: number;
  three_points_attempted: number;
  free_throws_made: number;
  free_throws_attempted: number;
  fouls: number;
  plus_minus: number;
};

export type PlayerPerformanceSummary = {
  id: string;
  gamertag: string;
  position: PositionType;
  current_team_id: string;
  team_name: string;
  region_name: string;
  matches_played: number;
  avg_points: number;
  avg_assists: number;
  avg_rebounds: number;
  avg_steals: number;
  avg_blocks: number;
  mvp_count: number;
  avg_performance_score: number;
  player_rp: number;
  player_rank_score: number;
  monthly_value: number;
};

export type PlayerMatchHistory = {
  match_id: string;
  player_id: string;
  team_id: string;
  event_id: string;
  played_at: string;
  is_winner: boolean;
  points: number;
  assists: number;
  rebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fgm: number;
  fga: number;
  fg_percentage: number;
  three_points_made: number;
  three_points_attempted: number;
  three_point_percentage: number;
  ftm: number;
  fta: number;
  ft_percentage: number;
  plus_minus: number;
  performance_score: number;
  is_mvp: boolean;
  gamertag: string;
  team_name: string;
  event_name: string;
};

export type UpcomingMatchesView = {
  id: string;
  event_id: string;
  team_a_id: string;
  team_b_id: string;
  team_a_name: string;
  team_b_name: string;
  team_a_logo: string | null;
  team_b_logo: string | null;
  scheduled_time: string;
  event_name: string;
  event_logo: string | null;
  group_id?: string;
  group_name?: string;
  round?: number;
  match_number?: number;
};

export type GroupStandingsView = {
  group_id: string;
  group_name: string;
  team_id: string;
  team_name: string;
  team_logo: string | null;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  points_for: number;
  points_against: number;
  point_difference: number;
  win_percentage: number;
  position: number;
};

export type GroupMatchesView = {
  match_id: string;
  group_id: string;
  group_name: string;
  event_id: string;
  event_name: string;
  team_a_id: string;
  team_b_id: string;
  team_a_name: string;
  team_b_name: string;
  team_a_logo: string | null;
  team_b_logo: string | null;
  score_a: number | null;
  score_b: number | null;
  winner_id: string | null;
  played_at: string;
  round: number | null;
  match_number: number | null;
};
