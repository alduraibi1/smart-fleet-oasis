
-- Phase 1: Maintenance & Inventory schema alignment + validation + lightweight activity logging

-- 1) Add missing fields to vehicle_maintenance to match Work Orders spec
ALTER TABLE public.vehicle_maintenance
  ADD COLUMN IF NOT EXISTS reported_issue text,
  ADD COLUMN IF NOT EXISTS odometer_in integer,
  ADD COLUMN IF NOT EXISTS odometer_out integer,
  ADD COLUMN IF NOT EXISTS assigned_mechanic_id uuid REFERENCES public.mechanics(id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle_id ON public.vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_status ON public.vehicle_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_assigned_mechanic ON public.vehicle_maintenance(assigned_mechanic_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_completed_date ON public.vehicle_maintenance(completed_date);

-- 2) Inventory: add part_number to items
ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS part_number varchar;

CREATE UNIQUE INDEX IF NOT EXISTS ux_inventory_part_number ON public.inventory_items(part_number);

-- 3) Validation trigger for vehicle_maintenance:
-- Use trigger (not CHECK) to validate odometer_out >= odometer_in when completing
CREATE OR REPLACE FUNCTION public.vehicle_maintenance_before_update_validate()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Normalize odometers to non-negative if provided
  IF NEW.odometer_in IS NOT NULL AND NEW.odometer_in < 0 THEN
    RAISE EXCEPTION 'odometer_in cannot be negative';
  END IF;
  IF NEW.odometer_out IS NOT NULL AND NEW.odometer_out < 0 THEN
    RAISE EXCEPTION 'odometer_out cannot be negative';
  END IF;

  -- When transitioning to completed, enforce odometer & completion date
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    IF NEW.odometer_in IS NULL THEN
      -- allow, but encourage data quality
      RAISE NOTICE 'Completing maintenance without odometer_in';
    END IF;
    IF NEW.odometer_out IS NULL THEN
      RAISE EXCEPTION 'odometer_out is required when completing a work order';
    END IF;
    IF NEW.odometer_in IS NOT NULL AND NEW.odometer_out < NEW.odometer_in THEN
      RAISE EXCEPTION 'odometer_out (%) cannot be less than odometer_in (%)', NEW.odometer_out, NEW.odometer_in;
    END IF;

    -- Auto set completed_date if not provided
    IF NEW.completed_date IS NULL THEN
      NEW.completed_date := now()::timestamp;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_vehicle_maintenance_before_update_validate ON public.vehicle_maintenance;
CREATE TRIGGER trg_vehicle_maintenance_before_update_validate
BEFORE UPDATE ON public.vehicle_maintenance
FOR EACH ROW
EXECUTE PROCEDURE public.vehicle_maintenance_before_update_validate();

-- 4) Lightweight Activity Logging helper
-- We don't assume exact schema for activity_logs; if not found, we fallback to smart_notifications
CREATE OR REPLACE FUNCTION public.write_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_tag text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  activity_exists boolean := false;
BEGIN
  -- Detect if public.activity_logs table exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'activity_logs'
  ) INTO activity_exists;

  IF activity_exists THEN
    -- Best-effort insert (common columns)
    EXECUTE $sql$
      INSERT INTO public.activity_logs (action, entity_type, entity_id, tag, metadata, created_by)
      VALUES ($1, $2, $3, $4, $5, auth.uid())
    $sql$
    USING p_action, p_entity_type, p_entity_id, p_tag, p_details;
  ELSE
    -- Fallback to smart notification if no activity table
    PERFORM public.create_smart_notification(
      p_title := 'Activity: ' || coalesce(p_action, 'action'),
      p_message := coalesce(p_tag, 'activity') || ' - ' || coalesce(p_entity_type,'entity'),
      p_type := 'info',
      p_category := 'system',
      p_priority := 'low',
      p_reference_type := p_entity_type,
      p_reference_id := p_entity_id,
      p_reference_data := p_details,
      p_user_id := auth.uid(),
      p_target_roles := ARRAY['manager','admin']::text[],
      p_action_required := false
    );
  END IF;
END;
$function$;

