
-- تعديل الدالة لاستبدال نوع الملخص النهائي من 'system_check' إلى 'info'
CREATE OR REPLACE FUNCTION check_and_notify_customer_arrears()
RETURNS INTEGER AS $$
DECLARE
  customer_record RECORD;
  notification_count INTEGER := 0;
  existing_notification_id UUID;
BEGIN
  -- البحث عن العملاء المتعثرين (متأخرات > 1500 ريال) بعد مهلة 14 يوم
  FOR customer_record IN 
    SELECT * FROM customer_accounts_summary 
    WHERE outstanding_balance > 1500 
      AND overdue_contracts > 0
  LOOP
    -- منع التكرار خلال 24 ساعة
    SELECT id INTO existing_notification_id
    FROM smart_notifications 
    WHERE reference_type = 'customer'
      AND reference_id = customer_record.id
      AND type = 'payment_overdue'
      AND category = 'payments'
      AND created_at > NOW() - INTERVAL '24 hours'
    LIMIT 1;
    
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
        NULL,
        ARRAY['manager','admin']::text[],
        true,
        ARRAY['in_app','email']::text[],
        jsonb_build_object(
          'outstanding_balance', customer_record.outstanding_balance,
          'overdue_contracts', customer_record.overdue_contracts,
          'oldest_overdue_date', customer_record.oldest_overdue_date,
          'risk_status', customer_record.risk_status,
          'customer_phone', customer_record.phone,
          'suggested_actions', ARRAY['سحب المركبة','إنهاء العقد','التحصيل القانوني']
        )
      );
      notification_count := notification_count + 1;
    END IF;
  END LOOP;

  -- إدراج ملخص العملية كتنبيه معلوماتي مسموح بالنوع 'info'
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
    'info',          -- بدلاً من system_check
    'system',
    'low',
    'system',
    ARRAY['in_app']::text[]
  );

  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
