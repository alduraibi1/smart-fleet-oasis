-- Set SECURITY INVOKER on views to ensure queries run with the caller's privileges
-- and RLS policies of underlying tables are enforced for the querying user.

-- inventory_items_extended view
ALTER VIEW public.inventory_items_extended SET (security_invoker = on);

-- inventory_transactions view
ALTER VIEW public.inventory_transactions SET (security_invoker = on);

-- service_schedule view
ALTER VIEW public.service_schedule SET (security_invoker = on);

-- work_orders view
ALTER VIEW public.work_orders SET (security_invoker = on);

-- Optional: Add documentation comments for future maintainers
COMMENT ON VIEW public.inventory_items_extended IS 'SECURITY INVOKER enabled to enforce RLS of underlying tables for callers';
COMMENT ON VIEW public.inventory_transactions IS 'SECURITY INVOKER enabled to enforce RLS of underlying tables for callers';
COMMENT ON VIEW public.service_schedule IS 'SECURITY INVOKER enabled to enforce RLS of underlying tables for callers';
COMMENT ON VIEW public.work_orders IS 'SECURITY INVOKER enabled to enforce RLS of underlying tables for callers';