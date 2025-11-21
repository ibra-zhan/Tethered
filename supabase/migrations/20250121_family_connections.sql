-- Family Connection System
-- Tables, functions, and policies for connecting students and parents
-- Works with existing family_connections table (user_id, connected_user_id)

-- ===========================================
-- TABLE: invite_codes
-- ===========================================
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  CONSTRAINT code_length CHECK (length(code) = 6)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invite_codes_user_id ON public.invite_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_expires_at ON public.invite_codes(expires_at) WHERE used_at IS NULL;

COMMENT ON TABLE public.invite_codes IS 'Stores invite codes for family connections. Codes expire after 7 days.';

-- ===========================================
-- FUNCTION: Generate Invite Code
-- ===========================================
CREATE OR REPLACE FUNCTION generate_invite_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_attempts INTEGER := 0;
  v_max_attempts INTEGER := 10;
BEGIN
  -- Generate a unique 6-character alphanumeric code
  LOOP
    -- Generate random 6-character code (uppercase letters and numbers)
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

    -- Check if code already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.invite_codes
      WHERE code = v_code AND used_at IS NULL
    ) THEN
      -- Insert the new code
      INSERT INTO public.invite_codes (user_id, code)
      VALUES (p_user_id, v_code);

      RETURN v_code;
    END IF;

    v_attempts := v_attempts + 1;
    IF v_attempts >= v_max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique code after % attempts', v_max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_invite_code IS 'Generates a unique 6-character invite code for a user';

-- ===========================================
-- FUNCTION: Verify Invite Code
-- ===========================================
CREATE OR REPLACE FUNCTION verify_invite_code(
  p_code TEXT,
  p_requesting_user_id UUID
)
RETURNS TABLE(
  is_valid BOOLEAN,
  code_owner_id UUID,
  code_owner_name TEXT,
  code_owner_role TEXT,
  error_message TEXT
) AS $$
DECLARE
  v_code_record RECORD;
  v_owner_record RECORD;
BEGIN
  -- Find the invite code
  SELECT * INTO v_code_record
  FROM public.invite_codes
  WHERE code = upper(p_code);

  -- Check if code exists
  IF v_code_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Invalid code'::TEXT;
    RETURN;
  END IF;

  -- Check if code is expired
  IF v_code_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Code expired'::TEXT;
    RETURN;
  END IF;

  -- Check if code was already used
  IF v_code_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Code already used'::TEXT;
    RETURN;
  END IF;

  -- Check if user is trying to use their own code
  IF v_code_record.user_id = p_requesting_user_id THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, 'Cannot use your own code'::TEXT;
    RETURN;
  END IF;

  -- Get code owner details
  SELECT id, name, role INTO v_owner_record
  FROM public.user_profiles
  WHERE id = v_code_record.user_id;

  -- Validate role matching (student connects with parent, parent with student)
  DECLARE
    v_requesting_user_role TEXT;
  BEGIN
    SELECT role INTO v_requesting_user_role
    FROM public.user_profiles
    WHERE id = p_requesting_user_id;

    -- Check for valid role pairing
    IF (v_owner_record.role = 'student' AND v_requesting_user_role != 'parent') OR
       (v_owner_record.role = 'parent' AND v_requesting_user_role != 'student') THEN
      RETURN QUERY SELECT
        false,
        NULL::UUID,
        NULL::TEXT,
        NULL::TEXT,
        'Invalid role pairing'::TEXT;
      RETURN;
    END IF;
  END;

  -- Code is valid
  RETURN QUERY SELECT
    true,
    v_owner_record.id,
    v_owner_record.name,
    v_owner_record.role,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION verify_invite_code IS 'Verifies an invite code and returns owner info if valid';

