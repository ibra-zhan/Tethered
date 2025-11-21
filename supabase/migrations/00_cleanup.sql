-- Cleanup Script - Run this FIRST to remove any existing objects
-- WARNING: This will delete all data in these tables!

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view family members profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view own connections" ON public.family_connections;
DROP POLICY IF EXISTS "Users can create connections" ON public.family_connections;
DROP POLICY IF EXISTS "Users can update received connections" ON public.family_connections;

DROP POLICY IF EXISTS "Authenticated users can view prompts" ON public.daily_prompts;
DROP POLICY IF EXISTS "Service role can insert prompts" ON public.daily_prompts;

DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view family posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

DROP POLICY IF EXISTS "Users can view own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can view family streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update own streak" ON public.user_streaks;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notification_queue;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notification_queue;

DROP POLICY IF EXISTS "Users can view own push tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can insert own push tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can update own push tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can delete own push tokens" ON public.push_tokens;

-- Drop triggers
DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_family_connections_updated_at ON public.family_connections;
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
DROP TRIGGER IF EXISTS update_push_tokens_updated_at ON public.push_tokens;

-- Drop functions
DROP FUNCTION IF EXISTS create_user_streak();
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS calculate_streak_level(INTEGER);
DROP FUNCTION IF EXISTS update_streak_after_checkin(UUID);
DROP FUNCTION IF EXISTS check_and_reset_broken_streaks();
DROP FUNCTION IF EXISTS get_user_streak_stats(UUID);
DROP FUNCTION IF EXISTS create_streak_notifications();
DROP FUNCTION IF EXISTS update_streak_on_post();

-- Drop tables (CASCADE will drop all dependent objects)
DROP TABLE IF EXISTS public.push_tokens CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.user_streaks CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.daily_prompts CASCADE;
DROP TABLE IF EXISTS public.family_connections CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Note: This does NOT drop the auth.users table (managed by Supabase)
