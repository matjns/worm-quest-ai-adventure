-- Create intervention_plans table
CREATE TABLE public.intervention_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  classroom_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  learning_style TEXT,
  initial_entropy NUMERIC,
  target_entropy NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create intervention_progress table to track progress on each step
CREATE TABLE public.intervention_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.intervention_plans(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  teacher_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create intervention_snapshots to track entropy over time
CREATE TABLE public.intervention_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.intervention_plans(id) ON DELETE CASCADE,
  entropy_value NUMERIC NOT NULL,
  steps_completed INTEGER NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intervention_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for intervention_plans
CREATE POLICY "Teachers can create intervention plans"
ON public.intervention_plans
FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can view their intervention plans"
ON public.intervention_plans
FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their intervention plans"
ON public.intervention_plans
FOR UPDATE
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their intervention plans"
ON public.intervention_plans
FOR DELETE
USING (auth.uid() = teacher_id);

-- RLS policies for intervention_progress
CREATE POLICY "Teachers can manage progress on their plans"
ON public.intervention_progress
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.intervention_plans
    WHERE id = intervention_progress.plan_id
    AND teacher_id = auth.uid()
  )
);

-- RLS policies for intervention_snapshots
CREATE POLICY "Teachers can manage snapshots on their plans"
ON public.intervention_snapshots
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.intervention_plans
    WHERE id = intervention_snapshots.plan_id
    AND teacher_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_intervention_plans_updated_at
BEFORE UPDATE ON public.intervention_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intervention_progress_updated_at
BEFORE UPDATE ON public.intervention_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();