-- Create table for worm race sessions
CREATE TABLE public.race_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, racing, finished
  max_players INTEGER NOT NULL DEFAULT 4,
  race_distance INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.race_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Race sessions are viewable by everyone"
ON public.race_sessions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create races"
ON public.race_sessions FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their races"
ON public.race_sessions FOR UPDATE
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their races"
ON public.race_sessions FOR DELETE
USING (auth.uid() = host_id);

-- Create table for race participants
CREATE TABLE public.race_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID NOT NULL REFERENCES public.race_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  circuit_data JSONB NOT NULL,
  worm_name TEXT NOT NULL DEFAULT 'Wormie',
  position NUMERIC NOT NULL DEFAULT 0,
  finished_at TIMESTAMP WITH TIME ZONE,
  finish_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(race_id, user_id)
);

-- Enable RLS
ALTER TABLE public.race_participants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Race participants are viewable by everyone"
ON public.race_participants FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join races"
ON public.race_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own position"
ON public.race_participants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave races"
ON public.race_participants FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for races
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_participants;

-- Create table for global contribution stats (singleton pattern)
CREATE TABLE public.global_stats (
  id TEXT NOT NULL DEFAULT 'global' PRIMARY KEY,
  total_circuits_shared INTEGER NOT NULL DEFAULT 0,
  total_simulations_run INTEGER NOT NULL DEFAULT 0,
  total_active_researchers INTEGER NOT NULL DEFAULT 0,
  countries_represented INTEGER NOT NULL DEFAULT 42,
  openworm_citations INTEGER NOT NULL DEFAULT 287,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;

-- Everyone can view stats
CREATE POLICY "Global stats are viewable by everyone"
ON public.global_stats FOR SELECT
USING (true);

-- Insert initial stats
INSERT INTO public.global_stats (id, total_circuits_shared, total_simulations_run, total_active_researchers)
VALUES ('global', 0, 0, 0);

-- Create function to increment simulation count
CREATE OR REPLACE FUNCTION public.increment_simulation_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.global_stats
  SET total_simulations_run = total_simulations_run + 1,
      updated_at = now()
  WHERE id = 'global';
END;
$$;

-- Create trigger to update circuit count when circuits are shared
CREATE OR REPLACE FUNCTION public.update_circuit_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.global_stats
    SET total_circuits_shared = total_circuits_shared + 1,
        updated_at = now()
    WHERE id = 'global';
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.global_stats
    SET total_circuits_shared = GREATEST(0, total_circuits_shared - 1),
        updated_at = now()
    WHERE id = 'global';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_circuit_shared
AFTER INSERT OR DELETE ON public.shared_circuits
FOR EACH ROW
EXECUTE FUNCTION public.update_circuit_stats();