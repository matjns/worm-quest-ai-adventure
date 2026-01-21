-- Fix 2 security vulnerabilities:
-- 1. Notification type constraint missing valid values
-- 2. Assignment progress unrestricted insert

-- =====================================================
-- FIX 1: Update notification type constraint
-- =====================================================

-- Drop existing constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add updated constraint with all valid notification types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('like', 'comment', 'fork', 'feature', 'assignment', 'mention', 'reply', 'resolved'));

-- =====================================================
-- FIX 2: Fix assignment progress INSERT policy
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create progress records" ON public.student_assignment_progress;

-- Teachers can create progress records for assignments in their classrooms
CREATE POLICY "Teachers can create student progress"
  ON public.student_assignment_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM module_assignments ma
      JOIN classrooms c ON c.id = ma.classroom_id
      WHERE ma.id = student_assignment_progress.assignment_id
      AND c.teacher_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM students s
      JOIN module_assignments ma ON ma.classroom_id = s.classroom_id
      WHERE s.id = student_assignment_progress.student_id
      AND ma.id = student_assignment_progress.assignment_id
    )
  );