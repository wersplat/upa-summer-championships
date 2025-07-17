-- Insert sample teams
WITH team1 AS (
  INSERT INTO public.teams (name, region, id, logo_url)
  VALUES ('Thunderbolts', 'North', 'thunderbolts', 'https://via.placeholder.com/150/FFD700/000000?text=TB')
  RETURNING id
),
team2 AS (
  INSERT INTO public.teams (name, region, id, logo_url)
  VALUES ('Phoenix Rising', 'South', 'phoenix-rising', 'https://via.placeholder.com/150/FF4500/FFFFFF?text=PR')
  RETURNING id
),
team3 AS (
  INSERT INTO public.teams (name, region, id, logo_url)
  VALUES ('Titan Titans', 'East', 'titan-titans', 'https://via.placeholder.com/150/1E90FF/FFFFFF?text=TT')
  RETURNING id
),

-- Insert sample players
player1 AS (
  INSERT INTO public.players (gamertag, position)
  VALUES ('AceViper', 'Striker')
  RETURNING id
),
player2 AS (
  INSERT INTO public.players (gamertag, position)
  VALUES ('ShadowStrike', 'Midfield')
  RETURNING id
),
player3 AS (
  INSERT INTO public.players (gamertag, position)
  VALUES ('BlazeRunner', 'Defense')
  RETURNING id
),
player4 AS (
  INSERT INTO public.players (gamertag, position)
  VALUES ('FrostByte', 'Goalkeeper')
  RETURNING id
),
player5 AS (
  INSERT INTO public.players (gamertag, position)
  VALUES ('NeoNinja', 'Striker')
  RETURNING id
),
player6 AS (
  INSERT INTO public.players (gamertag, position)
  VALUES ('CyberWolf', 'Midfield')
  RETURNING id
),

-- Add players to team rosters
roster1 AS (
  INSERT INTO public.team_rosters (team_id, player_id, is_captain)
  SELECT team1.id, player1.id, TRUE
  FROM team1, player1
  RETURNING team_id
),
roster2 AS (
  INSERT INTO public.team_rosters (team_id, player_id, is_captain)
  SELECT team1.id, player2.id, FALSE
  FROM team1, player2
  RETURNING team_id
),
roster3 AS (
  INSERT INTO public.team_rosters (team_id, player_id, is_captain)
  SELECT team2.id, player3.id, FALSE
  FROM team2, player3
  RETURNING team_id
),
roster4 AS (
  INSERT INTO public.team_rosters (team_id, player_id, is_captain)
  SELECT team2.id, player4.id, TRUE
  FROM team2, player4
  RETURNING team_id
),
roster5 AS (
  INSERT INTO public.team_rosters (team_id, player_id, is_captain)
  SELECT team3.id, player5.id, FALSE
  FROM team3, player5
  RETURNING team_id
),
roster6 AS (
  INSERT INTO public.team_rosters (team_id, player_id, is_captain)
  SELECT team3.id, player6.id, TRUE
  FROM team3, player6
  RETURNING team_id
)

-- Insert sample matches
INSERT INTO public.matches (
  home_team_id, 
  away_team_id, 
  home_score, 
  away_score, 
  match_date, 
  status
)
SELECT 
  t1.id, 
  t2.id, 
  floor(random() * 5)::int, 
  floor(random() * 5)::int, 
  NOW() - (interval '1 day' * random() * 30),
  'completed'
FROM team1 t1, team2 t2, generate_series(1, 2) n
UNION ALL
SELECT 
  t1.id, 
  t3.id, 
  floor(random() * 5)::int, 
  floor(random() * 5)::int, 
  NOW() - (interval '1 day' * random() * 30),
  'completed'
FROM team1 t1, team3 t3, generate_series(1, 2) n
UNION ALL
SELECT 
  t2.id, 
  t3.id, 
  floor(random() * 5)::int, 
  floor(random() * 5)::int, 
  NOW() - (interval '1 day' * random() * 30),
  'completed'
FROM team2 t2, team3 t3, generate_series(1, 2) n
UNION ALL
-- Upcoming matches
SELECT 
  t1.id, 
  t2.id, 
  NULL, 
  NULL, 
  NOW() + (interval '1 day' * (7 + random() * 14)),
  'scheduled'
FROM team1 t1, team2 t2, generate_series(1, 2) n;
