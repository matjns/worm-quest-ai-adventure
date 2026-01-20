-- Fix 3 security vulnerabilities:
-- 1. notifications_unrestricted_insert - Prevent notification impersonation
-- 2. student_submissions_insert - Restrict submission creation
-- 3. analytics_unrestricted_modification - Remove direct analytics modification

-- =====================================================
-- FIX 1: Notifications - Prevent impersonation attacks
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a policy that requires actor_id to match the authenticated user
-- This prevents users from creating notifications pretending to be someone else
CREATE POLICY "Users can create notifications as themselves"
  ON public.notifications FOR INSERT
  WITH CHECK (actor_id = auth.uid());

-- Also create a SECURITY DEFINER function for system-generated notifications (from triggers)
CREATE OR REPLACE FUNCTION public.create_system_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text DEFAULT NULL,
  p_circuit_id uuid DEFAULT NULL,
  p_actor_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, circuit_id, actor_id, read)
  VALUES (p_user_id, p_type, p_title, p_message, p_circuit_id, p_actor_id, false)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- =====================================================
-- FIX 2: Student Submissions - Proper access control
-- =====================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow submission creation" ON public.student_submissions;

-- Students can create their own submissions
CREATE POLICY "Students can create their submissions"
  ON public.student_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = student_submissions.student_id 
      AND students.user_id = auth.uid()
    )
  );

-- Teachers can create submissions for students in their classrooms
CREATE POLICY "Teachers can create submissions for their students"
  ON public.student_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = student_submissions.classroom_id
      AND classrooms.teacher_id = auth.uid()
    )
  );

-- =====================================================
-- FIX 3: Classroom Analytics - Remove direct modification
-- =====================================================

-- Drop overly permissive policies - analytics should only be written by triggers/functions
DROP POLICY IF EXISTS "System can create analytics" ON public.classroom_analytics;
DROP POLICY IF EXISTS "System can update analytics" ON public.classroom_analytics;

-- Create a SECURITY DEFINER function for updating analytics (used by triggers/edge functions)
CREATE OR REPLACE FUNCTION public.upsert_classroom_analytics(
  p_classroom_id uuid,
  p_active_students integer DEFAULT 0,
  p_missions_completed integer DEFAULT 0,
  p_avg_accuracy numeric DEFAULT 0,
  p_total_xp_earned integer DEFAULT 0,
  p_community_contributions integer DEFAULT 0,
  p_ai_interactions integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_id uuid;
BEGIN
  -- Verify the caller is the teacher of the classroom
  IF NOT EXISTS (
    SELECT 1 FROM classrooms 
    WHERE id = p_classroom_id 
    AND teacher_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to update analytics for this classroom';
  END IF;

  INSERT INTO public.classroom_analytics (
    classroom_id, date, active_students, missions_completed, 
    avg_accuracy, total_xp_earned, community_contributions, ai_interactions
  )
  VALUES (
    p_classroom_id, CURRENT_DATE, p_active_students, p_missions_completed,
    p_avg_accuracy, p_total_xp_earned, p_community_contributions, p_ai_interactions
  )
  ON CONFLICT (classroom_id, date) 
  DO UPDATE SET
    active_students = classroom_analytics.active_students + EXCLUDED.active_students,
    missions_completed = classroom_analytics.missions_completed + EXCLUDED.missions_completed,
    avg_accuracy = EXCLUDED.avg_accuracy,
    total_xp_earned = classroom_analytics.total_xp_earned + EXCLUDED.total_xp_earned,
    community_contributions = classroom_analytics.community_contributions + EXCLUDED.community_contributions,
    ai_interactions = classroom_analytics.ai_interactions + EXCLUDED.ai_interactions
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;

-- Add unique constraint for upsert if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'classroom_analytics_classroom_date_unique'
  ) THEN
    ALTER TABLE public.classroom_analytics 
    ADD CONSTRAINT classroom_analytics_classroom_date_unique 
    UNIQUE (classroom_id, date);
  END IF;
END $$;