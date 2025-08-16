
-- مسح بيانات تجريبية بشكل آمن دون حذف الجداول أو المساس بالمستخدمين/العملاء/المركبات/العقود
-- يراعي أن بعض الجداول قد لا تكون موجودة، لذا يتم الفحص قبل التنفيذ
BEGIN;

DO $$
DECLARE
  tables_to_truncate text[] := ARRAY[
    -- فواتير ومشتقاتها
    'invoice_items','invoices',

    -- أوامر شراء ومشتقاتها
    'purchase_order_items','purchase_orders',

    -- المخزون
    'stock_transactions','inventory_items','inventory_categories',

    -- مزودون وفنيون (ميكانيكيون)
    'mechanics','suppliers',

    -- بيانات المركبات الملحقة التي تم توليدها تجريبياً
    'vehicle_images','vehicle_location',

    -- تنبؤات/لقطات مالية تجريبية
    'financial_ai_predictions','profitability_snapshots',

    -- الصيانة (قد لا تكون كل الجداول موجودة — يتم الفحص قبل التنفيذ)
    'maintenance_work_hours','maintenance_parts_used','maintenance_oils_used',
    'vehicle_maintenance','maintenance_schedules',

    -- بيانات تجريبية متنوعة
    'customer_guarantors','customer_ratings','smart_alert_log',

    -- سندات الصرف التي قد تكون تولدت تلقائياً مع بيانات الاختبار
    'payment_vouchers'
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
