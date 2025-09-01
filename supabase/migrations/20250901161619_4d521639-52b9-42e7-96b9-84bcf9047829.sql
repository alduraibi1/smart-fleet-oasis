-- Context-based access control for customers
-- 1) Create customer_access mapping table
CREATE TABLE IF NOT EXISTS public.customer_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  access_level varchar(20) NOT NULL DEFAULT 'view' CHECK (access_level IN ('view','edit','owner')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

-- Enable RLS on mapping table
ALTER TABLE public.customer_access ENABLE ROW LEVEL SECURITY;

-- Policies for mapping table
DO $$
BEGIN
  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customer_access' AND policyname = 'Users can view their customer_access'
  ) THEN
    CREATE POLICY "Users can view their customer_access"
      ON public.customer_access
      FOR SELECT
      USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
  END IF;

  -- INSERT policy (admin/manager only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customer_access' AND policyname = 'Admins or managers can insert customer_access'
  ) THEN
    CREATE POLICY "Admins or managers can insert customer_access"
      ON public.customer_access
      FOR INSERT
      WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
  END IF;

  -- UPDATE policy (admin/manager only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customer_access' AND policyname = 'Admins or managers can update customer_access'
  ) THEN
    CREATE POLICY "Admins or managers can update customer_access"
      ON public.customer_access
      FOR UPDATE
      USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'))
      WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
  END IF;

  -- DELETE policy (admin only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customer_access' AND policyname = 'Admins can delete customer_access'
  ) THEN
    CREATE POLICY "Admins can delete customer_access"
      ON public.customer_access
      FOR DELETE
      USING (has_role(auth.uid(),'admin'));
  END IF;
END$$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_customer_access_customer_user 
  ON public.customer_access(customer_id, user_id);

-- 2) Trigger: grant creator owner access on new customer
CREATE OR REPLACE FUNCTION public.grant_customer_owner_access()
RETURNS trigger AS $$
BEGIN
  -- Grant owner access to the creator of the customer
  INSERT INTO public.customer_access (customer_id, user_id, access_level, created_by)
  VALUES (NEW.id, auth.uid(), 'owner', auth.uid())
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_grant_customer_owner_access'
  ) THEN
    CREATE TRIGGER trg_grant_customer_owner_access
    AFTER INSERT ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.grant_customer_owner_access();
  END IF;
END$$;

-- 3) Tighten customers RLS using context-based access
DO $$
BEGIN
  -- Ensure RLS enabled
  ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

  -- Drop previous permissive policies by name if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='customers_select_by_permission') THEN
    DROP POLICY customers_select_by_permission ON public.customers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='customers_update_by_permission') THEN
    DROP POLICY customers_update_by_permission ON public.customers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='customers_insert_by_permission') THEN
    DROP POLICY customers_insert_by_permission ON public.customers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='customers_delete_by_permission') THEN
    DROP POLICY customers_delete_by_permission ON public.customers;
  END IF;

  -- SELECT: admin/manager full access; others require mapping
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='customers_select_by_context'
  ) THEN
    CREATE POLICY customers_select_by_context
      ON public.customers
      FOR SELECT
      USING (
        has_role(auth.uid(),'admin')
        OR has_role(auth.uid(),'manager')
        OR EXISTS (
          SELECT 1 FROM public.customer_access ca
          WHERE ca.customer_id = customers.id AND ca.user_id = auth.uid()
        )
      );
  END IF;

  -- INSERT: allow admin/manager or users with customers.write
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='customers_insert_by_context'
  ) THEN
    CREATE POLICY customers_insert_by_context
      ON public.customers
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(),'admin')
        OR has_role(auth.uid(),'manager')
        OR has_permission(auth.uid(),'customers.write')
      );
  END IF;

  -- UPDATE: admin/manager OR writer with edit/owner mapping
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='customers_update_by_context'
  ) THEN
    CREATE POLICY customers_update_by_context
      ON public.customers
      FOR UPDATE
      USING (
        has_role(auth.uid(),'admin')
        OR has_role(auth.uid(),'manager')
        OR (
          has_permission(auth.uid(),'customers.write')
          AND EXISTS (
            SELECT 1 FROM public.customer_access ca
            WHERE ca.customer_id = customers.id 
              AND ca.user_id = auth.uid()
              AND ca.access_level IN ('edit','owner')
          )
        )
      )
      WITH CHECK (
        has_role(auth.uid(),'admin')
        OR has_role(auth.uid(),'manager')
        OR (
          has_permission(auth.uid(),'customers.write')
          AND EXISTS (
            SELECT 1 FROM public.customer_access ca
            WHERE ca.customer_id = customers.id 
              AND ca.user_id = auth.uid()
              AND ca.access_level IN ('edit','owner')
          )
        )
      );
  END IF;

  -- DELETE: admin/manager OR explicit delete permission with owner mapping
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='customers' AND policyname='customers_delete_by_context'
  ) THEN
    CREATE POLICY customers_delete_by_context
      ON public.customers
      FOR DELETE
      USING (
        has_role(auth.uid(),'admin')
        OR has_role(auth.uid(),'manager')
        OR (
          has_permission(auth.uid(),'customers.delete')
          AND EXISTS (
            SELECT 1 FROM public.customer_access ca
            WHERE ca.customer_id = customers.id 
              AND ca.user_id = auth.uid()
              AND ca.access_level = 'owner'
          )
        )
      );
  END IF;
END$$;