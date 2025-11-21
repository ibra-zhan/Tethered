-- Tethered App - Initial Database Schema (Fixed)
-- This migration creates all the necessary tables, RLS policies, and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- STEP 1: CREATE ALL TABLES FIRST
-- ===========================================

-- USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAMILY CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.family_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_connection UNIQUE (user_id, connected_user_id),
  CONSTRAINT no_self_connection CHECK (user_id != connected_user_id)
);

-- DAILY PROMPTS TABLE
CREATE TABLE IF NOT EXISTS public.daily_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  date DATE NOT NULL UNIQUE,
  generated_by TEXT DEFAULT 'gemini',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'text', 'both')),
  image_url TEXT,
  mood TEXT CHECK (mood IN ('happy', 'anxious', 'tired', 'excited', 'sad', 'strong')),
  text TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prompt_id UUID REFERENCES public.daily_prompts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER STREAKS TABLE
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  streak_days INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
  last_check_in TIMESTAMP WITH TIME ZONE,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_check_ins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATION QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_post', 'connection_request', 'connection_accepted', 'streak_reminder', 'streak_milestone')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- PUSH TOKENS TABLE
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STEP 2: CREATE INDEXES
-- ===========================================

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);

-- family_connections indexes
CREATE INDEX IF NOT EXISTS idx_family_connections_user_id ON public.family_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_family_connections_connected_user_id ON public.family_connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_family_connections_status ON public.family_connections(status);

-- daily_prompts indexes
CREATE INDEX IF NOT EXISTS idx_daily_prompts_date ON public.daily_prompts(date);

-- posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON public.posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_posts_prompt_id ON public.posts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- user_streaks indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_streak_days ON public.user_streaks(streak_days DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_check_in ON public.user_streaks(last_check_in);

-- notification_queue indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created_at ON public.notification_queue(created_at);

-- push_tokens indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON public.push_tokens(token);

-- ===========================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- ===========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 4: CREATE RLS POLICIES
-- ===========================================

-- USER PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view family members profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_connections
      WHERE (user_id = auth.uid() AND connected_user_id = user_profiles.id AND status = 'accepted')
         OR (connected_user_id = auth.uid() AND user_id = user_profiles.id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- FAMILY CONNECTIONS POLICIES
CREATE POLICY "Users can view own connections"
  ON public.family_connections FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connections"
  ON public.family_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update received connections"
  ON public.family_connections FOR UPDATE
  USING (auth.uid() = connected_user_id);

-- DAILY PROMPTS POLICIES
CREATE POLICY "Authenticated users can view prompts"
  ON public.daily_prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert prompts"
  ON public.daily_prompts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- POSTS POLICIES
CREATE POLICY "Users can view own posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view family posts"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_connections
      WHERE (user_id = auth.uid() AND connected_user_id = posts.user_id AND status = 'accepted')
         OR (connected_user_id = auth.uid() AND user_id = posts.user_id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- USER STREAKS POLICIES
CREATE POLICY "Users can view own streak"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view family streaks"
  ON public.user_streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_connections
      WHERE (user_id = auth.uid() AND connected_user_id = user_streaks.user_id AND status = 'accepted')
         OR (connected_user_id = auth.uid() AND user_id = user_streaks.user_id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can insert own streak"
  ON public.user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- NOTIFICATION QUEUE POLICIES
CREATE POLICY "Users can view own notifications"
  ON public.notification_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
  ON public.notification_queue FOR INSERT
  TO service_role
  WITH CHECK (true);

-- PUSH TOKENS POLICIES
CREATE POLICY "Users can view own push tokens"
  ON public.push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
  ON public.push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
  ON public.push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON public.push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================================
-- STEP 5: CREATE FUNCTIONS
-- ===========================================

-- Function to automatically create user_streak when user_profile is created
CREATE OR REPLACE FUNCTION create_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_streaks (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- STEP 6: CREATE TRIGGERS
-- ===========================================

-- Trigger to create streak on profile creation
DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_streak();

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_family_connections_updated_at ON public.family_connections;
CREATE TRIGGER update_family_connections_updated_at
  BEFORE UPDATE ON public.family_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_push_tokens_updated_at ON public.push_tokens;
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- DONE
-- ===========================================

-- Storage buckets need to be created via Supabase Dashboard or CLI:
-- 1. Create 'avatars' bucket (public: false, file size limit: 5MB)
-- 2. Create 'posts' bucket (public: false, file size limit: 5MB)
-- Then run the storage policies from 20250120_storage_policies.sql
