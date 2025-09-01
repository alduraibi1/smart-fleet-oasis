-- Secure vehicle_owners financial data with strict RLS

-- 1) Enable RLS on vehicle_owners (no FORCE to allow SECURITY DEFINER funcs)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'vehicle_owners'
  ) THEN
    ALTER TABLE public.vehicle_owners ENABLE ROW LEVEL SECURITY;
  END IF;
END$$;

-- 2) Drop existing policies to avoid conflicts
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'vehicle_owners'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.vehicle_owners;', pol.policyname);
  END LOOP;
END$$;

-- 3) Policies: Restrict access to management and accounting only
-- Helpers available: has_role(uuid, app_role), has_permission(uuid, text)

-- SELECT: admins, managers, accountants, or users with accounting.read
CREATE POLICY vehicle_owners_select_restricted
  ON public.vehicle_owners
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'accountant'::app_role)
    OR has_permission(auth.uid(), 'accounting.read')
  );

-- INSERT: admins, managers, accountants, or users with accounting.write
CREATE POLICY vehicle_owners_insert_restricted
  ON public.vehicle_owners
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'accountant'::app_role)
    OR has_permission(auth.uid(), 'accounting.write')
  );

-- UPDATE: admins, managers, accountants, or users with accounting.write
CREATE POLICY vehicle_owners_update_restricted
  ON public.vehicle_owners
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'accountant'::app_role)
    OR has_permission(auth.uid(), 'accounting.write')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'accountant'::app_role)
    OR has_permission(auth.uid(), 'accounting.write')
  );

-- DELETE: admins, managers, accountants, or users with accounting.delete
CREATE POLICY vehicle_owners_delete_restricted
  ON public.vehicle_owners
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_role(auth.uid(), 'accountant'::app_role)
    OR has_permission(auth.uid(), 'accounting.delete')
  );
