-- Approve the user and ensure admin role exists (no notifications to avoid constraint issues)
DO $$
DECLARE
  v_user_id uuid := '4f8a2cf3-5b13-4f1b-a69d-e0e5e9ed952d';
BEGIN
  -- Approve the profile
  UPDATE profiles
  SET approval_status = 'approved',
      approved_by = COALESCE(approved_by, v_user_id),
      approved_at = COALESCE(approved_at, now())
  WHERE id = v_user_id;

  -- Ensure admin role exists for this user
  IF NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = v_user_id AND role = 'admin'
  ) THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'admin');
  END IF;
END $$;