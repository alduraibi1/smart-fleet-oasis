
-- إضافة قيود جديدة لجدول العقود
ALTER TABLE rental_contracts 
ADD CONSTRAINT min_deposit_amount CHECK (deposit_amount >= 1000),
ADD CONSTRAINT min_contract_duration_days CHECK (
  EXTRACT(DAY FROM end_date - start_date) >= 90
);

-- إنشاء عرض موجز لحسابات العملاء
CREATE OR REPLACE VIEW customer_accounts_summary AS
SELECT 
  c.id,
  c.name,
  c.phone,
  c.email,
  -- إجمالي المبالغ المدفوعة
  COALESCE(SUM(pr.amount), 0) as total_paid,
  -- إجمالي مبالغ العقود
  COALESCE(SUM(rc.total_amount), 0) as total_contracted,
  -- المبالغ المتبقية
  COALESCE(SUM(rc.total_amount), 0) - COALESCE(SUM(pr.amount), 0) as outstanding_balance,
  -- عدد العقود النشطة
  COUNT(CASE WHEN rc.status = 'active' THEN 1 END) as active_contracts,
  -- عدد العقود المتأخرة (انتهت ولكن لم تُرجع)
  COUNT(CASE WHEN rc.status = 'active' AND rc.end_date < CURRENT_DATE THEN 1 END) as overdue_contracts,
  -- أقدم عقد متأخر
  MIN(CASE WHEN rc.status = 'active' AND rc.end_date < CURRENT_DATE THEN rc.end_date END) as oldest_overdue_date,
  -- حالة العميل
  CASE 
    WHEN COALESCE(SUM(rc.total_amount), 0) - COALESCE(SUM(pr.amount), 0) > 1500 THEN 'high_risk'
    WHEN COALESCE(SUM(rc.total_amount), 0) - COALESCE(SUM(pr.amount), 0) > 500 THEN 'medium_risk'
    WHEN COALESCE(SUM(rc.total_amount), 0) - COALESCE(SUM(pr.amount), 0) > 0 THEN 'low_risk'
    ELSE 'good_standing'
  END as risk_status
FROM customers c
LEFT JOIN rental_contracts rc ON c.id = rc.customer_id
LEFT JOIN payment_receipts pr ON rc.id = pr.contract_id AND pr.status = 'confirmed'
GROUP BY c.id, c.name, c.phone, c.email;

-- دالة فحص وإشعار المتأخرات
CREATE OR REPLACE FUNCTION check_and_notify_customer_arrears()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  customer_record RECORD;
  notification_count INTEGER := 0;
  arrears_amount NUMERIC;
  overdue_days INTEGER;
BEGIN
  -- البحث عن العملاء الذين لديهم متأخرات أكثر من 1500 ريال
  FOR customer_record IN 
    SELECT * FROM customer_accounts_summary 
    WHERE outstanding_balance > 1500 
    AND overdue_contracts > 0
  LOOP
    -- حساب أيام التأخير
    overdue_days := CURRENT_DATE - customer_record.oldest_overdue_date;
    arrears_amount := customer_record.outstanding_balance;
    
    -- فحص إذا لم يتم إرسال إشعار خلال آخر 7 أيام
    IF NOT EXISTS (
      SELECT 1 FROM smart_notifications 
      WHERE reference_type = 'customer_arrears'
      AND reference_id = customer_record.id
      AND created_at > CURRENT_DATE - INTERVAL '7 days'
    ) THEN
      -- إنشاء إشعار ذكي
      PERFORM create_smart_notification(
        p_title := 'تنبيه: عميل متعثر في السداد',
        p_message := 'العميل ' || customer_record.name || ' لديه متأخرات ' || arrears_amount || ' ريال (' || overdue_days || ' يوم تأخير). يتطلب اتخاذ إجراء فوري.',
        p_type := 'warning',
        p_category := 'arrears',
        p_priority := CASE 
          WHEN arrears_amount > 5000 THEN 'high'
          WHEN arrears_amount > 3000 THEN 'medium'
          ELSE 'medium'
        END,
        p_reference_type := 'customer_arrears',
        p_reference_id := customer_record.id,
        p_reference_data := jsonb_build_object(
          'customer_name', customer_record.name,
          'customer_phone', customer_record.phone,
          'arrears_amount', arrears_amount,
          'overdue_days', overdue_days,
          'active_contracts', customer_record.active_contracts,
          'overdue_contracts', customer_record.overdue_contracts,
          'risk_status', customer_record.risk_status
        ),
        p_target_roles := ARRAY['admin', 'manager']::text[],
        p_action_required := true,
        p_delivery_channels := ARRAY['in_app', 'email']::text[]
      );
      
      notification_count := notification_count + 1;
    END IF;
  END LOOP;
  
  RETURN notification_count;
END;
$$;

-- إنشاء مهمة جدولة يومية للفحص في الساعة 8 صباحاً
SELECT cron.schedule(
  'customer-arrears-check',
  '0 8 * * *', -- يومياً في الساعة 8 صباحاً
  $$
  SELECT check_and_notify_customer_arrears();
  $$
);

-- إنشاء دالة للتحقق من قيود العقد قبل الإدراج
CREATE OR REPLACE FUNCTION validate_contract_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  contract_days INTEGER;
BEGIN
  -- حساب عدد أيام العقد
  contract_days := EXTRACT(DAY FROM NEW.end_date - NEW.start_date);
  
  -- التحقق من الحد الأدنى للمدة (90 يوماً)
  IF contract_days < 90 THEN
    RAISE EXCEPTION 'لا يمكن إنشاء عقد لمدة أقل من 90 يوماً. المدة المحددة: % يوماً', contract_days;
  END IF;
  
  -- التحقق من الحد الأدنى للوديعة (1000 ريال)
  IF COALESCE(NEW.deposit_amount, 0) < 1000 THEN
    RAISE EXCEPTION 'الحد الأدنى للوديعة هو 1000 ريال. المبلغ المحدد: % ريال', COALESCE(NEW.deposit_amount, 0);
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء المشغل للتحقق من قيود العقد
DROP TRIGGER IF EXISTS validate_contract_trigger ON rental_contracts;
CREATE TRIGGER validate_contract_trigger 
  BEFORE INSERT OR UPDATE ON rental_contracts
  FOR EACH ROW EXECUTE FUNCTION validate_contract_before_insert();

-- إضافة فهرس لتحسين أداء الاستعلامات
CREATE INDEX IF NOT EXISTS idx_rental_contracts_customer_status 
ON rental_contracts(customer_id, status, end_date);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_contract_status 
ON payment_receipts(contract_id, status);
