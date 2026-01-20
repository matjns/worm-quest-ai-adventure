-- Add is_pinned column for pinning important annotations
ALTER TABLE public.circuit_annotations 
ADD COLUMN is_pinned BOOLEAN DEFAULT false;

-- Create index for faster sorting by pinned status
CREATE INDEX idx_circuit_annotations_pinned ON public.circuit_annotations(circuit_id, is_pinned DESC, created_at DESC);