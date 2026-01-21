-- Fix get_tier_from_elo function
CREATE OR REPLACE FUNCTION public.get_tier_from_elo(elo_rating integer)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
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
$function$;