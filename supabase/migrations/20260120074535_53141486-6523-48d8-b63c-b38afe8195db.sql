-- Enable realtime for circuit_likes and circuit_comments tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.circuit_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circuit_comments;