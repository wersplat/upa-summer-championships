-- Create custom types
CREATE TYPE public.position_type AS ENUM ('Guard', 'Forward', 'Center', 'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward');
CREATE TYPE public.event_tier AS ENUM ('T1', 'T2', 'T3', 'T4');

-- Create Regions table
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Create Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  region_id UUID REFERENCES public.regions(id),
  current_rp INTEGER DEFAULT 0,
  elo_rating DOUBLE PRECISION DEFAULT 1500,
  global_rank INTEGER,
  leaderboard_tier TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  slug TEXT GENERATED ALWAYS AS (lower(replace(regexp_replace(name, '[^a-zA-Z0-9]', '-', 'g'), '--', '-'))) STORED UNIQUE
);

-- Create Players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gamertag TEXT NOT NULL UNIQUE,
  position position_type,
  region_id UUID REFERENCES public.regions(id),
  current_team_id UUID REFERENCES public.teams(id),
  performance_score DOUBLE PRECISION DEFAULT 0,
  player_rp INTEGER DEFAULT 0,
  player_rank_score DOUBLE PRECISION DEFAULT 0,
  monthly_value INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  is_global BOOLEAN DEFAULT false,
  region_id UUID REFERENCES public.regions(id),
  start_date DATE,
  end_date DATE,
  max_rp INTEGER,
  decay_days INTEGER,
  processed BOOLEAN DEFAULT false,
  description TEXT,
  banner_url TEXT,
  rules_url TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming',
  tier event_tier,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id),
  team_a_id UUID REFERENCES public.teams(id),
  team_b_id UUID REFERENCES public.teams(id),
  winner_id UUID REFERENCES public.teams(id),
  score_a INTEGER,
  score_b INTEGER,
  played_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create Team Rosters table
CREATE TABLE IF NOT EXISTS public.team_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  is_captain BOOLEAN DEFAULT false,
  is_player_coach BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITHOUT TIME ZONE,
  event_id UUID REFERENCES public.events(id),
  CONSTRAINT unique_team_player_event UNIQUE (team_id, player_id, event_id)
);

-- Create Player Stats table
CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id),
  match_id UUID NOT NULL REFERENCES public.matches(id),
  team_id UUID REFERENCES public.teams(id),
  points INTEGER,
  assists INTEGER,
  rebounds INTEGER,
  steals INTEGER,
  blocks INTEGER,
  turnovers INTEGER,
  fouls INTEGER,
  ps DOUBLE PRECISION GENERATED ALWAYS AS (points + assists + rebounds + steals + blocks - turnovers - fouls) STORED,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, match_id)
);

-- Create Event Results table
CREATE TABLE IF NOT EXISTS public.event_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id),
  team_id UUID NOT NULL REFERENCES public.teams(id),
  placement INTEGER,
  rp_awarded INTEGER,
  bonus_rp INTEGER DEFAULT 0,
  total_rp INTEGER GENERATED ALWAYS AS (rp_awarded + bonus_rp) STORED,
  awarded_at DATE DEFAULT CURRENT_DATE,
  UNIQUE(event_id, team_id)
);

-- Create Ranking Points table
CREATE TABLE IF NOT EXISTS public.ranking_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id),
  source TEXT,
  event_id UUID REFERENCES public.events(id),
  points INTEGER,
  awarded_at DATE DEFAULT CURRENT_DATE,
  expires_at DATE
);

-- Create RP Transactions table
CREATE TABLE IF NOT EXISTS public.rp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id),
  event_id UUID REFERENCES public.events(id),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type = ANY (ARRAY['event', 'bonus', 'penalty', 'adjustment'])),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Salary Tiers table
CREATE TABLE IF NOT EXISTS public.salary_tiers (
  id BIGSERIAL PRIMARY KEY,
  salary_tier TEXT NOT NULL UNIQUE,
  label TEXT,
  multiplier NUMERIC NOT NULL,
  min_rating INTEGER,
  max_rating INTEGER,
  description TEXT
);

-- Create Draft Pool table
CREATE TABLE IF NOT EXISTS public.draft_pool (
  player_id UUID PRIMARY KEY REFERENCES public.players(id),
  declared_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'available',
  season TEXT,
  draft_rating INTEGER,
  draft_notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_region ON public.teams(region_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(current_team_id);
CREATE INDEX IF NOT EXISTS idx_players_region ON public.players(region_id);
CREATE INDEX IF NOT EXISTS idx_team_rosters_team ON public.team_rosters(team_id);
CREATE INDEX IF NOT EXISTS idx_team_rosters_player ON public.team_rosters(player_id);
CREATE INDEX IF NOT EXISTS idx_team_rosters_event ON public.team_rosters(event_id);
CREATE INDEX IF NOT EXISTS idx_matches_event ON public.matches(event_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_a ON public.matches(team_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_b ON public.matches(team_b_id);
CREATE INDEX IF NOT EXISTS idx_matches_winner ON public.matches(winner_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON public.player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_match ON public.player_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_team ON public.player_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_event_results_event ON public.event_results(event_id);
CREATE INDEX IF NOT EXISTS idx_event_results_team ON public.event_results(team_id);
CREATE INDEX IF NOT EXISTS idx_ranking_points_team ON public.ranking_points(team_id);
CREATE INDEX IF NOT EXISTS idx_ranking_points_event ON public.ranking_points(event_id);
CREATE INDEX IF NOT EXISTS idx_rp_transactions_team ON public.rp_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_rp_transactions_event ON public.rp_transactions(event_id);

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_pool ENABLE ROW LEVEL SECURITY;
