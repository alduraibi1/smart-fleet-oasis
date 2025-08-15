
-- 1) إنشاء جداول مراكز التكلفة والربط مع الكيانات (مركبة/عميل)
CREATE TABLE IF NOT EXISTS public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_code VARCHAR(50) UNIQUE NOT NULL,
  center_name TEXT NOT NULL,
  center_type VARCHAR(30) NOT NULL, -- vehicle | customer | owner | department | project
  entity_id UUID,                   -- (اختياري) ربط مباشر مع الكيان
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cost_center_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(30) NOT NULL,       -- vehicle | customer | owner | contract
  entity_id UUID NOT NULL,
  cost_center_id UUID NOT NULL REFERENCES public.cost_centers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

-- فهارس
CREATE INDEX IF NOT EXISTS idx_cost_centers_type ON public.cost_centers(center_type);
CREATE INDEX IF NOT EXISTS idx_cost_centers_entity ON public.cost_centers(entity_id);
CREATE INDEX IF NOT EXISTS idx_cc_mappings_entity ON public.cost_center_mappings(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cc_mappings_cc ON public.cost_center_mappings(cost_center_id);

-- 2) تفعيل RLS وسياسات الأمان (مستخدمون مسجلون فقط)
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_center_mappings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cost_centers' AND policyname = 'Authenticated users can manage cost centers'
  ) THEN
    CREATE POLICY "Authenticated users can manage cost centers"
      ON public.cost_centers
      FOR ALL
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'cost_center_mappings' AND policyname = 'Authenticated users can manage cost center mappings'
  ) THEN
    CREATE POLICY "Authenticated users can manage cost center mappings"
      ON public.cost_center_mappings
      FOR ALL
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END$$;

-- 3) دالة مساعدة: إنشاء/ضمان وجود مركز تكلفة للكيان المعطى
CREATE OR REPLACE FUNCTION public.ensure_cost_center_for_entity(
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_center_code TEXT DEFAULT NULL,
  p_center_name TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_cc UUID;
  generated_code TEXT;
  generated_name TEXT;
  new_cc UUID;
BEGIN
  -- تحقق من وجود ربط مسبق
  SELECT cost_center_id INTO existing_cc
  FROM public.cost_center_mappings
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;

  IF existing_cc IS NOT NULL THEN
    RETURN existing_cc;
  END IF;

  -- توليد كود واسم افتراضيين إذا لم يمررا
  IF p_center_code IS NULL THEN
    generated_code := CASE p_entity_type
      WHEN 'vehicle' THEN 'VH-' || substr(p_entity_id::text, 1, 8)
      WHEN 'customer' THEN 'CU-' || substr(p_entity_id::text, 1, 8)
      WHEN 'owner' THEN 'OW-' || substr(p_entity_id::text, 1, 8)
      WHEN 'contract' THEN 'CT-' || substr(p_entity_id::text, 1, 8)
      ELSE 'CC-' || substr(p_entity_id::text, 1, 8)
    END;
  ELSE
    generated_code := p_center_code;
  END IF;

  IF p_center_name IS NULL THEN
    generated_name := initcap(p_entity_type) || ' ' || substr(p_entity_id::text, 1, 8);
  ELSE
    generated_name := p_center_name;
  END IF;

  -- إنشاء مركز التكلفة
  INSERT INTO public.cost_centers(center_code, center_name, center_type, entity_id)
  VALUES (generated_code, generated_name, p_entity_type, p_entity_id)
  RETURNING id INTO new_cc;

  -- ربطه بالكيان
  INSERT INTO public.cost_center_mappings(entity_type, entity_id, cost_center_id)
  VALUES (p_entity_type, p_entity_id, new_cc);

  RETURN new_cc;
END;
$$;

-- 4) مشغلات لإنشاء مراكز تكلفة تلقائياً للمركبات والعملاء عند الإضافة
-- ملاحظة: نفترض وجود الأعمدة المشار لها (vehicles: id, plate_number, brand, model) و (customers: id, name)
CREATE OR REPLACE FUNCTION public.create_vehicle_cost_center()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  name TEXT;
BEGIN
  code := 'VH-' || NEW.plate_number;
  name := coalesce(NEW.brand, '') || ' ' || coalesce(NEW.model, '') || ' - ' || coalesce(NEW.plate_number, '');
  PERFORM public.ensure_cost_center_for_entity('vehicle', NEW.id, code, name);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_customer_cost_center()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  name TEXT;
BEGIN
  code := 'CU-' || substr(NEW.id::text, 1, 8);
  name := coalesce(NEW.name, 'عميل') || ' (' || substr(NEW.id::text, 1, 6) || ')';
  PERFORM public.ensure_cost_center_for_entity('customer', NEW.id, code, name);
  RETURN NEW;
END;
$$;

-- إنشاء المشغلات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vehicles_create_cost_center'
  ) THEN
    CREATE TRIGGER trg_vehicles_create_cost_center
    AFTER INSERT ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.create_vehicle_cost_center();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_customers_create_cost_center'
  ) THEN
    CREATE TRIGGER trg_customers_create_cost_center
    AFTER INSERT ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.create_customer_cost_center();
  END IF;
END$$;

-- 5) تفعيل المشغلات المحاسبية التلقائية الموجودة مسبقاً (الدوال جاهزة لكن دون تفعيل)
-- إنشاء سند قبض تلقائي عند إنشاء عقد جديد (إن توفرت قيمة paid_amount > 0 داخل الدالة)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contract_create_receipt'
  ) THEN
    CREATE TRIGGER trg_contract_create_receipt
    AFTER INSERT ON public.rental_contracts
    FOR EACH ROW EXECUTE FUNCTION public.create_receipt_for_contract();
  END IF;
END$$;

-- إنشاء سند صرف عند اكتمال الصيانة وتحديد التكلفة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_maintenance_create_voucher'
  ) THEN
    CREATE TRIGGER trg_maintenance_create_voucher
    AFTER UPDATE ON public.vehicle_maintenance
    FOR EACH ROW EXECUTE FUNCTION public.create_voucher_for_maintenance();
  END IF;
END$$;

-- إنشاء سند عمولة مالك تلقائياً بعد إنشاء سند قبض مرتبط بعقد/مركبة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_receipt_owner_commission'
  ) THEN
    CREATE TRIGGER trg_receipt_owner_commission
    AFTER INSERT ON public.payment_receipts
    FOR EACH ROW EXECUTE FUNCTION public.create_owner_commission_voucher();
  END IF;
END$$;

-- 6) تحديث حقول updated_at تلقائياً عند التعديل على الجداول الجديدة
-- وجود دوال update_updated_at_column مسبقاً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cc_update_updated_at'
  ) THEN
    CREATE TRIGGER trg_cc_update_updated_at
    BEFORE UPDATE ON public.cost_centers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ccm_update_updated_at'
  ) THEN
    CREATE TRIGGER trg_ccm_update_updated_at
    BEFORE UPDATE ON public.cost_center_mappings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;
