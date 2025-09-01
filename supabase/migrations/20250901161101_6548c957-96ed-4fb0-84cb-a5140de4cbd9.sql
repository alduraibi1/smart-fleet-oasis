-- Strengthen RLS for customers table to protect PII
DO $$
BEGIN
  -- Enable RLS
  ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

  -- Drop permissive policies if they exist (English/Arabic variants)
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Authenticated users can manage customers'
  ) THEN
    DROP POLICY "Authenticated users can manage customers" ON public.customers;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'auth can read customers'
  ) THEN
    DROP POLICY "auth can read customers" ON public.customers;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname LIKE '%المستخدمون المسجلون يمكنهم إدارة%'
  ) THEN
    DROP POLICY IF EXISTS "المستخدمون المسجلون يمكنهم إدارة  " ON public.customers;
  END IF;

  -- READ: allow admin/manager OR users with explicit customers.read permission
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'customers_select_by_permission'
  ) THEN
    CREATE POLICY customers_select_by_permission
      ON public.customers
      FOR SELECT
      USING (
        has_role(auth.uid(), 'admin') OR 
        has_role(auth.uid(), 'manager') OR 
        has_permission(auth.uid(), 'customers.read')
      );
  END IF;

  -- INSERT: allow admin/manager OR users with customers.write
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'customers_insert_by_permission'
  ) THEN
    CREATE POLICY customers_insert_by_permission
      ON public.customers
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR 
        has_role(auth.uid(), 'manager') OR 
        has_permission(auth.uid(), 'customers.write')
      );
  END IF;

  -- UPDATE: allow admin/manager OR users with customers.write
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'customers_update_by_permission'
  ) THEN
    CREATE POLICY customers_update_by_permission
      ON public.customers
      FOR UPDATE
      USING (
        has_role(auth.uid(), 'admin') OR 
        has_role(auth.uid(), 'manager') OR 
        has_permission(auth.uid(), 'customers.write')
      )
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR 
        has_role(auth.uid(), 'manager') OR 
        has_permission(auth.uid(), 'customers.write')
      );
  END IF;

  -- DELETE: stricter - admin OR explicit customers.delete permission
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'customers_delete_by_permission'
  ) THEN
    CREATE POLICY customers_delete_by_permission
      ON public.customers
      FOR DELETE
      USING (
        has_role(auth.uid(), 'admin') OR has_permission(auth.uid(), 'customers.delete')
      );
  END IF;
END$$;