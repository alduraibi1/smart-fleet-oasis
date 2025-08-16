
-- 1) إضافة حقول دعم الاستثناء على العقود
ALTER TABLE rental_contracts 
  ADD COLUMN IF NOT EXISTS override_allowed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS override_reason text,
  ADD COLUMN IF NOT EXISTS override_by uuid;

-- 2) تفعيل الحجب لعقد الإيجار إذا كانت الاستمارة منتهية
-- وظيفة تحقق قبل الإدراج
CREATE OR REPLACE FUNCTION public.enforce_vehicle_registration_for_contract()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reg_expiry date;
BEGIN
  -- الحصول على تاريخ انتهاء التسجيل للمركبة
  SELECT registration_expiry INTO v_reg_expiry
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  -- إذا كانت الاستمارة منتهية
  IF v_reg_expiry IS NOT NULL AND v_reg_expiry < CURRENT_DATE THEN
    -- إذا لم يوجد استثناء مُفعل -> منع
    IF COALESCE(NEW.override_allowed, false) = false THEN
      RAISE EXCEPTION 'Vehicle registration expired; contract creation blocked. Use override with reason if you have permission.';
    END IF;

    -- في حال الاستثناء، يجب توفر سبب وصلاحية الدور
    IF NEW.override_reason IS NULL OR length(trim(NEW.override_reason)) = 0 THEN
      RAISE EXCEPTION 'Override reason is required when allowing rental exception.';
    END IF;

    -- السماح فقط لأدوار الإدارة
    IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')) THEN
      RAISE EXCEPTION 'You do not have permission to allow rental exception.';
    END IF;

    -- تعيين المستخدم المنفذ إن لم يُمرر
    IF NEW.override_by IS NULL THEN
      NEW.override_by := auth.uid();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- مُشغل قبل الإدراج على عقود الإيجار
DROP TRIGGER IF EXISTS trg_enforce_vehicle_registration_before_insert ON rental_contracts;
CREATE TRIGGER trg_enforce_vehicle_registration_before_insert
BEFORE INSERT ON rental_contracts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_vehicle_registration_for_contract();

-- 3) تسجيل عملية الاستثناء في سجل الأنشطة
CREATE OR REPLACE FUNCTION public.log_registration_override()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.override_allowed = true THEN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, tag, details, notes, created_at)
    VALUES (
      COALESCE(NEW.override_by, auth.uid()),
      'contract_create_override',
      'vehicle',
      NEW.vehicle_id,
      'Registration Override',
      jsonb_build_object(
        'contract_id', NEW.id,
        'override_reason', NEW.override_reason
      ),
      NEW.override_reason,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- مُشغل بعد الإدراج لتسجيل الاستثناء
DROP TRIGGER IF EXISTS trg_log_registration_override_after_insert ON rental_contracts;
CREATE TRIGGER trg_log_registration_override_after_insert
AFTER INSERT ON rental_contracts
FOR EACH ROW
EXECUTE FUNCTION public.log_registration_override();

-- 4) فهارس لتحسين تصفية السجل حسب الوسم
CREATE INDEX IF NOT EXISTS idx_activity_logs_tag ON activity_logs(tag);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
