-- Add is_resolved column for resolving/archiving annotation threads
ALTER TABLE public.circuit_annotations
ADD COLUMN is_resolved BOOLEAN DEFAULT false;

-- Add resolved_at timestamp to track when it was resolved
ALTER TABLE public.circuit_annotations
ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add resolved_by to track who resolved it
ALTER TABLE public.circuit_annotations
ADD COLUMN resolved_by UUID DEFAULT NULL;

-- Create index for filtering resolved annotations
CREATE INDEX idx_circuit_annotations_resolved ON public.circuit_annotations(circuit_id, is_resolved, created_at DESC);