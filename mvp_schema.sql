-- ============================================
-- Tethered MVP Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- User Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'parent')),

  -- Student-specific
  college_name TEXT,
  family_code TEXT UNIQUE,  -- 6-character code for parent pairing

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Connections (1:1 parent-student)
CREATE TABLE IF NOT EXISTS family_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

-- Messages (check-ins, prompt responses, replies)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_connection_id UUID NOT NULL REFERENCES family_connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('checkin', 'prompt_response', 'reply')),
  prompt_id INTEGER CHECK (prompt_id BETWEEN 1 AND 10 OR prompt_id IS NULL),
  emoji TEXT,
  message_text TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streaks (engagement gamification)
CREATE TABLE IF NOT EXISTS streaks (
  family_connection_id UUID PRIMARY KEY REFERENCES family_connections(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_interaction_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_family_connection ON messages(family_connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_family_code ON user_profiles(family_code);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- User Profiles: View own + family member
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view family member profile"
  ON user_profiles FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM family_connections WHERE parent_id = auth.uid()
      UNION
      SELECT parent_id FROM family_connections WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Family Connections: View and create own connections
CREATE POLICY "Users can view their connections"
  ON family_connections FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = parent_id);

CREATE POLICY "Parents can create connections"
  ON family_connections FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can delete their connections"
  ON family_connections FOR DELETE
  USING (auth.uid() = student_id OR auth.uid() = parent_id);

-- Messages: View and create family messages
CREATE POLICY "Users can view family messages"
  ON messages FOR SELECT
  USING (
    family_connection_id IN (
      SELECT id FROM family_connections
      WHERE student_id = auth.uid() OR parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their family"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    family_connection_id IN (
      SELECT id FROM family_connections
      WHERE student_id = auth.uid() OR parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());

-- Streaks: View and update own family streak
CREATE POLICY "Users can view their streaks"
  ON streaks FOR SELECT
  USING (
    family_connection_id IN (
      SELECT id FROM family_connections
      WHERE student_id = auth.uid() OR parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their streaks"
  ON streaks FOR UPDATE
  USING (
    family_connection_id IN (
      SELECT id FROM family_connections
      WHERE student_id = auth.uid() OR parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert streaks for their connections"
  ON streaks FOR INSERT
  WITH CHECK (
    family_connection_id IN (
      SELECT id FROM family_connections
      WHERE student_id = auth.uid() OR parent_id = auth.uid()
    )
  );

-- ============================================
-- Storage Bucket Setup (Run in Supabase Dashboard)
-- ============================================

-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket called "checkin-photos"
-- 3. Make it public
-- 4. Set the following policies:
--
-- SELECT (view photos):
--   Allow all authenticated users
--
-- INSERT (upload photos):
--   WITH CHECK (bucket_id = 'checkin-photos' AND auth.role() = 'authenticated')
--
-- DELETE (delete photos):
--   USING (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- ============================================
-- Complete! Your database is ready.
-- ============================================
