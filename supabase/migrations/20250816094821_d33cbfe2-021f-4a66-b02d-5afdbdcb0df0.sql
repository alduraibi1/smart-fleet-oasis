
-- =========================
-- 1) تفعيل المشغلات (Triggers)
-- =========================

-- ملاحظة: نستخدم DO blocks مع فحص وجود الجدول/المشغل لتجنب الأخطاء في حال وُجد مسبقًا

-- rental_contracts: إنشاء سند قبض تلقائي + تحديث إحصائيات العميل عند الإدراج/الحذف
DO $$
BEGIN
  IF to_regclass('public.rental_contracts') IS NOT NULL THEN
    -- إنشاء سند قبض عند إدراج عقد جديد (إذا كان هناك مبلغ مدفوع)
    BEGIN
      CREATE TRIGGER trg_rcpt_on_contract_insert
      AFTER INSERT ON public.rental_contracts
      FOR EACH ROW EXECUTE FUNCTION public.create_receipt_for_contract();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    -- تحديث إحصاءات العميل عند إدراج/حذف عقد
    BEGIN
      CREATE TRIGGER trg_customer_stats_on_contract_change
      AFTER INSERT OR DELETE ON public.rental_contracts
      FOR EACH ROW EXECUTE FUNCTION public.update_customer_rental_stats();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$ LANGUAGE plpgsql;

-- payment_vouchers: التحقق من رصيد المالك قبل الصرف
DO $$
BEGIN
  IF to_regclass('public.payment_vouchers') IS NOT NULL THEN
    BEGIN
      CREATE TRIGGER trg_check_balance_before_voucher
      BEFORE INSERT OR UPDATE ON public.payment_vouchers
      FOR EACH ROW EXECUTE FUNCTION public.check_balance_before_voucher();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$ LANGUAGE plpgsql;

-- vehicles: إنشاء مركز تكلفة تلقائي
DO $$
BEGIN
  IF to_regclass('public.vehicles') IS NOT NULL THEN
    BEGIN
      CREATE TRIGGER trg_vehicle_cost_center
      AFTER INSERT ON public.vehicles
      FOR EACH ROW EXECUTE FUNCTION public.create_vehicle_cost_center();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$ LANGUAGE plpgsql;

-- customers: إنشاء مركز تكلفة تلقائي
DO $$
BEGIN
  IF to_regclass('public.customers') IS NOT NULL THEN
    BEGIN
      CREATE TRIGGER trg_customer_cost_center
      AFTER INSERT ON public.customers
      FOR EACH ROW EXECUTE FUNCTION public.create_customer_cost_center();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$ LANGUAGE plpgsql;

-- vehicle_maintenance: إنشاء سند صرف للصيانة عند التحول إلى completed + تحديث updated_at
DO $$
BEGIN
  IF to_regclass('public.vehicle_maintenance') IS NOT NULL THEN
    BEGIN
      CREATE TRIGGER trg_voucher_on_maintenance_complete
      AFTER UPDATE ON public.vehicle_maintenance
      FOR EACH ROW EXECUTE FUNCTION public.create_voucher_for_maintenance();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      CREATE TRIGGER trg_vehicle_maintenance_touch_updated_at
      BEFORE UPDATE ON public.vehicle_maintenance
      FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_timestamps();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$ LANGUAGE plpgsql;

-- maintenance_work_hours: إعادة احتساب تكلفة الصيانة عند أي تغيير
DO $$
BEGIN
  IF to_regclass('public.maintenance_work_hours') IS NOT NULL THEN
    BEGIN
      CREATE TRIGGER trg_recalc_cost_on_work_hours
      AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_work_hours
      FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_cost();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$ LANGUAGE plpgsql;

-- maintenance_parts_used: خصم/إرجاع المخزون + إعادة احتساب التكلفة
DO $$
BEGIN
  IF to_regclass('public.maintenance_parts_used') IS NOT NULL THEN
    BEGIN
      CREATE TRIGGER trg_inventory_on_parts_used
      AFTER INSERT OR DELETE ON public.maintenance_parts_used
      FOR EACH ROW EXECUTE FUNCTION public.deduct_inventory_stock();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      CREATE TRIGGER trg_recalc_cost_on_parts_used
      AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_parts_used
      FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_cost();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$ LANGUAGE plpgsql;

-- maintenance_oils_used: إعادة احتساب التكلفة
DO $$
BEGIN
  IF to_regclass('public.maintenance_oils_used') IS NOT NULL THEN
    BEGIN
      CREATE TRIGGER trg_recalc_cost_on_oils_used
      AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_oils_used
      FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_cost();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$ LANGUAGE plpgsql;

-- تفعيل محدّث updated_at للجدوال التي تحتوي العمود updated_at
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT t.table_schema, t.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.column_name = 'updated_at'
      AND t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format($f$
      DO $blk$
      BEGIN
        BEGIN
          CREATE TRIGGER %I
          BEFORE UPDATE ON %I.%I
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
      END
      $blk$ LANGUAGE plpgsql;
    $f$, 'trg_touch_updated_at_' || r.table_name, r.table_schema, r.table_name);
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- =========================
-- 2) إدراج بيانات مساندة (Suppliers, Mechanics, Inventory)
-- =========================

