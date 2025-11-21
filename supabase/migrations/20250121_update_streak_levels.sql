-- Update Streak Levels to 3 Tiers
-- Level 1: 1-9 days
-- Level 2: 10-29 days
-- Level 3: 30+ days

-- ===========================================
-- FUNCTION: Calculate Streak Level (Updated)
-- ===========================================
CREATE OR REPLACE FUNCTION calculate_streak_level(streak_days INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level 1: Starting Out (1-9 days)
  -- Level 2: Steady Flame (10-29 days)
  -- Level 3: Eternal Light (30+ days)

  IF streak_days < 10 THEN
    RETURN 1;
  ELSIF streak_days < 30 THEN
    RETURN 2;
  ELSE
    RETURN 3;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update comment to reflect new levels
COMMENT ON FUNCTION calculate_streak_level IS 'Calculates streak level based on days: 1=Starting(1-9), 2=Steady(10-29), 3=Eternal(30+)';

-- Update existing user streak levels based on new calculation
UPDATE public.user_streaks
SET level = calculate_streak_level(streak_days)
WHERE level != calculate_streak_level(streak_days);
