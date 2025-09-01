-- Secure customers table with strict RLS policies
-- 1) Ensure RLS is enabled and enforced
DO $$
BEGIN
  -- Enable and force RLS only if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'customers'
  ) THEN
    ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;
  END IF;
END$$;

-- 2) Drop existing policies to avoid conflicts
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

-- 3) Create strict policies using role checks
-- Full access for admins and managers only
CREATE POLICY "admins_managers_select_customers"
  ON public.customers
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "admins_managers_insert_customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "admins_managers_update_customers"
  ON public.customers
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "admins_managers_delete_customers"
  ON public.customers
  FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)
  );

-- Notes for maintainers:
-- - Non-admin/manager users will see zero rows for customers.
-- - If you need limited, masked access for other roles, create a SECURITY INVOKER view
--   that excludes sensitive columns and query that view from the app.
