-- Create table for module assignments
CREATE TABLE public.module_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  assigned_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for student assignment progress
CREATE TABLE public.student_assignment_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.module_assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  score integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE public.module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignment_progress ENABLE ROW LEVEL SECURITY;

-- Teachers can view assignments in their classrooms
CREATE POLICY "Teachers can view their classroom assignments"
ON public.module_assignments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.classrooms
  WHERE classrooms.id = module_assignments.classroom_id
  AND classrooms.teacher_id = auth.uid()
));

-- Teachers can create assignments in their classrooms
CREATE POLICY "Teachers can create assignments"
ON public.module_assignments
FOR INSERT
WITH CHECK (
  auth.uid() = assigned_by AND
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE classrooms.id = module_assignments.classroom_id
    AND classrooms.teacher_id = auth.uid()
  )
);

-- Teachers can update assignments in their classrooms
CREATE POLICY "Teachers can update their assignments"
ON public.module_assignments
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.classrooms
  WHERE classrooms.id = module_assignments.classroom_id
  AND classrooms.teacher_id = auth.uid()
));

-- Teachers can delete assignments in their classrooms
CREATE POLICY "Teachers can delete their assignments"
ON public.module_assignments
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.classrooms
  WHERE classrooms.id = module_assignments.classroom_id
  AND classrooms.teacher_id = auth.uid()
));

-- Students can view their own assignment progress
CREATE POLICY "Students can view their assignment progress"
ON public.student_assignment_progress
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.students
  WHERE students.id = student_assignment_progress.student_id
  AND students.user_id = auth.uid()
));

-- Teachers can view progress in their classrooms
CREATE POLICY "Teachers can view assignment progress"
ON public.student_assignment_progress
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.module_assignments ma
  JOIN public.classrooms c ON c.id = ma.classroom_id
  WHERE ma.id = student_assignment_progress.assignment_id
  AND c.teacher_id = auth.uid()
));

-- Students can update their own progress
CREATE POLICY "Students can update their progress"
ON public.student_assignment_progress
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.students
  WHERE students.id = student_assignment_progress.student_id
  AND students.user_id = auth.uid()
));

-- System can insert progress records
CREATE POLICY "System can create progress records"
ON public.student_assignment_progress
FOR INSERT
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_module_assignments_classroom ON public.module_assignments(classroom_id);
CREATE INDEX idx_module_assignments_due_date ON public.module_assignments(due_date);
CREATE INDEX idx_student_assignment_progress_assignment ON public.student_assignment_progress(assignment_id);
CREATE INDEX idx_student_assignment_progress_student ON public.student_assignment_progress(student_id);

-- Add trigger for updated_at
CREATE TRIGGER update_module_assignments_updated_at
  BEFORE UPDATE ON public.module_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_student_assignment_progress_updated_at
  BEFORE UPDATE ON public.student_assignment_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();