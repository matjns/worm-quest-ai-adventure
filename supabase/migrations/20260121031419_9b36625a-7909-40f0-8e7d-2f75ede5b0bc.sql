-- Create table for entropy analysis results
CREATE TABLE public.learner_entropy_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  age_group TEXT NOT NULL DEFAULT 'middle',
  skill_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_modules TEXT[] NOT NULL DEFAULT '{}'::text[],
  failed_attempts JSONB NOT NULL DEFAULT '{}'::jsonb,
  average_completion_time INTEGER NOT NULL DEFAULT 0,
  streak_data JSONB NOT NULL DEFAULT '{"current": 0, "best": 0}'::jsonb,
  learning_style JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_analysis JSONB,
  calculated_entropy NUMERIC,
  skill_variance NUMERIC,
  scaffolding_level TEXT DEFAULT 'medium',
  difficulty_adjustment NUMERIC DEFAULT 0,
  content_adaptations TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.learner_entropy_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own entropy profile"
ON public.learner_entropy_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own entropy profile"
ON public.learner_entropy_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own entropy profile"
ON public.learner_entropy_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Teachers can view student profiles in their classrooms
CREATE POLICY "Teachers can view student entropy profiles"
ON public.learner_entropy_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classrooms c ON c.id = s.classroom_id
    WHERE s.user_id = learner_entropy_profiles.user_id
    AND c.teacher_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_learner_entropy_profiles_updated_at
BEFORE UPDATE ON public.learner_entropy_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();