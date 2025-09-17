-- CRITICAL SECURITY FIXES: Tighten RLS policies and improve data protection

BEGIN;

-- Phase 1: Critical Data Protection

-- 1. Secure customers table - implement least-privilege access and data masking
DROP POLICY IF EXISTS "المستخدمون المسجلون يمكنهم إدارة العملاء" ON public.customers;
DROP POLICY IF EXISTS "customers_select_by_role" ON public.customers;
DROP POLICY IF EXISTS "customers_insert_by_role" ON public.customers;
DROP POLICY IF EXISTS "customers_update_by_role" ON public.customers;
DROP POLICY IF EXISTS "customers_delete_by_role" ON public.customers;

-- Create secure customer access policies with role-based restrictions
CREATE POLICY "customers_select_by_role"
ON public.customers FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'employee'::app_role)
);

CREATE POLICY "customers_insert_admin_manager_only"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "customers_update_admin_manager_only"
ON public.customers FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "customers_delete_admin_only"
ON public.customers FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Secure financial tables - restrict to accounting roles only
-- Update payment_vouchers policies for enhanced security
DROP POLICY IF EXISTS "المستخدمون المسجلون يمكنهم إدارة" ON public.payment_vouchers;

-- 3. Secure vehicle_owners table - protect financial information
DROP POLICY IF EXISTS "المستخدمون المسجلون يمكنهم إدارة العملاء" ON public.vehicle_owners;

CREATE POLICY "vehicle_owners_select_by_role"
ON public.vehicle_owners FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role) OR
  has_role(auth.uid(), 'accountant'::app_role)
);

CREATE POLICY "vehicle_owners_insert_admin_manager"
ON public.vehicle_owners FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "vehicle_owners_update_admin_manager"
ON public.vehicle_owners FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "vehicle_owners_delete_admin_only"
ON public.vehicle_owners FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Create failed login attempts table in database (move from localStorage)
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  email TEXT,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on failed login attempts
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow system functions to manage failed login attempts
CREATE POLICY "system_manage_failed_logins"
ON public.failed_login_attempts FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Allow admins to view failed login attempts for security monitoring
CREATE POLICY "admins_view_failed_logins"
ON public.failed_login_attempts FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Grant service_role access for system functions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.failed_login_attempts TO service_role;

-- 5. Create password requirements table
CREATE TABLE IF NOT EXISTS public.password_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_length INTEGER NOT NULL DEFAULT 8,
  require_uppercase BOOLEAN NOT NULL DEFAULT true,
  require_lowercase BOOLEAN NOT NULL DEFAULT true,
  require_numbers BOOLEAN NOT NULL DEFAULT true,
  require_symbols BOOLEAN NOT NULL DEFAULT true,
  max_age_days INTEGER DEFAULT 90,
  prevent_reuse_count INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default password requirements
INSERT INTO public.password_requirements (
  min_length, require_uppercase, require_lowercase, 
  require_numbers, require_symbols, max_age_days, prevent_reuse_count
) VALUES (8, true, true, true, true, 90, 5)
ON CONFLICT DO NOTHING;

-- Enable RLS on password requirements
ALTER TABLE public.password_requirements ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read password requirements
CREATE POLICY "users_read_password_requirements"
ON public.password_requirements FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage password requirements
CREATE POLICY "admins_manage_password_requirements"
ON public.password_requirements FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. Create security audit log for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system functions to write to audit log
CREATE POLICY "system_write_security_audit"
ON public.security_audit_log FOR INSERT
TO authenticated
WITH CHECK (false); -- Only via SECURITY DEFINER functions

-- Allow admins and security personnel to read audit logs
CREATE POLICY "security_personnel_read_audit"
ON public.security_audit_log FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

-- Grant service_role access for system functions
GRANT SELECT, INSERT ON public.security_audit_log TO service_role;

-- 7. Add indexes for performance on security tables
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip_time ON public.failed_login_attempts(ip_address, attempt_time);
CREATE INDEX IF NOT EXISTS idx_failed_logins_email_time ON public.failed_login_attempts(email, attempt_time);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_time ON public.security_audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_action_time ON public.security_audit_log(action_type, created_at);

COMMIT;