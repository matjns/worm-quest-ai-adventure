-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can create tickets
CREATE POLICY "Authenticated users can create tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update all tickets
CREATE POLICY "Admins can update all tickets"
ON public.support_tickets
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete tickets
CREATE POLICY "Admins can delete tickets"
ON public.support_tickets
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create admin activity log
CREATE TABLE public.admin_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity log
CREATE POLICY "Admins can view activity log"
ON public.admin_activity_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert activity log
CREATE POLICY "Admins can insert activity log"
ON public.admin_activity_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- Create function to update user display name (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_display_name(
  target_user_id UUID,
  new_display_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Update the profile
  UPDATE public.profiles
  SET display_name = new_display_name, updated_at = now()
  WHERE user_id = target_user_id;

  -- Log the action
  INSERT INTO public.admin_activity_log (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'update_display_name', 'user', target_user_id, 
    jsonb_build_object('new_display_name', new_display_name));

  RETURN FOUND;
END;
$$;

-- Create function to get all users (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::TEXT,
    p.display_name,
    u.created_at,
    u.last_sign_in_at,
    EXISTS(SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'admin') as is_admin
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Create function to assign/remove admin role
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  target_user_id UUID,
  target_role app_role,
  should_add BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Prevent self-demotion
  IF target_user_id = auth.uid() AND NOT should_add THEN
    RAISE EXCEPTION 'Cannot remove your own admin role';
  END IF;

  IF should_add THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, target_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id AND role = target_role;
  END IF;

  -- Log the action
  INSERT INTO public.admin_activity_log (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), CASE WHEN should_add THEN 'add_role' ELSE 'remove_role' END, 
    'user', target_user_id, jsonb_build_object('role', target_role::text));

  RETURN TRUE;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();