-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  total_likes INTEGER DEFAULT 0,
  circuits_shared INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shared circuits table
CREATE TABLE public.shared_circuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  circuit_data JSONB NOT NULL,
  behavior TEXT NOT NULL,
  neurons_used TEXT[] NOT NULL,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  github_pr_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create likes table (many-to-many between users and circuits)
CREATE TABLE public.circuit_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circuit_id UUID NOT NULL REFERENCES public.shared_circuits(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, circuit_id)
);

-- Create comments table
CREATE TABLE public.circuit_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circuit_id UUID NOT NULL REFERENCES public.shared_circuits(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Shared circuits policies
CREATE POLICY "Shared circuits are viewable by everyone"
  ON public.shared_circuits FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create circuits"
  ON public.shared_circuits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own circuits"
  ON public.shared_circuits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own circuits"
  ON public.shared_circuits FOR DELETE
  USING (auth.uid() = user_id);

-- Circuit likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON public.circuit_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like circuits"
  ON public.circuit_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike (delete their likes)"
  ON public.circuit_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.circuit_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.circuit_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.circuit_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.circuit_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_shared_circuits_updated_at
  BEFORE UPDATE ON public.shared_circuits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.circuit_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment likes count
CREATE OR REPLACE FUNCTION public.handle_like_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.shared_circuits
  SET likes_count = likes_count + 1
  WHERE id = NEW.circuit_id;
  
  UPDATE public.profiles
  SET total_likes = total_likes + 1
  WHERE user_id = (SELECT user_id FROM public.shared_circuits WHERE id = NEW.circuit_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION public.handle_like_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.shared_circuits
  SET likes_count = likes_count - 1
  WHERE id = OLD.circuit_id;
  
  UPDATE public.profiles
  SET total_likes = total_likes - 1
  WHERE user_id = (SELECT user_id FROM public.shared_circuits WHERE id = OLD.circuit_id);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for likes count
CREATE TRIGGER on_like_insert
  AFTER INSERT ON public.circuit_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_insert();

CREATE TRIGGER on_like_delete
  AFTER DELETE ON public.circuit_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_delete();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();