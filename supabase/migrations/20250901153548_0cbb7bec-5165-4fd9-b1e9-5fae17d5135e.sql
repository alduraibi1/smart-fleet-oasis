-- Secure public.customers with strict, role/permission-based RLS without breaking app

-- 1) Enable RLS (do NOT FORCE to allow SECURITY DEFINER functions to operate)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'customers'
  ) THEN
    ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
  END IF;
END$$;

-- 2) Drop existing policies on customers to avoid conflicts
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.customers;', pol.policyname);
  END LOOP;
END$$;

-- 3) Helper functions (already exist in project):
--    public.has_role(_user_id uuid, _role app_role) RETURNS boolean
--    public.has_permission(_user_id uuid, _permission_name text) RETURNS boolean
-- These are SECURITY DEFINER and safe for RLS use.

-- 4) Policies
-- SELECT: admins/managers or users with customers.read
CREATE POLICY customers_select_by_role_or_permission
  ON public.customers
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_permission(auth.uid(), 'customers.read')
  );

-- INSERT: admins/managers or users with customers.write
CREATE POLICY customers_insert_by_role_or_permission
  ON public.customers
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_permission(auth.uid(), 'customers.write')
  );

-- UPDATE: admins/managers or users with customers.write
CREATE POLICY customers_update_by_role_or_permission
  ON public.customers
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_permission(auth.uid(), 'customers.write')
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_permission(auth.uid(), 'customers.write')
  );

-- DELETE: admins/managers or users with customers.delete
CREATE POLICY customers_delete_by_role_or_permission
  ON public.customers
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR has_permission(auth.uid(), 'customers.delete')
  );
