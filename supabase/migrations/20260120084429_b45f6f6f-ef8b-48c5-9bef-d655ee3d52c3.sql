-- Add parent_id column for threaded replies
ALTER TABLE public.circuit_annotations 
ADD COLUMN parent_id UUID REFERENCES public.circuit_annotations(id) ON DELETE CASCADE;

-- Create index for faster query of replies
CREATE INDEX idx_circuit_annotations_parent_id ON public.circuit_annotations(parent_id);

-- Add index for fetching annotations by circuit with replies
CREATE INDEX idx_circuit_annotations_circuit_parent ON public.circuit_annotations(circuit_id, parent_id);