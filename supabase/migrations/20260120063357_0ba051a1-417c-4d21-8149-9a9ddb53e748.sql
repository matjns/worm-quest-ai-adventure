-- Enable realtime for students table to support live progress updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;