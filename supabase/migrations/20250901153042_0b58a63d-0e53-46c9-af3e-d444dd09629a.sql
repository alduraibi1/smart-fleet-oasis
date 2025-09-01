-- Secure smart_notifications with strict RLS while preserving app functionality

-- 1) Enable RLS (do NOT FORCE so SECURITY DEFINER functions can insert)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'smart_notifications'
  ) THEN
    ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;
  END IF;
END$$;

-- 2) Drop existing policies on smart_notifications to avoid conflicts
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'smart_notifications'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.smart_notifications;', pol.policyname);
  END LOOP;
END$$;

-- 3) Helper function: return user roles as text[] for overlap comparisons
CREATE OR REPLACE FUNCTION public.user_roles_text(_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(role::text), '{}')
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- 4) Policies
-- Admins and managers: full management access
CREATE POLICY "admins_managers_select_smart_notifications"
  ON public.smart_notifications
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "admins_managers_update_smart_notifications"
  ON public.smart_notifications
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "admins_managers_delete_smart_notifications"
  ON public.smart_notifications
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

-- Regular users: can SELECT notifications sent directly to them or to any of their roles
CREATE POLICY "users_can_read_their_or_role_notifications"
  ON public.smart_notifications
  FOR SELECT
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (
      COALESCE(target_roles, '{}') <> '{}'::text[]
      AND user_roles_text(auth.uid()) && COALESCE(target_roles, '{}'::text[])
    )
  );

-- Regular users: can UPDATE (e.g., mark read/dismiss) notifications they can see
CREATE POLICY "users_can_update_visible_notifications"
  ON public.smart_notifications
  FOR UPDATE
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (user_roles_text(auth.uid()) && COALESCE(target_roles, '{}'::text[]))
  )
  WITH CHECK (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (user_roles_text(auth.uid()) && COALESCE(target_roles, '{}'::text[]))
  );

-- Regular users: can DELETE notifications only if they were explicitly targeted to them (not role-broadcast)
CREATE POLICY "users_can_delete_own_notifications"
  ON public.smart_notifications
  FOR DELETE
  USING (
    user_id IS NOT NULL AND auth.uid() = user_id
  );

-- Note:
-- - No INSERT policy is created intentionally. Inserts are performed via SECURITY DEFINER functions
--   (e.g., create_smart_notification) and/or service-role edge functions, which bypass RLS safely.
-- - Realtime will respect these SELECT policies so users only receive updates for authorized rows.
