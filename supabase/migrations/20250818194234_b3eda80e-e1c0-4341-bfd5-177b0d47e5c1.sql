
-- المرحلة 1: فرض حد أدنى للوديعة 1000 ريال
-- تحديث القيم المخالفة الحالية
UPDATE rental_contracts 
SET deposit_amount = 1000 
WHERE deposit_amount IS NULL OR deposit_amount < 1000;

-- تعديل الجدول لفرض حد أدنى افتراضي
ALTER TABLE rental_contracts 
ALTER COLUMN deposit_amount SET DEFAULT 1000;

-- إضافة قيد التحقق لضمان الحد الأدنى
ALTER TABLE rental_contracts 
ADD CONSTRAINT check_minimum_deposit 
CHECK (deposit_amount >= 1000);

-- المرحلة 2: منع العقود أقل من 90 يوماً
CREATE OR REPLACE FUNCTION validate_contract_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من مدة العقد (90 يوم حد أدنى)
  IF (NEW.end_date - NEW.start_date) < 90 THEN
    RAISE EXCEPTION 'مدة العقد يجب أن تكون 90 يوماً على الأقل. المدة الحالية: % يوم', 
      (NEW.end_date - NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء المشغل للتحقق قبل الإدراج والتحديث
DROP TRIGGER IF EXISTS check_contract_duration ON rental_contracts;
CREATE TRIGGER check_contract_duration
  BEFORE INSERT OR UPDATE ON rental_contracts
  FOR EACH ROW
  EXECUTE FUNCTION validate_contract_duration();

-- المرحلة 3: إنشاء View ملخص حساب العميل
CREATE OR REPLACE VIEW customer_accounts_summary AS
SELECT 
  c.id,
  c.name,
  c.phone,
  c.email,
  COALESCE(SUM(rc.total_amount), 0) as total_contracted,
  COALESCE(SUM(rc.paid_amount), 0) as total_paid,
  COALESCE(SUM(rc.total_amount - rc.paid_amount), 0) as outstanding_balance,
  COUNT(rc.id) as active_contracts,
  COUNT(CASE 
    WHEN rc.end_date + INTERVAL '14 days' < CURRENT_DATE 
         AND (rc.total_amount - rc.paid_amount) > 0 
    THEN 1 
  END) as overdue_contracts,
  MIN(CASE 
    WHEN rc.end_date + INTERVAL '14 days' < CURRENT_DATE 
         AND (rc.total_amount - rc.paid_amount) > 0 
    THEN rc.end_date 
  END) as oldest_overdue_date,
  CASE 
    WHEN COALESCE(SUM(CASE 
      WHEN rc.end_date + INTERVAL '14 days' < CURRENT_DATE 
           AND (rc.total_amount - rc.paid_amount) > 0 
      THEN (rc.total_amount - rc.paid_amount) 
      ELSE 0 
    END), 0) > 1500 THEN 'high_risk'
    WHEN COALESCE(SUM(CASE 
      WHEN rc.end_date + INTERVAL '14 days' < CURRENT_DATE 
           AND (rc.total_amount - rc.paid_amount) > 0 
      THEN (rc.total_amount - rc.paid_amount) 
      ELSE 0 
    END), 0) > 500 THEN 'medium_risk'
    ELSE 'low_risk'
  END as risk_status
FROM customers c
LEFT JOIN rental_contracts rc ON c.id = rc.customer_id
WHERE rc.status IN ('active', 'completed')
GROUP BY c.id, c.name, c.phone, c.email;

-- المرحلة 4: دالة فحص المتعثرات وإنشاء التنبيهات
CREATE OR REPLACE FUNCTION check_and_notify_customer_arrears()
RETURNS INTEGER AS $$
DECLARE
  customer_record RECORD;
  notification_count INTEGER := 0;
  existing_notification_id UUID;
BEGIN
  -- البحث عن العملاء المتعثرين (متأخرات > 1500 ريال)
  FOR customer_record IN 
    SELECT * FROM customer_accounts_summary 
    WHERE outstanding_balance > 1500 
    AND overdue_contracts > 0
  LOOP
    -- التحقق من عدم وجود تنبيه مماثل خلال آخر 24 ساعة
    SELECT id INTO existing_notification_id
    FROM smart_notifications 
    WHERE reference_type = 'customer'
    AND reference_id = customer_record.id
    AND type = 'payment_overdue'
    AND category = 'payments'
    AND created_at > NOW() - INTERVAL '24 hours'
    LIMIT 1;
    
    -- إنشاء تنبيه جديد إذا لم يوجد تنبيه مماثل
    IF existing_notification_id IS NULL THEN
      INSERT INTO smart_notifications (
        title,
        message,
        type,
        category,
        priority,
        reference_type,
        reference_id,
        user_id,
        target_roles,
        action_required,
        delivery_channels,
        reference_data
      ) VALUES (
        'عميل متعثر في السداد',
        'العميل ' || customer_record.name || ' لديه متأخرات بقيمة ' || 
        customer_record.outstanding_balance || ' ريال تجاوزت المهلة المسموحة. يتطلب اتخاذ إجراء فوري.',
        'payment_overdue',
        'payments',
        'urgent',
        'customer',
        customer_record.id,
        NULL, -- سيتم إرساله لجميع المستخدمين
        ARRAY['manager', 'admin']::text[],
        true, -- يتطلب إجراء
        ARRAY['in_app', 'email']::text[],
        jsonb_build_object(
          'outstanding_balance', customer_record.outstanding_balance,
          'overdue_contracts', customer_record.overdue_contracts,
          'oldest_overdue_date', customer_record.oldest_overdue_date,
          'risk_status', customer_record.risk_status,
          'customer_phone', customer_record.phone,
          'suggested_actions', ARRAY['سحب المركبة', 'إنهاء العقد', 'التحصيل القانوني']
        )
      );
      
      notification_count := notification_count + 1;
    END IF;
  END LOOP;
  
  -- تسجيل نتيجة العملية
  INSERT INTO smart_notifications (
    title,
    message,
    type,
    category,
    priority,
    reference_type,
    delivery_channels
  ) VALUES (
    'فحص المتعثرات اليومي',
    'تم فحص حسابات العملاء وإنشاء ' || notification_count || ' تنبيه جديد للمتعثرين',
    'system_check',
    'system',
    'low',
    'system',
    ARRAY['in_app']::text[]
  );
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- المرحلة 5: تمكين pg_cron extension (إذا لم يكن مُفعل)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- جدولة فحص المتعثرات يومياً في الساعة 08:00 صباحاً
SELECT cron.schedule(
  'daily-customer-arrears-check',
  '0 8 * * *', -- كل يوم في الساعة 08:00
  'SELECT check_and_notify_customer_arrears();'
);

-- إنشاء فهرس لتحسين أداء الاستعلامات
CREATE INDEX IF NOT EXISTS idx_rental_contracts_customer_dates 
ON rental_contracts(customer_id, end_date, status);

CREATE INDEX IF NOT EXISTS idx_smart_notifications_reference 
ON smart_notifications(reference_type, reference_id, type, created_at);

-- تشغيل فحص أولي لاختبار النظام
SELECT check_and_notify_customer_arrears() as initial_notifications_created;
