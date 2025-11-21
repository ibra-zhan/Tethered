-- Tethered App - Streak Management Functions
-- Functions to calculate, update, and manage user streaks

-- ===========================================
-- FUNCTION: Calculate Streak Level
-- ===========================================
CREATE OR REPLACE FUNCTION calculate_streak_level(streak_days INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level 1: Candle (0-6 days)
  -- Level 2: Steady (7-29 days)
  -- Level 3: Bonfire (30-99 days)
  -- Level 4: Eternal (100+ days)

  IF streak_days < 7 THEN
    RETURN 1;
  ELSIF streak_days < 30 THEN
    RETURN 2;
  ELSIF streak_days < 100 THEN
    RETURN 3;
  ELSE
    RETURN 4;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===========================================
-- FUNCTION: Update Streak After Check-in
-- ===========================================
CREATE OR REPLACE FUNCTION update_streak_after_checkin(p_user_id UUID)
RETURNS TABLE(
  new_streak_days INTEGER,
  new_level INTEGER,
  is_new_milestone BOOLEAN
) AS $$
DECLARE
  v_last_check_in TIMESTAMP WITH TIME ZONE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_total_check_ins INTEGER;
  v_hours_since_last NUMERIC;
  v_new_streak INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
BEGIN
  -- Get current streak data
  SELECT
    last_check_in,
    streak_days,
    longest_streak,
    total_check_ins,
    level
  INTO
    v_last_check_in,
    v_current_streak,
    v_longest_streak,
    v_total_check_ins,
    v_old_level
  FROM public.user_streaks
  WHERE user_id = p_user_id;

  -- Calculate hours since last check-in
  IF v_last_check_in IS NOT NULL THEN
    v_hours_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_check_in)) / 3600;
  ELSE
    v_hours_since_last := NULL;
  END IF;

  -- Determine new streak count
  IF v_last_check_in IS NULL OR v_hours_since_last > 48 THEN
    -- First check-in or streak broken (more than 48 hours)
    v_new_streak := 1;
  ELSIF v_hours_since_last <= 24 THEN
    -- Within 24 hours, same day check-in (no increment)
    v_new_streak := v_current_streak;
  ELSE
    -- Between 24-48 hours, increment streak
    v_new_streak := v_current_streak + 1;
  END IF;

  -- Calculate new level
  v_new_level := calculate_streak_level(v_new_streak);

  -- Update longest streak if necessary
  IF v_new_streak > v_longest_streak THEN
    v_longest_streak := v_new_streak;
  END IF;

  -- Update user_streaks table
  UPDATE public.user_streaks
  SET
    streak_days = v_new_streak,
    level = v_new_level,
    last_check_in = NOW(),
    longest_streak = v_longest_streak,
    total_check_ins = v_total_check_ins + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Return results
  RETURN QUERY SELECT
    v_new_streak,
    v_new_level,
    (v_new_level > v_old_level) AS is_new_milestone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- FUNCTION: Check and Reset Broken Streaks
-- ===========================================
CREATE OR REPLACE FUNCTION check_and_reset_broken_streaks()
RETURNS TABLE(
  user_id UUID,
  old_streak INTEGER,
  was_reset BOOLEAN
) AS $$
BEGIN
  -- Find users whose last check-in was more than 48 hours ago
  -- and reset their streaks
  RETURN QUERY
  WITH broken_streaks AS (
    SELECT
      us.user_id,
      us.streak_days AS old_streak_days,
      us.last_check_in
    FROM public.user_streaks us
    WHERE us.last_check_in IS NOT NULL
      AND us.streak_days > 0
      AND EXTRACT(EPOCH FROM (NOW() - us.last_check_in)) / 3600 > 48
  )
  UPDATE public.user_streaks us
  SET
    streak_days = 0,
    level = 1,
    updated_at = NOW()
  FROM broken_streaks bs
  WHERE us.user_id = bs.user_id
  RETURNING us.user_id, bs.old_streak_days AS old_streak, true AS was_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- FUNCTION: Get User Streak Stats
-- ===========================================
CREATE OR REPLACE FUNCTION get_user_streak_stats(p_user_id UUID)
RETURNS TABLE(
  current_streak INTEGER,
  level INTEGER,
  longest_streak INTEGER,
  total_check_ins INTEGER,
  hours_until_break NUMERIC,
  can_check_in_today BOOLEAN
) AS $$
DECLARE
  v_last_check_in TIMESTAMP WITH TIME ZONE;
  v_hours_since_last NUMERIC;
