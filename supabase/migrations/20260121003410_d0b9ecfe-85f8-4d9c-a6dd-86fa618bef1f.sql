-- Create admin roles system for secure access control
-- Following security best practices: roles in separate table, not profiles

-- Create role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create pilot_feedback table for aggregated feedback
CREATE TABLE IF NOT EXISTS public.pilot_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  experiment_name text NOT NULL,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  ease_of_use text,
  did_achieve_goal boolean,
  what_worked_well text,
  what_could_improve text,
  bug_reports text,
  feature_requests text,
  scientific_accuracy integer CHECK (scientific_accuracy >= 1 AND scientific_accuracy <= 5),
  engagement_level integer CHECK (engagement_level >= 1 AND engagement_level <= 5),
  would_recommend boolean,
  categories text[],
  additional_notes text,
  session_duration_seconds integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback
CREATE POLICY "Anyone can submit feedback"
  ON public.pilot_feedback FOR INSERT
  WITH CHECK (true);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON public.pilot_feedback FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.pilot_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Create engagement_metrics table for real-time tracking
CREATE TABLE IF NOT EXISTS public.engagement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  page_path text,
  grade_level text,
  duration_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert metrics
CREATE POLICY "Anyone can insert metrics"
  ON public.engagement_metrics FOR INSERT
  WITH CHECK (true);

-- Admins can view all metrics
CREATE POLICY "Admins can view all metrics"
  ON public.engagement_metrics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.pilot_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.engagement_metrics;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_created_at ON public.engagement_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_metrics_event_type ON public.engagement_metrics(event_type);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_created_at ON public.pilot_feedback(created_at DESC);