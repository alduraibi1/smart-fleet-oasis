-- Tighten RLS for suppliers to protect sensitive contact info
DO $$
BEGIN
  -- Ensure RLS is enabled
  ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

  -- Drop permissive policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'Authenticated users can manage suppliers'
  ) THEN
    DROP POLICY "Authenticated users can manage suppliers" ON public.suppliers;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'auth can read suppliers'
  ) THEN
    DROP POLICY "auth can read suppliers" ON public.suppliers;
  END IF;

  -- Read access for admin/manager/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_select_by_role'
  ) THEN
    CREATE POLICY suppliers_select_by_role
      ON public.suppliers
      FOR SELECT
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  -- Insert limited to admin/manager
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_insert_admin_manager'
  ) THEN
    CREATE POLICY suppliers_insert_admin_manager
      ON public.suppliers
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  -- Update limited to admin/manager
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_update_admin_manager'
  ) THEN
    CREATE POLICY suppliers_update_admin_manager
      ON public.suppliers
      FOR UPDATE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
      )
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  -- Delete limited to admin only (stricter)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_delete_admin_only'
  ) THEN
    CREATE POLICY suppliers_delete_admin_only
      ON public.suppliers
      FOR DELETE
      USING (
        has_role(auth.uid(), 'admin')
      );
  END IF;
END$$;