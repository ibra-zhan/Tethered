-- Safe Cleanup Script - Won't fail if objects don't exist
-- This drops everything related to Tethered app

-- Drop tables with CASCADE (this will drop all policies, triggers, and constraints automatically)
DROP TABLE IF EXISTS public.push_tokens CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.user_streaks CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.daily_prompts CASCADE;
DROP TABLE IF EXISTS public.family_connections CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.create_user_streak() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_streak_level(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.update_streak_after_checkin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_and_reset_broken_streaks() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_streak_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.create_streak_notifications() CASCADE;
DROP FUNCTION IF EXISTS public.update_streak_on_post() CASCADE;

-- Verify cleanup
SELECT 'Cleanup complete!' as message;