BEGIN
  SELECT last_check_in INTO v_last_check_in
  FROM public.user_streaks
  WHERE user_id = p_user_id;

  IF v_last_check_in IS NOT NULL THEN
    v_hours_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_check_in)) / 3600;
  ELSE
    v_hours_since_last := NULL;
  END IF;

  RETURN QUERY
  SELECT
    us.streak_days AS current_streak,
    us.level,
    us.longest_streak,
    us.total_check_ins,
    CASE
      WHEN v_last_check_in IS NULL THEN NULL
      ELSE GREATEST(0, 48 - v_hours_since_last)
    END AS hours_until_break,
    CASE
      WHEN v_last_check_in IS NULL THEN true
      WHEN v_hours_since_last > 24 THEN true
      ELSE false
    END AS can_check_in_today
  FROM public.user_streaks us
  WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- FUNCTION: Trigger Streak Notifications
-- ===========================================
CREATE OR REPLACE FUNCTION create_streak_notifications()
RETURNS TRIGGER AS $$
DECLARE
  v_milestone_text TEXT;
BEGIN
  -- Check if this is a milestone (7, 30, 100 days)
  IF NEW.streak_days IN (7, 30, 100) AND NEW.streak_days != OLD.streak_days THEN
    -- Create milestone notification
    CASE NEW.streak_days
      WHEN 7 THEN v_milestone_text := 'Week streak! You''re on fire! 🔥';
      WHEN 30 THEN v_milestone_text := 'Month streak! Incredible dedication! 🎉';
      WHEN 100 THEN v_milestone_text := '100 day streak! You''re a legend! 🏆';
    END CASE;

    INSERT INTO public.notification_queue (user_id, type, title, body, data)
    VALUES (
      NEW.user_id,
      'streak_milestone',
      'Streak Milestone!',
      v_milestone_text,
      jsonb_build_object('streak_days', NEW.streak_days, 'level', NEW.level)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for streak milestone notifications
DROP TRIGGER IF EXISTS on_streak_milestone ON public.user_streaks;
CREATE TRIGGER on_streak_milestone
  AFTER UPDATE ON public.user_streaks
  FOR EACH ROW
  WHEN (NEW.streak_days != OLD.streak_days)
  EXECUTE FUNCTION create_streak_notifications();

-- ===========================================
-- FUNCTION: Trigger to update streak on new post
-- ===========================================
CREATE OR REPLACE FUNCTION update_streak_on_post()
RETURNS TRIGGER AS $$
DECLARE
  v_streak_result RECORD;
BEGIN
  -- Update streak when new post is created
  SELECT * INTO v_streak_result
  FROM update_streak_after_checkin(NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak when post is created
DROP TRIGGER IF EXISTS on_post_created_update_streak ON public.posts;
CREATE TRIGGER on_post_created_update_streak
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_on_post();

-- ===========================================
-- CRON JOB SETUP (via pg_cron extension)
-- ===========================================

/*
To set up the daily cron job to check for broken streaks:

1. Enable pg_cron extension (if not already enabled):
   CREATE EXTENSION IF NOT EXISTS pg_cron;

2. Schedule the job to run every hour:
   SELECT cron.schedule(
     'check-broken-streaks',
     '0 * * * *',  -- Run every hour
     $$SELECT check_and_reset_broken_streaks()$$
   );

3. Or use Supabase Edge Functions with a cron trigger instead
*/

-- ===========================================
-- COMMENTS
-- ===========================================

COMMENT ON FUNCTION calculate_streak_level IS 'Calculates streak level based on days: 1=Candle(0-6), 2=Steady(7-29), 3=Bonfire(30-99), 4=Eternal(100+)';
COMMENT ON FUNCTION update_streak_after_checkin IS 'Updates user streak after a check-in post. Returns new streak, level, and milestone status';
COMMENT ON FUNCTION check_and_reset_broken_streaks IS 'Resets streaks for users who haven''t checked in for 48+ hours. Run via cron job';
COMMENT ON FUNCTION get_user_streak_stats IS 'Returns comprehensive streak statistics for a user';
