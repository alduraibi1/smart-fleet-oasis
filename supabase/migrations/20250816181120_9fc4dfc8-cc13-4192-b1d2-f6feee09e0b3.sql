
-- Phase 1: Infrastructure - Database schema upgrade

-- 1) Vehicles: add registration expiry
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS registration_expiry date;

CREATE INDEX IF NOT EXISTS idx_vehicles_registration_expiry
  ON public.vehicles (registration_expiry);


-- 2) Customers: ensure credit_limit exists (default 0)
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS credit_limit numeric DEFAULT 0;


-- 3) Rental Contracts: accrual & credit fields
ALTER TABLE public.rental_contracts
  ADD COLUMN IF NOT EXISTS credit_limit_override numeric;

ALTER TABLE public.rental_contracts
  ADD COLUMN IF NOT EXISTS accrued_amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.rental_contracts
  ADD COLUMN IF NOT EXISTS outstanding_amount numeric NOT NULL DEFAULT 0;


-- 4) system_settings (global settings)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies: SELECT for authenticated users, manage by admins only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'Authenticated can read system_settings'
  ) THEN
    CREATE POLICY "Authenticated can read system_settings"
      ON public.system_settings
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'system_settings' AND policyname = 'Admins can manage system_settings'
  ) THEN
    CREATE POLICY "Admins can manage system_settings"
      ON public.system_settings
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_system_settings_updated_at'
  ) THEN
    CREATE TRIGGER trg_system_settings_updated_at
      BEFORE UPDATE ON public.system_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- 5) deposit_transactions (for deposits, deduction/refund on close)
CREATE TABLE IF NOT EXISTS public.deposit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid,
  customer_id uuid,
  amount numeric NOT NULL,
  transaction_type varchar NOT NULL, -- e.g. 'deduct' | 'refund' | 'hold' | 'release'
  reason text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deposit_transactions_contract
  ON public.deposit_transactions (contract_id);

CREATE INDEX IF NOT EXISTS idx_deposit_transactions_customer
  ON public.deposit_transactions (customer_id);

CREATE INDEX IF NOT EXISTS idx_deposit_transactions_created_at
  ON public.deposit_transactions (created_at);

ALTER TABLE public.deposit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'deposit_transactions' AND policyname = 'Authenticated can manage deposit_transactions'
  ) THEN
    CREATE POLICY "Authenticated can manage deposit_transactions"
      ON public.deposit_transactions
      FOR ALL
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_deposit_transactions_updated_at'
  ) THEN
    CREATE TRIGGER trg_deposit_transactions_updated_at
      BEFORE UPDATE ON public.deposit_transactions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- 6) contract_accruals (daily accrual snapshots per contract)
CREATE TABLE IF NOT EXISTS public.contract_accruals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL,
  calculation_date date NOT NULL,
  days_elapsed integer NOT NULL DEFAULT 0,
  daily_rate numeric NOT NULL DEFAULT 0,
  accrued_amount numeric NOT NULL DEFAULT 0,
  receipts_amount numeric NOT NULL DEFAULT 0,
  outstanding_amount numeric NOT NULL DEFAULT 0,
  calculated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_contract_accruals_contract_date
  ON public.contract_accruals (contract_id, calculation_date);

CREATE INDEX IF NOT EXISTS idx_contract_accruals_created_at
  ON public.contract_accruals (created_at);

ALTER TABLE public.contract_accruals ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'contract_accruals' AND policyname = 'Authenticated can manage contract_accruals'
  ) THEN
    CREATE POLICY "Authenticated can manage contract_accruals"
      ON public.contract_accruals
      FOR ALL
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_contract_accruals_updated_at'
  ) THEN
    CREATE TRIGGER trg_contract_accruals_updated_at
      BEFORE UPDATE ON public.contract_accruals
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
