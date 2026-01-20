-- Create function to notify students when an assignment is created
CREATE OR REPLACE FUNCTION public.notify_students_on_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  student_record RECORD;
  classroom_name TEXT;
  teacher_name TEXT;
  due_date_text TEXT;
BEGIN
  -- Get classroom name
  SELECT name INTO classroom_name
  FROM public.classrooms
  WHERE id = NEW.classroom_id;

  -- Get teacher name
  SELECT display_name INTO teacher_name
  FROM public.profiles
  WHERE user_id = NEW.assigned_by;

  -- Format due date if exists
  IF NEW.due_date IS NOT NULL THEN
    due_date_text := ' Due: ' || to_char(NEW.due_date::timestamp, 'Mon DD, YYYY');
  ELSE
    due_date_text := '';
  END IF;

  -- Create notification for each student in the classroom
  FOR student_record IN
    SELECT s.user_id
    FROM public.students s
    WHERE s.classroom_id = NEW.classroom_id
      AND s.user_id IS NOT NULL
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      actor_id
    ) VALUES (
      student_record.user_id,
      'assignment',
      'New Assignment: ' || NEW.title,
      COALESCE(teacher_name, 'Your teacher') || ' assigned "' || NEW.title || '" in ' || COALESCE(classroom_name, 'your classroom') || '.' || due_date_text,
      NEW.assigned_by
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on module_assignments
DROP TRIGGER IF EXISTS on_assignment_created ON public.module_assignments;
CREATE TRIGGER on_assignment_created
  AFTER INSERT ON public.module_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_students_on_assignment();