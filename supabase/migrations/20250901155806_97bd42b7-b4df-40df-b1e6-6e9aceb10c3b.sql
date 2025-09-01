-- Phase 1 & 2 Security Hardening
-- Secure financial/operational tables and remove public read exposure

-- Helper role condition
DO $$ BEGIN END $$; -- no-op to keep migration valid if run multiple times

-- 1) invoices: replace permissive policies with role-based
DO $$
BEGIN
  -- Ensure RLS enabled
  ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

  -- Drop overly permissive policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'Allow all operations on invoices'
  ) THEN
    DROP POLICY "Allow all operations on invoices" ON public.invoices;
  END IF;

  -- Create SELECT policy for admin/accountant/manager
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoices' AND policyname='invoices_select_by_role'
  ) THEN
    CREATE POLICY invoices_select_by_role
      ON public.invoices
      FOR SELECT
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  -- INSERT restricted to admin/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoices' AND policyname='invoices_insert_by_role'
  ) THEN
    CREATE POLICY invoices_insert_by_role
      ON public.invoices
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  -- UPDATE restricted to admin/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoices' AND policyname='invoices_update_by_role'
  ) THEN
    CREATE POLICY invoices_update_by_role
      ON public.invoices
      FOR UPDATE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      )
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  -- DELETE restricted to admin/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoices' AND policyname='invoices_delete_by_role'
  ) THEN
    CREATE POLICY invoices_delete_by_role
      ON public.invoices
      FOR DELETE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;
END$$;

-- 2) invoice_items: replace permissive policies
DO $$
BEGIN
  ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'invoice_items' AND policyname = 'Allow all operations on invoice_items'
  ) THEN
    DROP POLICY "Allow all operations on invoice_items" ON public.invoice_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoice_items' AND policyname='invoice_items_select_by_role'
  ) THEN
    CREATE POLICY invoice_items_select_by_role
      ON public.invoice_items
      FOR SELECT
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoice_items' AND policyname='invoice_items_insert_by_role'
  ) THEN
    CREATE POLICY invoice_items_insert_by_role
      ON public.invoice_items
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoice_items' AND policyname='invoice_items_update_by_role'
  ) THEN
    CREATE POLICY invoice_items_update_by_role
      ON public.invoice_items
      FOR UPDATE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      )
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='invoice_items' AND policyname='invoice_items_delete_by_role'
  ) THEN
    CREATE POLICY invoice_items_delete_by_role
      ON public.invoice_items
      FOR DELETE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;
END$$;

-- 3) chart_of_accounts: replace permissive policies
DO $$
BEGIN
  ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'chart_of_accounts' AND policyname = 'Allow all operations on chart_of_accounts'
  ) THEN
    DROP POLICY "Allow all operations on chart_of_accounts" ON public.chart_of_accounts;
  END IF;

  -- SELECT for admin/accountant/manager
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chart_of_accounts' AND policyname='coa_select_by_role'
  ) THEN
    CREATE POLICY coa_select_by_role
      ON public.chart_of_accounts
      FOR SELECT
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  -- INSERT/UPDATE/DELETE for admin/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chart_of_accounts' AND policyname='coa_insert_by_role'
  ) THEN
    CREATE POLICY coa_insert_by_role
      ON public.chart_of_accounts
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chart_of_accounts' AND policyname='coa_update_by_role'
  ) THEN
    CREATE POLICY coa_update_by_role
      ON public.chart_of_accounts
      FOR UPDATE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      )
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chart_of_accounts' AND policyname='coa_delete_by_role'
  ) THEN
    CREATE POLICY coa_delete_by_role
      ON public.chart_of_accounts
      FOR DELETE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;
END$$;

