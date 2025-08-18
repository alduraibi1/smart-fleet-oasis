
-- 1) ضمان حد أدنى للوديعة 1000 ريال
UPDATE public.rental_contracts
SET deposit_amount = 1000
WHERE deposit_amount IS NULL OR deposit_amount < 1000;

ALTER TABLE public.rental_contracts
  ALTER COLUMN deposit_amount SET DEFAULT 1000;

ALTER TABLE public.rental_contracts
  ALTER COLUMN deposit_amount SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_rental_contracts_min_deposit'
  ) THEN
    ALTER TABLE public.rental_contracts
      ADD CONSTRAINT chk_rental_contracts_min_deposit CHECK (deposit_amount >= 1000);
  END IF;
END $$;

-- 2) منع إنشاء/تعديل عقد أقل من 90 يوم
CREATE OR REPLACE FUNCTION public.enforce_min_contract_duration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- نفذ التحقق فقط إذا كانت التواريخ متوفرة
  IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
    IF (NEW.end_date - NEW.start_date) < 90 THEN
      RAISE EXCEPTION 'مدة العقد يجب ألا تقل عن 90 يوماً (3 شهور)';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_rental_contracts_enforce_min_duration ON public.rental_contracts;

CREATE TRIGGER trg_rental_contracts_enforce_min_duration
BEFORE INSERT OR UPDATE ON public.rental_contracts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_min_contract_duration();

-- 3) View: ملخص حساب العميل
CREATE OR REPLACE VIEW public.customer_accounts_summary AS
WITH contract_balances AS (
  SELECT
    customer_id,
    id AS contract_id,
    total_amount,
    COALESCE(paid_amount, 0) AS paid_amount,
    COALESCE(outstanding_amount, COALESCE(remaining_amount, total_amount - COALESCE(paid_amount, 0))) AS outstanding_amount,
    end_date,
    status
  FROM public.rental_contracts
)
SELECT
  customer_id,
  COUNT(*) AS total_contracts,
  COUNT(*) FILTER (WHERE status IN ('active','ongoing')) AS active_contracts,
  COALESCE(SUM(total_amount), 0) AS total_contract_value,
  COALESCE(SUM(paid_amount), 0) AS total_paid,
  COALESCE(SUM(outstanding_amount), 0) AS outstanding_amount,
  COALESCE(
    SUM(
      CASE
        WHEN (end_date + INTERVAL '14 days')::timestamptz < now() AND outstanding_amount > 0
        THEN outstanding_amount
        ELSE 0
      END
    ), 0
  ) AS overdue_amount,
  MAX(end_date) AS last_contract_end_date
FROM contract_balances
GROUP BY customer_id;

-- 4) دالة: فحص المتعثرات وإصدار تنبيهات ذكية (smart_notifications)
CREATE OR REPLACE FUNCTION public.check_and_notify_customer_arrears(
  p_threshold NUMERIC DEFAULT 1500,
  p_grace_days INT DEFAULT 14
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  rec RECORD;
  notified_count INT := 0;
BEGIN
  FOR rec IN
    SELECT cas.customer_id, cas.overdue_amount
    FROM public.customer_accounts_summary cas
    WHERE cas.overdue_amount > p_threshold
  LOOP
    -- منع التكرار خلال 24 ساعة لنفس العميل
    IF NOT EXISTS (
      SELECT 1 FROM public.smart_notifications sn
      WHERE sn.reference_type = 'customer'
        AND sn.reference_id = rec.customer_id
        AND sn.category = 'payments'
        AND sn.type = 'payment_overdue'
        AND sn.created_at > now() - INTERVAL '24 hours'
    ) THEN
      PERFORM public.create_smart_notification(
        p_title := 'تنبيه تعثر سداد للعميل',
        p_message := 'العميل متعثر بمبلغ ' || rec.overdue_amount || ' ريال (أكبر من ' || p_threshold || ' ريال) بعد مهلة 14 يوم. يُرجى اتخاذ الإجراء: سحب المركبة أو إنهاء العقد.',
        p_type := 'payment_overdue',
        p_category := 'payments',
        p_priority := 'high',
        p_reference_type := 'customer',
        p_reference_id := rec.customer_id,
        p_reference_data := jsonb_build_object('overdue_amount', rec.overdue_amount, 'threshold', p_threshold),
        p_target_roles := ARRAY['admin','manager','finance']::text[],
        p_action_required := true
      );
      notified_count := notified_count + 1;
    END IF;
  END LOOP;

  RETURN notified_count;
END;
$function$;

-- 5) تشغيل فحص المتعثرات يومياً الساعة 08:00 صباحاً (يتطلب pg_cron)
-- ملاحظة: إذا كانت الوظيفة موجودة مسبقاً بنفس الاسم فستفشل. يمكن تغيير الاسم أو حذف الجدولة القديمة يدوياً.
SELECT
  cron.schedule(
    'daily-customer-arrears-check',
    '0 8 * * *',
    $$ SELECT public.check_and_notify_customer_arrears(); $$
  );