-- ===========================================
-- FUNCTION: Create Connection Request
-- ===========================================
CREATE OR REPLACE FUNCTION create_connection_request(
  p_code TEXT,
  p_requesting_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  connection_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_verification RECORD;
  v_new_connection_id UUID;
BEGIN
  -- Verify the code first
  SELECT * INTO v_verification
  FROM verify_invite_code(p_code, p_requesting_user_id);

  IF NOT v_verification.is_valid THEN
    RETURN QUERY SELECT false, NULL::UUID, v_verification.error_message;
    RETURN;
  END IF;

  -- Check if connection already exists (in either direction)
  IF EXISTS (
    SELECT 1 FROM public.family_connections
    WHERE (user_id = p_requesting_user_id AND connected_user_id = v_verification.code_owner_id)
       OR (user_id = v_verification.code_owner_id AND connected_user_id = p_requesting_user_id)
  ) THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Connection already exists'::TEXT;
    RETURN;
  END IF;

  -- Create the connection (auto-accepted since they have a valid code)
  INSERT INTO public.family_connections (user_id, connected_user_id, status)
  VALUES (p_requesting_user_id, v_verification.code_owner_id, 'accepted')
  RETURNING id INTO v_new_connection_id;

  -- Mark code as used
  UPDATE public.invite_codes
  SET used_at = NOW(), used_by = p_requesting_user_id
  WHERE code = upper(p_code);

  -- Return success
  RETURN QUERY SELECT true, v_new_connection_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_connection_request IS 'Creates a family connection using an invite code';

-- ===========================================
-- FUNCTION: Get Family Members
-- ===========================================
CREATE OR REPLACE FUNCTION get_family_members(p_user_id UUID)
RETURNS TABLE(
  connection_id UUID,
  member_id UUID,
  member_name TEXT,
  member_role TEXT,
  member_avatar_url TEXT,
  connected_at TIMESTAMPTZ,
  member_streak_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fc.id AS connection_id,
    up.id AS member_id,
    up.name AS member_name,
    up.role AS member_role,
    up.avatar_url AS member_avatar_url,
    fc.created_at AS connected_at,
    COALESCE(us.streak_days, 0) AS member_streak_days
  FROM public.family_connections fc
  JOIN public.user_profiles up ON (
    CASE
      WHEN fc.user_id = p_user_id THEN up.id = fc.connected_user_id
      WHEN fc.connected_user_id = p_user_id THEN up.id = fc.user_id
      ELSE false
    END
  )
  LEFT JOIN public.user_streaks us ON us.user_id = up.id
  WHERE
    (fc.user_id = p_user_id OR fc.connected_user_id = p_user_id)
    AND fc.status = 'accepted'
  ORDER BY fc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_family_members IS 'Returns all accepted family connections for a user';

-- ===========================================
-- FUNCTION: Disconnect Family Member
-- ===========================================
CREATE OR REPLACE FUNCTION disconnect_family_member(
  p_connection_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  error_message TEXT
) AS $$
BEGIN
  -- Verify user is part of this connection
  IF NOT EXISTS (
    SELECT 1 FROM public.family_connections
    WHERE id = p_connection_id
      AND (user_id = p_user_id OR connected_user_id = p_user_id)
  ) THEN
    RETURN QUERY SELECT false, 'Connection not found or unauthorized'::TEXT;
    RETURN;
  END IF;

  -- Delete the connection
  DELETE FROM public.family_connections
  WHERE id = p_connection_id;

  RETURN QUERY SELECT true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION disconnect_family_member IS 'Disconnects a family member by deleting the connection';

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- Enable RLS on invite_codes
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own invite codes
CREATE POLICY "Users can view own invite codes"
  ON public.invite_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own invite codes
CREATE POLICY "Users can create own invite codes"
  ON public.invite_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- GRANT PERMISSIONS
-- ===========================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION generate_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION verify_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION create_connection_request TO authenticated;
GRANT EXECUTE ON FUNCTION get_family_members TO authenticated;
GRANT EXECUTE ON FUNCTION disconnect_family_member TO authenticated;
