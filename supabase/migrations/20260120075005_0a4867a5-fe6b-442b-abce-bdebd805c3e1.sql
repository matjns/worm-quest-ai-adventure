-- Add notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_likes BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_forks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_weekly_digest BOOLEAN DEFAULT false;