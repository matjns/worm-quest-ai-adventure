-- Create circuit_annotations table for neuron-specific notes
CREATE TABLE public.circuit_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circuit_id UUID NOT NULL REFERENCES public.shared_circuits(id) ON DELETE CASCADE,
  neuron_id TEXT NOT NULL,
  content TEXT NOT NULL,
  x_offset INTEGER DEFAULT 0,
  y_offset INTEGER DEFAULT 0,
  color TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX idx_circuit_annotations_circuit_id ON public.circuit_annotations(circuit_id);
CREATE INDEX idx_circuit_annotations_user_id ON public.circuit_annotations(user_id);

-- Enable RLS
ALTER TABLE public.circuit_annotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Annotations are viewable by everyone"
ON public.circuit_annotations
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create annotations on any circuit"
ON public.circuit_annotations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annotations"
ON public.circuit_annotations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annotations"
ON public.circuit_annotations
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_circuit_annotations_updated_at
BEFORE UPDATE ON public.circuit_annotations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();