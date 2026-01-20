-- Create annotation_reactions table for emoji reactions
CREATE TABLE public.annotation_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  annotation_id UUID NOT NULL REFERENCES public.circuit_annotations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Unique constraint: one reaction per user per annotation per emoji
  UNIQUE(annotation_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.annotation_reactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reactions are viewable by everyone"
ON public.annotation_reactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add reactions"
ON public.annotation_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
ON public.annotation_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_annotation_reactions_annotation ON public.annotation_reactions(annotation_id);
CREATE INDEX idx_annotation_reactions_user ON public.annotation_reactions(user_id);