-- 5) Activity logging for Work Orders (vehicle_maintenance)
-- Opened
CREATE OR REPLACE FUNCTION public.vehicle_maintenance_after_insert_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  PERFORM public.write_activity(
    p_action := 'work_order_opened',
    p_entity_type := 'vehicle_maintenance',
    p_entity_id := NEW.id,
    p_tag := 'Work Order Opened',
    p_details := jsonb_build_object(
      'vehicle_id', NEW.vehicle_id,
      'status', NEW.status,
      'scheduled_date', NEW.scheduled_date,
      'reported_issue', NEW.reported_issue,
      'odometer_in', NEW.odometer_in
    )
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_vehicle_maintenance_after_insert_activity ON public.vehicle_maintenance;
CREATE TRIGGER trg_vehicle_maintenance_after_insert_activity
AFTER INSERT ON public.vehicle_maintenance
FOR EACH ROW
EXECUTE PROCEDURE public.vehicle_maintenance_after_insert_activity();

-- Closed
CREATE OR REPLACE FUNCTION public.vehicle_maintenance_after_update_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    PERFORM public.write_activity(
      p_action := 'work_order_closed',
      p_entity_type := 'vehicle_maintenance',
      p_entity_id := NEW.id,
      p_tag := 'Work Order Closed',
      p_details := jsonb_build_object(
        'vehicle_id', NEW.vehicle_id,
        'completed_date', NEW.completed_date,
        'odometer_in', NEW.odometer_in,
        'odometer_out', NEW.odometer_out,
        'labor_cost', NEW.labor_cost,
        'parts_cost', NEW.parts_cost,
        'total_cost', COALESCE(NEW.total_cost, NEW.cost)
      )
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_vehicle_maintenance_after_update_activity ON public.vehicle_maintenance;
CREATE TRIGGER trg_vehicle_maintenance_after_update_activity
AFTER UPDATE ON public.vehicle_maintenance
FOR EACH ROW
EXECUTE PROCEDURE public.vehicle_maintenance_after_update_activity();

-- 6) Activity logging for Parts deduction/return on maintenance_parts_used (already deducts inventory via existing trigger)
-- We'll just add activity traces
CREATE OR REPLACE FUNCTION public.maintenance_parts_used_activity()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  action_text text;
  tag_text text;
  item_row record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_text := 'parts_deducted';
    tag_text := 'Parts Deducted';
    SELECT name, sku, part_number INTO item_row FROM public.inventory_items WHERE id = NEW.inventory_item_id;
    PERFORM public.write_activity(
      p_action := action_text,
      p_entity_type := 'maintenance',
      p_entity_id := NEW.maintenance_id,
      p_tag := tag_text,
      p_details := jsonb_build_object(
        'inventory_item_id', NEW.inventory_item_id,
        'part_number', item_row.part_number,
        'item_name', item_row.name,
        'sku', item_row.sku,
        'quantity', NEW.quantity_used,
        'unit_cost', NEW.unit_cost,
        'total_cost', NEW.total_cost
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'parts_returned';
    tag_text := 'Parts Returned';
    SELECT name, sku, part_number INTO item_row FROM public.inventory_items WHERE id = OLD.inventory_item_id;
    PERFORM public.write_activity(
      p_action := action_text,
      p_entity_type := 'maintenance',
      p_entity_id := OLD.maintenance_id,
      p_tag := tag_text,
      p_details := jsonb_build_object(
        'inventory_item_id', OLD.inventory_item_id,
        'part_number', item_row.part_number,
        'item_name', item_row.name,
        'sku', item_row.sku,
        'quantity', OLD.quantity_used,
        'unit_cost', OLD.unit_cost,
        'total_cost', OLD.total_cost
      )
    );
    RETURN OLD;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_maintenance_parts_used_activity_ins ON public.maintenance_parts_used;
CREATE TRIGGER trg_maintenance_parts_used_activity_ins
AFTER INSERT ON public.maintenance_parts_used
FOR EACH ROW
EXECUTE PROCEDURE public.maintenance_parts_used_activity();

DROP TRIGGER IF EXISTS trg_maintenance_parts_used_activity_del ON public.maintenance_parts_used;
CREATE TRIGGER trg_maintenance_parts_used_activity_del
AFTER DELETE ON public.maintenance_parts_used
FOR EACH ROW
EXECUTE PROCEDURE public.maintenance_parts_used_activity();

-- 7) Views to align naming with deliverables without duplicating storage
-- work_orders view mapped to vehicle_maintenance
CREATE OR REPLACE VIEW public.work_orders AS
SELECT
  vm.id,
  vm.vehicle_id,
  vm.reported_issue,
  vm.status,
  COALESCE(vm.scheduled_date::timestamp, vm.created_at) AS opened_at,
  vm.completed_date AS closed_at,
  vm.odometer_in,
  vm.odometer_out,
  COALESCE(vm.total_cost, vm.cost) AS cost,
  vm.assigned_mechanic_id
FROM public.vehicle_maintenance vm;

-- service_schedule view mapped to maintenance_schedules
CREATE OR REPLACE VIEW public.service_schedule AS
SELECT
  ms.id,
  ms.vehicle_id,
  ms.template_id,
  ms.maintenance_type,
  ms.scheduled_date,
  ms.scheduled_mileage,
  ms.priority,
  ms.status,
  ms.notes,
  ms.created_by,
  ms.created_at,
  ms.updated_at
FROM public.maintenance_schedules ms;

-- inventory_transactions view mapped to stock_transactions
CREATE OR REPLACE VIEW public.inventory_transactions AS
SELECT
  st.id,
  st.item_id,
  st.transaction_type,
  st.quantity,
  st.unit_cost,
  st.total_cost,
  st.reference_type,
  st.reference_id,
  st.notes,
  st.performed_by,
  st.transaction_date,
  st.created_at
FROM public.stock_transactions st;

-- Optional convenience view that aliases quantity_available to current_stock and reorder_level to minimum_stock
CREATE OR REPLACE VIEW public.inventory_items_extended AS
SELECT
  ii.id,
  ii.part_number,
  ii.name,
  ii.category_id,
  ii.supplier_id,
  ii.sku,
  ii.barcode,
  ii.unit_of_measure,
  ii.unit_cost,
  ii.selling_price,
  ii.current_stock AS quantity_available,
  ii.minimum_stock AS reorder_level,
  ii.maximum_stock,
  ii.reorder_point,
  ii.location,
  ii.expiry_date,
  ii.is_active,
  ii.created_at,
  ii.updated_at,
  ii.description
FROM public.inventory_items ii;
