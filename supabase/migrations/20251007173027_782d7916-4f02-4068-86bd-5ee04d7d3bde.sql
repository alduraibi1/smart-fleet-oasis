-- حذف جداول نظام المزامنة مع علم
DROP TABLE IF EXISTS public.elm_sync_logs CASCADE;
DROP TABLE IF EXISTS public.elm_sync_config CASCADE;
DROP TABLE IF EXISTS public.external_tracking_config CASCADE;
DROP TABLE IF EXISTS public.vehicle_tracker_mappings CASCADE;

-- حذف الدوال المتعلقة بالمزامنة
DROP FUNCTION IF EXISTS public.update_elm_sync_config_updated_at() CASCADE;