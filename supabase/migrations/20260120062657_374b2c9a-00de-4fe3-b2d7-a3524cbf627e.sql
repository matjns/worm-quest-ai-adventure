-- Add join_code column to classrooms
ALTER TABLE public.classrooms 
ADD COLUMN join_code TEXT UNIQUE;

-- Create function to generate unique join codes
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate join codes for new classrooms
CREATE OR REPLACE FUNCTION public.set_classroom_join_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    -- Keep trying until we get a unique code
    LOOP
      NEW.join_code := public.generate_join_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classrooms WHERE join_code = NEW.join_code);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_classroom_join_code_trigger
BEFORE INSERT ON public.classrooms
FOR EACH ROW
EXECUTE FUNCTION public.set_classroom_join_code();

-- Generate join codes for existing classrooms
UPDATE public.classrooms 
SET join_code = public.generate_join_code()
WHERE join_code IS NULL;

-- Add policy to allow anyone to look up a classroom by join code (for joining)
CREATE POLICY "Anyone can lookup classroom by join code" 
ON public.classrooms 
FOR SELECT 
USING (join_code IS NOT NULL);

-- Update students table - add policy for students to view their own record
CREATE POLICY "Students can view their own record" 
ON public.students 
FOR SELECT 
USING (user_id = auth.uid());

-- Allow students to update their own progress
CREATE POLICY "Students can update their own progress" 
ON public.students 
FOR UPDATE 
USING (user_id = auth.uid());

-- Allow authenticated users to join a classroom (insert themselves as student)
CREATE POLICY "Authenticated users can join classrooms" 
ON public.students 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());