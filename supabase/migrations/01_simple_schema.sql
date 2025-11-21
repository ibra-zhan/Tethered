-- Tethered App - Simple Database Schema
-- Run 00_cleanup.sql first if you have existing objects

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- CREATE TABLES
-- ===========================================

-- User Profiles
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Connections
CREATE TABLE public.family_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);

-- Daily Prompts
CREATE TABLE public.daily_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  date DATE NOT NULL UNIQUE,
  generated_by TEXT DEFAULT 'gemini',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'text', 'both')),
  image_url TEXT,
  mood TEXT CHECK (mood IN ('happy', 'anxious', 'tired', 'excited', 'sad', 'strong')),
  text TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  prompt_id UUID REFERENCES public.daily_prompts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Streaks
CREATE TABLE public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  streak_days INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
  last_check_in TIMESTAMPTZ,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_check_ins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Queue
CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_post', 'connection_request', 'connection_accepted', 'streak_reminder', 'streak_milestone')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Push Tokens
CREATE TABLE public.push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CREATE INDEXES
-- ===========================================

CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_family_connections_user_id ON public.family_connections(user_id);
CREATE INDEX idx_family_connections_connected_user_id ON public.family_connections(connected_user_id);
CREATE INDEX idx_family_connections_status ON public.family_connections(status);
CREATE INDEX idx_daily_prompts_date ON public.daily_prompts(date);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_timestamp ON public.posts(timestamp DESC);
CREATE INDEX idx_posts_prompt_id ON public.posts(prompt_id);
CREATE INDEX idx_user_streaks_streak_days ON public.user_streaks(streak_days DESC);
CREATE INDEX idx_user_streaks_last_check_in ON public.user_streaks(last_check_in);
CREATE INDEX idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);

-- ===========================================
-- ENABLE RLS
-- ===========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CREATE RLS POLICIES
-- ===========================================

-- user_profiles policies
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- family_connections policies
CREATE POLICY "Users can view own connections"
  ON public.family_connections FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connections"
  ON public.family_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update received connections"
  ON public.family_connections FOR UPDATE
  USING (auth.uid() = connected_user_id);

-- daily_prompts policies
CREATE POLICY "Anyone can view prompts"
  ON public.daily_prompts FOR SELECT
  USING (true);

-- posts policies
CREATE POLICY "Users can view own posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- user_streaks policies
CREATE POLICY "Users can view own streak"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON public.user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- notification_queue policies
CREATE POLICY "Users can view own notifications"
  ON public.notification_queue FOR SELECT
  USING (auth.uid() = user_id);

-- push_tokens policies
CREATE POLICY "Users can manage own tokens"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id);

-- ===========================================
-- CREATE FUNCTIONS
-- ===========================================

-- Auto-create streak for new users
CREATE FUNCTION public.create_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update timestamp
CREATE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- CREATE TRIGGERS
-- ===========================================

CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_streak();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_family_connections_updated_at
  BEFORE UPDATE ON public.family_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
