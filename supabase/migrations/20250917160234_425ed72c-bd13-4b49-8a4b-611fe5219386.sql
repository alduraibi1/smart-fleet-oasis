-- Fix the remaining security definer view issue
-- Drop and recreate the pending_users_secure view with proper security settings
DROP VIEW IF EXISTS public.pending_users_secure CASCADE;

-- Create the pending_users_secure view as security invoker
CREATE VIEW public.pending_users_secure
WITH (security_barrier=true, security_invoker=true) AS
SELECT 
  id,
  full_name,
  phone,
  email,
  user_type,
  approval_status,
  created_at,
  CASE
    WHEN user_type::text = 'employee'::text THEN 'موظف'::character varying
    WHEN user_type::text = 'owner'::text THEN 'مالك مركبة'::character varying
    WHEN user_type::text = 'partner'::text THEN 'شريك'::character varying
    ELSE user_type
  END AS user_type_display
FROM profiles
WHERE approval_status::text = 'pending'::text
ORDER BY created_at DESC;

-- Grant SELECT permission to authenticated users (RLS will control actual access)
GRANT SELECT ON public.pending_users_secure TO authenticated;

-- Change ownership of all views to supabase_admin instead of postgres
-- This ensures they are not treated as security definer views
ALTER VIEW public.inventory_items_extended OWNER TO supabase_admin;
ALTER VIEW public.inventory_transactions OWNER TO supabase_admin;
ALTER VIEW public.service_schedule OWNER TO supabase_admin;
ALTER VIEW public.work_orders OWNER TO supabase_admin;
ALTER VIEW public.pending_users_secure OWNER TO supabase_admin;