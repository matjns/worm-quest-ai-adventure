-- Create player_ratings table for matchmaking
CREATE TABLE public.player_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  elo_rating INTEGER NOT NULL DEFAULT 1200,
  tier TEXT NOT NULL DEFAULT 'bronze',
  total_races INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  rating_deviation INTEGER NOT NULL DEFAULT 350,
  last_race_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for player_ratings
CREATE POLICY "Player ratings are viewable by everyone"
  ON public.player_ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own rating"
  ON public.player_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rating"
  ON public.player_ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add skill_tier column to race_sessions for matchmaking
ALTER TABLE public.race_sessions
ADD COLUMN skill_tier TEXT DEFAULT 'open',
ADD COLUMN min_elo INTEGER DEFAULT 0,
ADD COLUMN max_elo INTEGER DEFAULT 9999,
ADD COLUMN is_ranked BOOLEAN DEFAULT false;

-- Function to update player ratings after a race
CREATE OR REPLACE FUNCTION public.calculate_elo_change(
  winner_elo INTEGER,
  loser_elo INTEGER,
  k_factor INTEGER DEFAULT 32
) RETURNS INTEGER AS $$
DECLARE
  expected_score DECIMAL;
  elo_change INTEGER;
BEGIN
  expected_score := 1.0 / (1.0 + POWER(10.0, (loser_elo - winner_elo) / 400.0));
  elo_change := ROUND(k_factor * (1.0 - expected_score));
  RETURN elo_change;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to determine tier from ELO
CREATE OR REPLACE FUNCTION public.get_tier_from_elo(elo_rating INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF elo_rating >= 2000 THEN RETURN 'grandmaster';
  ELSIF elo_rating >= 1800 THEN RETURN 'master';
  ELSIF elo_rating >= 1600 THEN RETURN 'diamond';
  ELSIF elo_rating >= 1400 THEN RETURN 'platinum';
  ELSIF elo_rating >= 1200 THEN RETURN 'gold';
  ELSIF elo_rating >= 1000 THEN RETURN 'silver';
  ELSE RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to update tier automatically
CREATE OR REPLACE FUNCTION public.update_player_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier := public.get_tier_from_elo(NEW.elo_rating);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_tier_trigger
  BEFORE UPDATE ON public.player_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_player_tier();

-- Enable realtime for player_ratings
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_ratings;