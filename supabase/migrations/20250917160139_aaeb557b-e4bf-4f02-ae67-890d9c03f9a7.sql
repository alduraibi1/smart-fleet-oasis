-- Fix Security Definer View issue by recreating views with proper security settings
-- Drop existing views that are owned by postgres (security definer by default)
DROP VIEW IF EXISTS public.inventory_items_extended CASCADE;
DROP VIEW IF EXISTS public.inventory_transactions CASCADE; 
DROP VIEW IF EXISTS public.service_schedule CASCADE;
DROP VIEW IF EXISTS public.work_orders CASCADE;

-- Recreate views as security invoker (respects RLS of calling user)
-- These views will respect the RLS policies of the underlying tables

-- Inventory Items Extended View
CREATE VIEW public.inventory_items_extended
WITH (security_barrier=true, security_invoker=true) AS
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
FROM inventory_items;

-- Inventory Transactions View  
CREATE VIEW public.inventory_transactions
WITH (security_barrier=true, security_invoker=true) AS
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
FROM stock_transactions;

-- Service Schedule View
CREATE VIEW public.service_schedule
WITH (security_barrier=true, security_invoker=true) AS
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
FROM maintenance_schedules;

-- Work Orders View
CREATE VIEW public.work_orders
WITH (security_barrier=true, security_invoker=true) AS
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
FROM vehicle_maintenance;

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON public.inventory_items_extended TO authenticated;
GRANT SELECT ON public.inventory_transactions TO authenticated;
GRANT SELECT ON public.service_schedule TO authenticated; 
GRANT SELECT ON public.work_orders TO authenticated;

-- Note: pending_users_secure view is kept as-is since it's used for admin functionality
-- and should remain accessible to admin users only through existing RLS policies