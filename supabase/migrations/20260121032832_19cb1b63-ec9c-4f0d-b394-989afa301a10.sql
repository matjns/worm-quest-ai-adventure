-- Add policy for students to create their own assignment progress
CREATE POLICY "Students can create their own assignment progress"
ON public.student_assignment_progress
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students s
    JOIN module_assignments ma ON ma.classroom_id = s.classroom_id
    WHERE s.id = student_assignment_progress.student_id
      AND s.user_id = auth.uid()
      AND ma.id = student_assignment_progress.assignment_id
  )
);