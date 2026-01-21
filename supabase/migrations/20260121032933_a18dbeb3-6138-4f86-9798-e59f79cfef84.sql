-- Fix engagement_metrics: require user_id to match auth.uid() if provided
DROP POLICY IF EXISTS "Anyone can insert metrics" ON public.engagement_metrics;
CREATE POLICY "Users can insert their own metrics"
ON public.engagement_metrics
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

-- Fix classroom_sponsorships: require sponsor_id to match auth.uid() if provided
DROP POLICY IF EXISTS "Anyone can create sponsorships" ON public.classroom_sponsorships;
CREATE POLICY "Users can create sponsorships"
ON public.classroom_sponsorships
FOR INSERT
WITH CHECK (
  sponsor_id IS NULL OR sponsor_id = auth.uid()
);

-- Fix pilot_feedback: require user_id to match auth.uid() if provided
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.pilot_feedback;
CREATE POLICY "Users can submit their own feedback"
ON public.pilot_feedback
FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);