-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'fork', 'feature')),
  title TEXT NOT NULL,
  message TEXT,
  circuit_id UUID REFERENCES public.shared_circuits(id) ON DELETE CASCADE,
  actor_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications (using service role or triggers)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to generate notification on like
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  circuit_owner_id UUID;
  circuit_title TEXT;
  actor_name TEXT;
BEGIN
  -- Get circuit owner and title
  SELECT user_id, title INTO circuit_owner_id, circuit_title
  FROM public.shared_circuits
  WHERE id = NEW.circuit_id;

  -- Don't notify if user liked their own circuit
  IF circuit_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get actor name
  SELECT display_name INTO actor_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, circuit_id, actor_id)
  VALUES (
    circuit_owner_id,
    'like',
    COALESCE(actor_name, 'Someone') || ' liked your circuit',
    '"' || circuit_title || '"',
    NEW.circuit_id,
    NEW.user_id
  );

  RETURN NEW;
END;
$$;

-- Create function to generate notification on comment
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  circuit_owner_id UUID;
  circuit_title TEXT;
  actor_name TEXT;
BEGIN
  -- Get circuit owner and title
  SELECT user_id, title INTO circuit_owner_id, circuit_title
  FROM public.shared_circuits
  WHERE id = NEW.circuit_id;

  -- Don't notify if user commented on their own circuit
  IF circuit_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get actor name
  SELECT display_name INTO actor_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, circuit_id, actor_id)
  VALUES (
    circuit_owner_id,
    'comment',
    COALESCE(actor_name, 'Someone') || ' commented on your circuit',
    LEFT(NEW.content, 100),
    NEW.circuit_id,
    NEW.user_id
  );

  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_like_create_notification
  AFTER INSERT ON public.circuit_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_like_notification();

CREATE TRIGGER on_comment_create_notification
  AFTER INSERT ON public.circuit_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_notification();