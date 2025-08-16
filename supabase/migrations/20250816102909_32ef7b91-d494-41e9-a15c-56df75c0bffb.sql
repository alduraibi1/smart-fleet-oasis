
-- مسح موسّع للبيانات التجريبية مع الحفاظ على المستخدمين/العملاء/المركبات/العقود/الصلاحيات
BEGIN;

DO $$
DECLARE
  tables_to_truncate text[] := ARRAY[
    -- إشعارات وقوالب وتفضيلات
    'notification_history',
    'saved_report_settings',
    'scheduled_reports',
    'user_notification_preferences',
    'notification_preferences',
    'notification_settings',
    'notification_templates',

    -- القواعد الذكية والتنبيهات
    'smart_alert_rules',
    'smart_alert_log',

    -- تحليلات وتسعير ديناميكي
    'dynamic_pricing_rules',
    'behavioral_analytics',

    -- تحذيرات وتقارير مالية مساعدة
    'financial_warnings',

    -- محاسبة: مراكز تكلفة ودليل حسابات
    'cost_centers',
    'chart_of_accounts',

    -- تنبؤات ولقطات ربحية
    'financial_ai_predictions',
    'profitability_snapshots',

    -- مستندات مالية
    'invoice_items',
    'invoices',
    'payment_vouchers',
    'purchase_order_items',
    'purchase_orders',

    -- المخزون
    'stock_transactions',
    'inventory_items',
    'inventory_categories',

    -- الصيانة (قد لا تكون كل الجداول موجودة)
    'maintenance_work_hours',
    'maintenance_parts_used',
    'maintenance_oils_used',
    'vehicle_maintenance',
    'maintenance_schedules',

    -- بيانات ملحقة بالمركبات
    'vehicle_images',
    'vehicle_location',

    -- بيانات متنوعة للعملاء
    'customer_guarantors',
    'customer_ratings',

    -- مزودون وفنيون (في حال كانت بياناتهم تجريبية)
    'mechanics',
    'suppliers'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tables_to_truncate LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('TRUNCATE TABLE public.%I CASCADE', t);
    END IF;
  END LOOP;
END $$;

COMMIT;
