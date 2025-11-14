-- ============================================
-- FIX: Row Level Security Policies
-- Run this in Supabase SQL Editor if you're getting RLS errors
-- ============================================

-- First, drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Now create the correct policies
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'user_profiles';