-- Suppliers
INSERT INTO public.suppliers (name, contact_person, phone, email, address, tax_number, payment_terms)
SELECT 'شركة الإمداد', 'سالم', '0500000001', 'supply@example.com', 'الرياض', 'TX-1001', 'NET 30'
WHERE NOT EXISTS (SELECT 1 FROM public.suppliers WHERE name = 'شركة الإمداد');

INSERT INTO public.suppliers (name, contact_person, phone, email, address, tax_number, payment_terms)
SELECT 'شركة القطع', 'علي', '0500000002', 'parts@example.com', 'جدة', 'TX-1002', 'NET 15'
WHERE NOT EXISTS (SELECT 1 FROM public.suppliers WHERE name = 'شركة القطع');

-- Mechanics
INSERT INTO public.mechanics (name, phone, email, hourly_rate, is_active)
SELECT 'ورشة السريع', '0551112223', 'fastshop@example.com', 120, true
WHERE NOT EXISTS (SELECT 1 FROM public.mechanics WHERE name = 'ورشة السريع');

INSERT INTO public.mechanics (name, phone, email, hourly_rate, is_active)
SELECT 'ميكانيكي الخبرة', '0553334445', 'expertmech@example.com', 150, true
WHERE NOT EXISTS (SELECT 1 FROM public.mechanics WHERE name = 'ميكانيكي الخبرة');

-- Inventory Categories
INSERT INTO public.inventory_categories (name, description)
SELECT 'زيوت', 'مواد تشحيم وزيوت محركات'
WHERE NOT EXISTS (SELECT 1 FROM public.inventory_categories WHERE name = 'زيوت');

INSERT INTO public.inventory_categories (name, description)
SELECT 'فرامل', 'أقراص وتيل فرامل'
WHERE NOT EXISTS (SELECT 1 FROM public.inventory_categories WHERE name = 'فرامل');

-- Inventory Items (يرتبط بالموردين والفئات عند توفرهم)
WITH s AS (
  SELECT id FROM public.suppliers WHERE name = 'شركة الإمداد' LIMIT 1
),
c AS (
  SELECT id FROM public.inventory_categories WHERE name = 'زيوت' LIMIT 1
)
INSERT INTO public.inventory_items (name, description, supplier_id, category_id, unit_cost, selling_price, current_stock, minimum_stock, unit_of_measure, location)
SELECT 'زيت محرك 5W-30', 'زيت تخليقي عالي الجودة', s.id, c.id, 30, 45, 200, 50, 'liter', 'مستودع A'
FROM s, c
WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'زيت محرك 5W-30');

WITH s AS (
  SELECT id FROM public.suppliers WHERE name = 'شركة القطع' LIMIT 1
),
c AS (
  SELECT id FROM public.inventory_categories WHERE name = 'فرامل' LIMIT 1
)
INSERT INTO public.inventory_items (name, description, supplier_id, category_id, unit_cost, selling_price, current_stock, minimum_stock, unit_of_measure, location)
SELECT 'تيل فرامل أمامي', 'تيل فرامل عالي التحمل', s.id, c.id, 80, 120, 120, 30, 'piece', 'مستودع B'
FROM s, c
WHERE NOT EXISTS (SELECT 1 FROM public.inventory_items WHERE name = 'تيل فرامل أمامي');

-- =========================
-- 3) مواقع وصور للمركبات الموجودة
-- =========================

-- vehicle_location: أضف موقعًا للمركبات التي ليس لها سجل في vehicle_location
INSERT INTO public.vehicle_location (vehicle_id, latitude, longitude, is_tracked, address)
SELECT v.id,
       24.5 + random()*2.0 AS latitude,
       46.5 + random()*2.0 AS longitude,
       true,
       NULL
FROM public.vehicles v
LEFT JOIN public.vehicle_location vl ON vl.vehicle_id = v.id
WHERE vl.id IS NULL;

-- vehicle_images: صورتان لكل مركبة (أمامية وجانبية) إذا لم تكن موجودة
-- صورة أمامية
INSERT INTO public.vehicle_images (vehicle_id, url, type, description)
SELECT v.id,
       'https://placehold.co/600x400?text=' || coalesce(v.plate_number, 'Vehicle') || '+Front' AS url,
       'front',
       'صورة أمامية'
FROM public.vehicles v
WHERE NOT EXISTS (
  SELECT 1 FROM public.vehicle_images vi 
  WHERE vi.vehicle_id = v.id AND vi.type = 'front'
);

-- صورة جانبية
INSERT INTO public.vehicle_images (vehicle_id, url, type, description)
SELECT v.id,
       'https://placehold.co/600x400?text=' || coalesce(v.plate_number, 'Vehicle') || '+Side' AS url,
       'side',
       'صورة جانبية'
