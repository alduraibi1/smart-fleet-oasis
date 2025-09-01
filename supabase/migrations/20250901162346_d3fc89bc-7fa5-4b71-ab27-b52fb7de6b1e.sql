-- Phase 3: Monitoring & Logging (Audit Logs)

-- 1) Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid DEFAULT auth.uid(),
  action varchar(10) NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name text NOT NULL,
  record_id uuid,
  changed_columns text[],
  old_data jsonb,
  new_data jsonb,
  severity varchar(20) NOT NULL DEFAULT 'info',
  ip_addr inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 2) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_time ON public.audit_logs(actor_id, occurred_at DESC);

-- 3) Enable RLS and define policies (admins/managers can read, anyone authenticated can insert via triggers)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_logs' AND policyname='audit_logs_select_admin_manager'
  ) THEN
    CREATE POLICY audit_logs_select_admin_manager
      ON public.audit_logs
      FOR SELECT
      USING (
        has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_logs' AND policyname='audit_logs_insert_any_authenticated'
  ) THEN
    CREATE POLICY audit_logs_insert_any_authenticated
      ON public.audit_logs
      FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  -- No UPDATE/DELETE policies => denied by default
END$$;

-- 4) Helper function to safely log audit events (no PII payloads)
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action varchar,
  p_table_name text,
  p_record_id uuid,
  p_changed_columns text[] DEFAULT NULL,
  p_severity varchar DEFAULT 'info',
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (action, table_name, record_id, changed_columns, severity, metadata)
  VALUES (p_action, p_table_name, p_record_id, p_changed_columns, COALESCE(p_severity,'info'), COALESCE(p_metadata,'{}'::jsonb));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5) Customers audit triggers (INSERT/UPDATE/DELETE) without storing PII
CREATE OR REPLACE FUNCTION public.audit_customers_ins() RETURNS trigger AS $$
BEGIN
  PERFORM public.log_audit_event('INSERT', 'customers', NEW.id, NULL, 'info', jsonb_build_object('source','trigger'));
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.audit_customers_upd() RETURNS trigger AS $$
DECLARE
  cols text[] := ARRAY[]::text[];
BEGIN
  -- Optionally capture list of columns touched (not values)
  cols := ARRAY(SELECT a.attname::text
                FROM pg_attribute a
                JOIN pg_class c ON a.attrelid = c.oid
                JOIN pg_namespace n ON c.relnamespace = n.oid
                WHERE n.nspname = 'public' AND c.relname = 'customers' AND a.attnum > 0 AND NOT a.attisdropped);
  PERFORM public.log_audit_event('UPDATE', 'customers', NEW.id, cols, 'info', jsonb_build_object('source','trigger'));
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.audit_customers_del() RETURNS trigger AS $$
BEGIN
  PERFORM public.log_audit_event('DELETE', 'customers', OLD.id, NULL, 'warning', jsonb_build_object('source','trigger'));
  RETURN OLD;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_audit_customers_ins') THEN
    CREATE TRIGGER trg_audit_customers_ins
    AFTER INSERT ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.audit_customers_ins();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_audit_customers_upd') THEN
    CREATE TRIGGER trg_audit_customers_upd
    AFTER UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.audit_customers_upd();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_audit_customers_del') THEN
    CREATE TRIGGER trg_audit_customers_del
    AFTER DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.audit_customers_del();
  END IF;
END$$;

-- 6) customer_access audit triggers (grant/revoke/modify)
CREATE OR REPLACE FUNCTION public.audit_customer_access_ins() RETURNS trigger AS $$
BEGIN
  PERFORM public.log_audit_event('INSERT', 'customer_access', NEW.customer_id, ARRAY['access_granted'], 'info', 
    jsonb_build_object('granted_to', NEW.user_id, 'level', NEW.access_level));
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.audit_customer_access_upd() RETURNS trigger AS $$
BEGIN
  PERFORM public.log_audit_event('UPDATE', 'customer_access', NEW.customer_id, ARRAY['access_changed'], 'info', 
    jsonb_build_object('user_id', NEW.user_id, 'level', NEW.access_level));
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.audit_customer_access_del() RETURNS trigger AS $$
BEGIN
  PERFORM public.log_audit_event('DELETE', 'customer_access', OLD.customer_id, ARRAY['access_revoked'], 'warning', 
    jsonb_build_object('revoked_from', OLD.user_id));
  RETURN OLD;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_audit_customer_access_ins') THEN
    CREATE TRIGGER trg_audit_customer_access_ins
    AFTER INSERT ON public.customer_access
    FOR EACH ROW EXECUTE FUNCTION public.audit_customer_access_ins();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_audit_customer_access_upd') THEN
    CREATE TRIGGER trg_audit_customer_access_upd
    AFTER UPDATE ON public.customer_access
    FOR EACH ROW EXECUTE FUNCTION public.audit_customer_access_upd();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_audit_customer_access_del') THEN
    CREATE TRIGGER trg_audit_customer_access_del
    AFTER DELETE ON public.customer_access
    FOR EACH ROW EXECUTE FUNCTION public.audit_customer_access_del();
  END IF;
END$$;

-- 7) Optional cleanup function (manual/cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(p_keep_months integer DEFAULT 6)
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs WHERE occurred_at < NOW() - (p_keep_months || ' months')::interval;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;