-- Create circuit_versions table to store version history
CREATE TABLE public.circuit_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circuit_id UUID NOT NULL REFERENCES public.shared_circuits(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  circuit_data JSONB NOT NULL,
  neurons_used TEXT[] NOT NULL,
  behavior TEXT NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create unique constraint on circuit_id and version_number
ALTER TABLE public.circuit_versions ADD CONSTRAINT unique_circuit_version UNIQUE (circuit_id, version_number);

-- Create index for faster lookups
CREATE INDEX idx_circuit_versions_circuit_id ON public.circuit_versions(circuit_id);
CREATE INDEX idx_circuit_versions_created_at ON public.circuit_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.circuit_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Circuit versions are viewable by everyone"
ON public.circuit_versions
FOR SELECT
USING (true);

CREATE POLICY "Circuit owners can create versions"
ON public.circuit_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shared_circuits
    WHERE id = circuit_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Circuit owners can delete versions"
ON public.circuit_versions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.shared_circuits
    WHERE id = circuit_id AND user_id = auth.uid()
  )
);

-- Function to automatically create a version when a circuit is updated
CREATE OR REPLACE FUNCTION public.create_circuit_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM public.circuit_versions
  WHERE circuit_id = OLD.id;

  -- Only create version if circuit_data actually changed
  IF OLD.circuit_data IS DISTINCT FROM NEW.circuit_data THEN
    INSERT INTO public.circuit_versions (
      circuit_id,
      version_number,
      title,
      description,
      circuit_data,
      neurons_used,
      behavior,
      change_summary,
      created_by
    ) VALUES (
      OLD.id,
      next_version,
      OLD.title,
      OLD.description,
      OLD.circuit_data,
      OLD.neurons_used,
      OLD.behavior,
      'Auto-saved before update',
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-save versions on update
CREATE TRIGGER save_circuit_version_on_update
BEFORE UPDATE ON public.shared_circuits
FOR EACH ROW
EXECUTE FUNCTION public.create_circuit_version();

-- Function to create initial version when circuit is first created
CREATE OR REPLACE FUNCTION public.create_initial_circuit_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.circuit_versions (
    circuit_id,
    version_number,
    title,
    description,
    circuit_data,
    neurons_used,
    behavior,
    change_summary,
    created_by
  ) VALUES (
    NEW.id,
    1,
    NEW.title,
    NEW.description,
    NEW.circuit_data,
    NEW.neurons_used,
    NEW.behavior,
    'Initial version',
    NEW.user_id
  );

  RETURN NEW;
END;
$$;

-- Create trigger for initial version
CREATE TRIGGER save_initial_circuit_version
AFTER INSERT ON public.shared_circuits
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_circuit_version();