FROM public.vehicles v
WHERE NOT EXISTS (
  SELECT 1 FROM public.vehicle_images vi 
  WHERE vi.vehicle_id = v.id AND vi.type = 'side'
);

-- =========================
-- 4) فواتير حالات مختلفة (مدفوعة/متأخرة) لاختبار التقارير
-- =========================

-- فاتورة متأخرة
WITH c AS (
  SELECT COALESCE((SELECT name FROM public.customers ORDER BY created_at DESC LIMIT 1), 'عميل تجريبي') AS customer_name
),
v AS (
  SELECT id, COALESCE(plate_number, 'N/A') AS plate FROM public.vehicles ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.invoices (
  invoice_date, due_date, contract_id, vehicle_id, subtotal, tax_amount, discount_amount, total_amount,
  paid_amount, approved_by, sent_at, status, notes, terms_conditions, invoice_type, invoice_number,
  payment_terms, currency, customer_name, customer_email, customer_phone, customer_address
)
SELECT
  CURRENT_DATE - INTERVAL '20 days',  -- invoice_date
  CURRENT_DATE - INTERVAL '5 days',   -- due_date (متأخرة)
  NULL, v.id, 2000, 300, 0, 2300,
  500, NULL, CURRENT_DATE - INTERVAL '18 days', 'overdue',
  'فاتورة متأخرة للاختبار', 'شروط قياسية', 'rental',
  'INV-' || to_char(now(),'YYYYMMDD') || '-OD1',
  'NET 15', 'SAR', c.customer_name, NULL, NULL, NULL
FROM c
LEFT JOIN v ON TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.invoices WHERE invoice_number = 'INV-' || to_char(now(),'YYYYMMDD') || '-OD1')
  AND (SELECT COUNT(*) FROM public.invoices WHERE invoice_number = 'INV-' || to_char(now(),'YYYYMMDD') || '-OD1') = 0;

-- فاتورة مدفوعة
WITH c AS (
  SELECT COALESCE((SELECT name FROM public.customers ORDER BY created_at DESC LIMIT 1), 'عميل تجريبي') AS customer_name
),
v AS (
  SELECT id, COALESCE(plate_number, 'N/A') AS plate FROM public.vehicles ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.invoices (
  invoice_date, due_date, contract_id, vehicle_id, subtotal, tax_amount, discount_amount, total_amount,
  paid_amount, approved_by, sent_at, status, notes, terms_conditions, invoice_type, invoice_number,
  payment_terms, currency, customer_name, customer_email, customer_phone, customer_address
)
SELECT
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE - INTERVAL '2 days',
  NULL, v.id, 1500, 225, 0, 1725,
  1725, NULL, CURRENT_DATE - INTERVAL '9 days', 'paid',
  'فاتورة مدفوعة للاختبار', 'شروط قياسية', 'rental',
  'INV-' || to_char(now(),'YYYYMMDD') || '-PD1',
  'الدفع عند الاستلام', 'SAR', c.customer_name, NULL, NULL, NULL
FROM c
LEFT JOIN v ON TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.invoices WHERE invoice_number = 'INV-' || to_char(now(),'YYYYMMDD') || '-PD1')
  AND (SELECT COUNT(*) FROM public.invoices WHERE invoice_number = 'INV-' || to_char(now(),'YYYYMMDD') || '-PD1') = 0;

-- =========================
-- 5) أمر شراء اختياري للاختبار (إن توفرت البيانات المرجعية)
-- =========================

-- إنشاء أمر شراء أساسي
WITH s AS (
  SELECT id FROM public.suppliers WHERE name = 'شركة الإمداد' LIMIT 1
)
INSERT INTO public.purchase_orders (
  supplier_id, order_date, expected_delivery_date, subtotal, tax_amount, discount_amount, total_amount,
  order_number, status, notes
)
SELECT s.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 900, 135, 0, 1035,
       'PO-' || to_char(now(),'YYYYMMDD') || '-0001', 'approved', 'طلب شراء اختباري'
FROM s
WHERE s.id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.purchase_orders WHERE order_number = 'PO-' || to_char(now(),'YYYYMMDD') || '-0001');

-- بنود أمر الشراء
WITH po AS (
  SELECT id FROM public.purchase_orders WHERE order_number = 'PO-' || to_char(now(),'YYYYMMDD') || '-0001' LIMIT 1
),
it AS (
  SELECT id, unit_cost FROM public.inventory_items WHERE name = 'زيت محرك 5W-30' LIMIT 1
)
INSERT INTO public.purchase_order_items (purchase_order_id, item_id, quantity, unit_cost, total_cost)
SELECT po.id, it.id, 30, it.unit_cost, it.unit_cost * 30
FROM po, it
WHERE po.id IS NOT NULL AND it.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.purchase_order_items 
    WHERE purchase_order_id = po.id AND item_id = it.id
  );
