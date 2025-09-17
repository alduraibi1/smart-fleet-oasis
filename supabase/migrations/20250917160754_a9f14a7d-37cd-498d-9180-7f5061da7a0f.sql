-- Enforce SECURITY INVOKER semantics on all public views to ensure RLS of the querying user applies
-- This migration recreates views with security_invoker=true and security_barrier=true

begin;

-- 1) inventory_items_extended
DROP VIEW IF EXISTS public.inventory_items_extended CASCADE;
CREATE VIEW public.inventory_items_extended
WITH (security_barrier = true, security_invoker = true) AS
SELECT 
  id,
  part_number,
  name,
  category_id,
  supplier_id,
  sku,
  barcode,
  unit_of_measure,
  unit_cost,
  selling_price,
  current_stock AS quantity_available,
  minimum_stock AS reorder_level,
  maximum_stock,
  reorder_point,
  location,
  expiry_date,
  is_active,
  created_at,
  updated_at,
  description
FROM public.inventory_items;
GRANT SELECT ON public.inventory_items_extended TO authenticated;

-- 2) inventory_transactions
DROP VIEW IF EXISTS public.inventory_transactions CASCADE;
CREATE VIEW public.inventory_transactions
WITH (security_barrier = true, security_invoker = true) AS
SELECT 
  id,
  item_id,
  transaction_type,
  quantity,
  unit_cost,
  total_cost,
  reference_type,
  reference_id,
  notes,
  performed_by,
  transaction_date,
  created_at
FROM public.stock_transactions;
GRANT SELECT ON public.inventory_transactions TO authenticated;

-- 3) service_schedule
DROP VIEW IF EXISTS public.service_schedule CASCADE;
CREATE VIEW public.service_schedule
WITH (security_barrier = true, security_invoker = true) AS
SELECT 
  id,
  vehicle_id,
  template_id,
  maintenance_type,
  scheduled_date,
  scheduled_mileage,
  priority,
  status,
  notes,
  created_by,
  created_at,
  updated_at
FROM public.maintenance_schedules;
GRANT SELECT ON public.service_schedule TO authenticated;

-- 4) work_orders
DROP VIEW IF EXISTS public.work_orders CASCADE;
CREATE VIEW public.work_orders
WITH (security_barrier = true, security_invoker = true) AS
SELECT 
  id,
  vehicle_id,
  reported_issue,
  status,
  COALESCE(scheduled_date::timestamp without time zone::timestamp with time zone, created_at) AS opened_at,
  completed_date AS closed_at,
  odometer_in,
  odometer_out,
  COALESCE(total_cost, cost) AS cost,
  assigned_mechanic_id
FROM public.vehicle_maintenance;
GRANT SELECT ON public.work_orders TO authenticated;

-- 5) pending_users_secure
DROP VIEW IF EXISTS public.pending_users_secure CASCADE;
CREATE VIEW public.pending_users_secure
WITH (security_barrier = true, security_invoker = true) AS
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
FROM public.profiles
WHERE approval_status::text = 'pending'::text
ORDER BY created_at DESC;
GRANT SELECT ON public.pending_users_secure TO authenticated;

commit;