-- 4) payment_vouchers: tighten from any authenticated to role-based
DO $$
BEGIN
  ALTER TABLE public.payment_vouchers ENABLE ROW LEVEL SECURITY;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'payment_vouchers' AND policyname = 'المستخدمون المسجلون يمكنهم إدارة  '
  ) THEN
    DROP POLICY "المستخدمون المسجلون يمكنهم إدارة  " ON public.payment_vouchers;
  END IF;

  -- SELECT for admin/accountant/manager
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_vouchers' AND policyname='pv_select_by_role'
  ) THEN
    CREATE POLICY pv_select_by_role
      ON public.payment_vouchers
      FOR SELECT
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  -- INSERT for admin/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_vouchers' AND policyname='pv_insert_by_role'
  ) THEN
    CREATE POLICY pv_insert_by_role
      ON public.payment_vouchers
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  -- UPDATE for admin/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_vouchers' AND policyname='pv_update_by_role'
  ) THEN
    CREATE POLICY pv_update_by_role
      ON public.payment_vouchers
      FOR UPDATE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      )
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  -- DELETE for admin/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_vouchers' AND policyname='pv_delete_by_role'
  ) THEN
    CREATE POLICY pv_delete_by_role
      ON public.payment_vouchers
      FOR DELETE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;
END$$;

-- 5) stock_transactions: tighten from any authenticated to role-based
DO $$
BEGIN
  ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'stock_transactions' AND policyname = 'Authenticated users can manage stock transactions'
  ) THEN
    DROP POLICY "Authenticated users can manage stock transactions" ON public.stock_transactions;
  END IF;

  -- SELECT for admin/accountant/manager
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='stock_transactions' AND policyname='st_select_by_role'
  ) THEN
    CREATE POLICY st_select_by_role
      ON public.stock_transactions
      FOR SELECT
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  -- INSERT/UPDATE/DELETE for admin/accountant
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='stock_transactions' AND policyname='st_insert_by_role'
  ) THEN
    CREATE POLICY st_insert_by_role
      ON public.stock_transactions
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='stock_transactions' AND policyname='st_update_by_role'
  ) THEN
    CREATE POLICY st_update_by_role
      ON public.stock_transactions
      FOR UPDATE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      )
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='stock_transactions' AND policyname='st_delete_by_role'
  ) THEN
    CREATE POLICY st_delete_by_role
      ON public.stock_transactions
      FOR DELETE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'accountant')
      );
  END IF;
END$$;

-- 6) vehicle_images: remove public read policy if present
DO $$
DECLARE pol_name text := 'Users can view all vehicle images';
BEGIN
  ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'vehicle_images' AND policyname = pol_name
  ) THEN
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.vehicle_images;', pol_name);
  END IF;
  -- Ensure auth-only SELECT policy exists (already present per schema), add if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_images' AND policyname='auth_can_read_vehicle_images'
  ) THEN
    CREATE POLICY auth_can_read_vehicle_images
      ON public.vehicle_images
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END$$;

-- 7) geofence_alerts: restrict write operations to admin/manager
DO $$
BEGIN
  ALTER TABLE public.geofence_alerts ENABLE ROW LEVEL SECURITY;

  -- Drop permissive ALL policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'geofence_alerts' AND policyname = 'System can manage geofence alerts'
  ) THEN
    DROP POLICY "System can manage geofence alerts" ON public.geofence_alerts;
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofence_alerts' AND policyname='ga_insert_admin_manager'
  ) THEN
    CREATE POLICY ga_insert_admin_manager
      ON public.geofence_alerts
      FOR INSERT
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofence_alerts' AND policyname='ga_update_admin_manager'
  ) THEN
    CREATE POLICY ga_update_admin_manager
      ON public.geofence_alerts
      FOR UPDATE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
      )
      WITH CHECK (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
      );
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='geofence_alerts' AND policyname='ga_delete_admin_manager'
  ) THEN
    CREATE POLICY ga_delete_admin_manager
      ON public.geofence_alerts
      FOR DELETE
      USING (
        has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
      );
  END IF;
END$$;
