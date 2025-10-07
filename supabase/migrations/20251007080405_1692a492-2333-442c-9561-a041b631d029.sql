-- تفعيل امتداد pg_cron لجدولة المهام
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- دالة للتحقق من المركبات القريبة من الانتهاء
CREATE OR REPLACE FUNCTION check_vehicle_expirations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expiring_insurance_count INTEGER := 0;
  expiring_inspection_count INTEGER := 0;
  expiring_registration_count INTEGER := 0;
BEGIN
  -- عد المركبات التي سينتهي تأمينها خلال 30 يوم
  SELECT COUNT(*) INTO expiring_insurance_count
  FROM vehicles
  WHERE insurance_expiry IS NOT NULL
    AND insurance_expiry BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND status IN ('available', 'rented');

  -- عد المركبات التي سينتهي فحصها خلال 30 يوم
  SELECT COUNT(*) INTO expiring_inspection_count
  FROM vehicles
  WHERE inspection_expiry IS NOT NULL
    AND inspection_expiry BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND status IN ('available', 'rented');

  -- عد المركبات التي ستنتهي رخصة سيرها خلال 30 يوم
  SELECT COUNT(*) INTO expiring_registration_count
  FROM vehicles
  WHERE registration_expiry IS NOT NULL
    AND registration_expiry BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND status IN ('available', 'rented');

  -- إنشاء إشعار إذا كان هناك مركبات قريبة من الانتهاء
  IF expiring_insurance_count > 0 OR expiring_inspection_count > 0 OR expiring_registration_count > 0 THEN
    INSERT INTO smart_notifications (
      title,
      message,
      type,
      category,
      priority,
      reference_type,
      target_roles,
      delivery_channels
    ) VALUES (
      'تنبيه: مركبات قريبة من الانتهاء',
      format('تأمين: %s | فحص: %s | رخصة سير: %s', 
        expiring_insurance_count, 
        expiring_inspection_count, 
        expiring_registration_count
      ),
      'warning',
      'vehicles',
      'high',
      'vehicle_expiration',
      ARRAY['admin', 'manager']::text[],
      ARRAY['in_app']::text[]
    );
  END IF;
END;
$$;

-- جدولة فحص الانتهاءات أسبوعياً (كل يوم سبت الساعة 9:00 صباحاً)
-- لتفعيل الجدولة، قم بتشغيل هذا الأمر يدوياً من SQL Editor:
-- SELECT cron.schedule(
--   'check-vehicle-expirations',
--   '0 9 * * 6',
--   'SELECT check_vehicle_expirations();'
-- );

-- جدولة مزامنة يومية من نظام علم في الساعة 2:00 صباحاً
-- لتفعيل الجدولة، قم بتشغيل هذا الأمر يدوياً من SQL Editor:
-- SELECT cron.schedule(
--   'elm-daily-sync',
--   '0 2 * * *',
--   $$
--   SELECT net.http_post(
--     url:='https://oezugvqviogpcqphkbuf.supabase.co/functions/v1/elm-sync',
--     headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lenVndnF2aW9ncGNxcGhrYnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTY2MTQsImV4cCI6MjA2ODA5MjYxNH0.lLULsNuyP0ijij9Clg908nj9U2V8bgTIW4cJ6cfr59E"}'::jsonb,
--     body:='{"sync_type": "scheduled"}'::jsonb
--   ) as request_id;
--   $$
-- );

COMMENT ON FUNCTION check_vehicle_expirations() IS 'دالة للتحقق من المركبات القريبة من انتهاء الصلاحية وإرسال إشعارات';