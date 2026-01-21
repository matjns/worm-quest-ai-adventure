-- Fix generate_join_code function
CREATE OR REPLACE FUNCTION public.generate_join_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$function$;

-- Fix set_classroom_join_code function
CREATE OR REPLACE FUNCTION public.set_classroom_join_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.join_code IS NULL THEN
    LOOP
      NEW.join_code := public.generate_join_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classrooms WHERE join_code = NEW.join_code);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix update_player_tier function
CREATE OR REPLACE FUNCTION public.update_player_tier()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.tier := public.get_tier_from_elo(NEW.elo_rating);
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Fix calculate_elo_change function
CREATE OR REPLACE FUNCTION public.calculate_elo_change(winner_elo integer, loser_elo integer, k_factor integer DEFAULT 32)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  expected_score DECIMAL;
  elo_change INTEGER;
BEGIN
  expected_score := 1.0 / (1.0 + POWER(10.0, (loser_elo - winner_elo) / 400.0));
  elo_change := ROUND(k_factor * (1.0 - expected_score));
  RETURN elo_change;
END;
$function$;