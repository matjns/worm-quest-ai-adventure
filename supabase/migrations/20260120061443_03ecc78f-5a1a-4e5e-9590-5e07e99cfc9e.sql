-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create classrooms table for teacher management
CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  school_name TEXT,
  school_district TEXT,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create students table (linked to classrooms)
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  user_id UUID,
  display_name TEXT NOT NULL,
  progress_data JSONB DEFAULT '{"missions_completed": 0, "total_xp": 0, "accuracy": 0, "strengths": [], "weaknesses": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_plans table for AI-generated lessons
CREATE TABLE public.lesson_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  standards TEXT[] DEFAULT '{}',
  duration_minutes INTEGER DEFAULT 45,
  lesson_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_generated BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft',
  week_number INTEGER,
  day_of_week INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_submissions for grading
CREATE TABLE public.student_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lesson_plans(id) ON DELETE SET NULL,
  mission_id TEXT,
  submission_type TEXT NOT NULL,
  submission_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_feedback JSONB,
  score INTEGER,
  graded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  total_donated_cents INTEGER DEFAULT 0,
  classrooms_sponsored INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classroom_sponsorships for per-classroom donations
CREATE TABLE public.classroom_sponsorships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE SET NULL,
  donor_name TEXT,
  donor_email TEXT,
  amount_cents INTEGER NOT NULL,
  compute_credits_granted INTEGER DEFAULT 0,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classroom_analytics for ExO metrics
CREATE TABLE public.classroom_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_students INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  avg_accuracy NUMERIC(5,2) DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  community_contributions INTEGER DEFAULT 0,
  ai_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_analytics ENABLE ROW LEVEL SECURITY;

-- Classrooms: Teachers can manage their own
CREATE POLICY "Teachers can view their classrooms" ON public.classrooms FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create classrooms" ON public.classrooms FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their classrooms" ON public.classrooms FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their classrooms" ON public.classrooms FOR DELETE USING (auth.uid() = teacher_id);

-- Students: Teachers can manage students in their classrooms
CREATE POLICY "Teachers can view students in their classrooms" ON public.students FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE classrooms.id = students.classroom_id AND classrooms.teacher_id = auth.uid()));
CREATE POLICY "Teachers can add students" ON public.students FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.classrooms WHERE classrooms.id = students.classroom_id AND classrooms.teacher_id = auth.uid()));
CREATE POLICY "Teachers can update students" ON public.students FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE classrooms.id = students.classroom_id AND classrooms.teacher_id = auth.uid()));
CREATE POLICY "Teachers can delete students" ON public.students FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE classrooms.id = students.classroom_id AND classrooms.teacher_id = auth.uid()));

-- Lesson Plans: Teachers manage their own
CREATE POLICY "Teachers can view their lesson plans" ON public.lesson_plans FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can create lesson plans" ON public.lesson_plans FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their lesson plans" ON public.lesson_plans FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their lesson plans" ON public.lesson_plans FOR DELETE USING (auth.uid() = teacher_id);

-- Student Submissions: Teachers can view/manage for their classrooms
CREATE POLICY "Teachers can view submissions in their classrooms" ON public.student_submissions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE classrooms.id = student_submissions.classroom_id AND classrooms.teacher_id = auth.uid()));
CREATE POLICY "Allow submission creation" ON public.student_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Teachers can update submissions" ON public.student_submissions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE classrooms.id = student_submissions.classroom_id AND classrooms.teacher_id = auth.uid()));

-- Sponsors: Public read
CREATE POLICY "Anyone can view active sponsors" ON public.sponsors FOR SELECT USING (is_active = true);

-- Sponsorships: Teachers can view their classroom sponsorships
CREATE POLICY "Teachers can view their classroom sponsorships" ON public.classroom_sponsorships FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE classrooms.id = classroom_sponsorships.classroom_id AND classrooms.teacher_id = auth.uid()));
CREATE POLICY "Anyone can create sponsorships" ON public.classroom_sponsorships FOR INSERT WITH CHECK (true);

-- Analytics: Teachers can view their classroom analytics
CREATE POLICY "Teachers can view their classroom analytics" ON public.classroom_analytics FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.classrooms WHERE classrooms.id = classroom_analytics.classroom_id AND classrooms.teacher_id = auth.uid()));
CREATE POLICY "System can create analytics" ON public.classroom_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update analytics" ON public.classroom_analytics FOR UPDATE USING (true);

-- Add triggers for updating timestamps
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lesson_plans_updated_at BEFORE UPDATE ON public.lesson_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();