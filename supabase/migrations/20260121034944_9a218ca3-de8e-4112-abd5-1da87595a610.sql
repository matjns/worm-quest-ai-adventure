-- Create parent-student linking table
CREATE TABLE public.parent_student_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'parent',
  verified BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);

-- Enable RLS
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- Parents can view their own links
CREATE POLICY "Parents can view their links"
ON public.parent_student_links
FOR SELECT
USING (auth.uid() = parent_id);

-- Parents can create links (via invite code)
CREATE POLICY "Parents can create links"
ON public.parent_student_links
FOR INSERT
WITH CHECK (auth.uid() = parent_id);

-- Teachers can create invite links for their students
CREATE POLICY "Teachers can create parent invites"
ON public.parent_student_links
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classrooms c ON c.id = s.classroom_id
    WHERE s.id = parent_student_links.student_id
    AND c.teacher_id = auth.uid()
  )
);

-- Teachers can view links for their students
CREATE POLICY "Teachers can view student parent links"
ON public.parent_student_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN classrooms c ON c.id = s.classroom_id
    WHERE s.id = parent_student_links.student_id
    AND c.teacher_id = auth.uid()
  )
);

-- Add RLS policies for parents to view intervention data
CREATE POLICY "Parents can view their child intervention plans"
ON public.intervention_plans
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parent_student_links psl
    WHERE psl.parent_id = auth.uid()
    AND psl.student_id = intervention_plans.student_id
    AND psl.verified = true
  )
);

CREATE POLICY "Parents can view their child intervention progress"
ON public.intervention_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM intervention_plans ip
    JOIN parent_student_links psl ON psl.student_id = ip.student_id
    WHERE ip.id = intervention_progress.plan_id
    AND psl.parent_id = auth.uid()
    AND psl.verified = true
  )
);

CREATE POLICY "Parents can view their child intervention snapshots"
ON public.intervention_snapshots
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM intervention_plans ip
    JOIN parent_student_links psl ON psl.student_id = ip.student_id
    WHERE ip.id = intervention_snapshots.plan_id
    AND psl.parent_id = auth.uid()
    AND psl.verified = true
  )
);

-- Parents can view their linked students
CREATE POLICY "Parents can view their linked students"
ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM parent_student_links psl
    WHERE psl.parent_id = auth.uid()
    AND psl.student_id = students.id
    AND psl.verified = true
  )
);

-- Function to generate parent invite code
CREATE OR REPLACE FUNCTION public.generate_parent_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  code := upper(substring(md5(random()::text) from 1 for 8));
  RETURN code;
END;
$$;