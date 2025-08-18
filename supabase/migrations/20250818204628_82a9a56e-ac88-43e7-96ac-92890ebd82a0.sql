
-- إدراج بيانات تجريبية أساسية للنظام (ملاك، مركبات، صور، مواقع، صيانة، موردون، مخزون)
WITH
  o1 AS (SELECT gen_random_uuid() AS id),
  o2 AS (SELECT gen_random_uuid() AS id),
  v1 AS (SELECT gen_random_uuid() AS id),
  v2 AS (SELECT gen_random_uuid() AS id),
  v3 AS (SELECT gen_random_uuid() AS id),
  mech1 AS (SELECT gen_random_uuid() AS id),
  supp1 AS (SELECT gen_random_uuid() AS id),
  i1 AS (SELECT gen_random_uuid() AS id),
  i2 AS (SELECT gen_random_uuid() AS id),
  m1 AS (SELECT gen_random_uuid() AS id)

-- ملاك المركبات
, ins_owners AS (
  INSERT INTO public.vehicle_owners (id, name, contact_person, phone, email, address, tax_number, commission_rate, pending_commission, total_commission, payment_terms, bank_details, is_active, notes, created_at, updated_at)
  VALUES
    ((SELECT id FROM o1), 'شركة الملاك المتحدة', 'سلمان العتيبي', '0500000001', 'owner1@example.com', 'الرياض - المملكة العربية السعودية', '3000000001', 0.10, 0, 0, '60 يوم', 'SA000000000000000001', true, 'مالك افتراضي للشركة', now(), now()),
    ((SELECT id FROM o2), 'مالك فردي - أحمد', 'أحمد علي', '0500000002', 'owner2@example.com', 'جدة - المملكة العربية السعودية', '3000000002', 0.08, 0, 0, '30 يوم', 'SA000000000000000002', true, 'مالك فردي', now(), now())
  RETURNING id
)

-- المركبات
, ins_vehicles AS (
  INSERT INTO public.vehicles (
    id, owner_id, plate_number, brand, model, year, color, fuel_type, transmission, engine_size, vin,
    registration_expiry, insurance_expiry, insurance_company, insurance_policy_number,
    daily_rate, weekly_rate, monthly_rate, mileage, last_maintenance_date, next_maintenance_due,
    status, location, features, notes, is_active, created_at, updated_at
  )
  VALUES
    (
      (SELECT id FROM v1), (SELECT id FROM o1), 'أ ب ج-1234', 'تويوتا', 'كامري', 2020, 'أبيض', 'gasoline', 'automatic', '2.5L', 'JT1234567890CAMRY1',
      current_date + INTERVAL '180 days', current_date + INTERVAL '200 days', 'التعاونية', 'POL-TOY-001',
      180, 1100, 4200, 45000, current_date - INTERVAL '60 days', 5000,
      'available', 'الرياض', ARRAY['بلوتوث','كاميرا خلفية'], 'سيارة نظيفة وجاهزة للإيجار', true, now(), now()
    ),
    (
      (SELECT id FROM v2), (SELECT id FROM o1), 'د ر س-5678', 'هيونداي', 'سوناتا', 2019, 'أسود', 'hybrid', 'automatic', '2.0L', 'KMH1234567890SONATA2',
      current_date - INTERVAL '15 days', current_date + INTERVAL '20 days', 'التعاونية', 'POL-HYU-002',
      160, 1000, 3800, 82000, current_date - INTERVAL '120 days', 3000,
      'rented', 'الدمام', ARRAY['تحكم تثبيت سرعة','حساسات'], 'مؤجرة حاليًا', true, now(), now()
    ),
    (
      (SELECT id FROM v3), (SELECT id FROM o2), 'ش ص ض-9012', 'نيسان', 'باترول', 2021, 'فضي', 'diesel', 'manual', '4.0L', 'JN1234567890PATROL3',
      current_date + INTERVAL '5 days', current_date - INTERVAL '2 days', 'سلامة', 'POL-NIS-003',
      350, 2200, 8000, 26000, current_date - INTERVAL '20 days', 7000,
      'maintenance', 'جدة', ARRAY['دفع رباعي','شاشة كبيرة'], 'داخل الصيانة الدورية', true, now(), now()
    )
  RETURNING id
)

-- صور المركبات
, ins_vehicle_images AS (
  INSERT INTO public.vehicle_images (vehicle_id, url, type, description, upload_date, uploaded_by)
  VALUES
    ((SELECT id FROM v1), 'https://placehold.co/800x450/png?text=Camry+Front', 'front', 'واجهة أمامية', now(), NULL),
    ((SELECT id FROM v1), 'https://placehold.co/800x450/png?text=Camry+Interior', 'interior', 'الداخلية', now(), NULL),
    ((SELECT id FROM v2), 'https://placehold.co/800x450/png?text=Sonata+Front', 'front', 'واجهة أمامية', now(), NULL),
    ((SELECT id FROM v2), 'https://placehold.co/800x450/png?text=Sonata+Side', 'side', 'جانب المركبة', now(), NULL),
    ((SELECT id FROM v3), 'https://placehold.co/800x450/png?text=Patrol+Front', 'front', 'واجهة أمامية', now(), NULL),
    ((SELECT id FROM v3), 'https://placehold.co/800x450/png?text=Patrol+Rear', 'rear', 'الخلفية', now(), NULL)
  RETURNING vehicle_id
)

-- مواقع المركبات
, ins_vehicle_locations AS (
  INSERT INTO public.vehicle_location (vehicle_id, latitude, longitude, address, is_tracked, last_updated)
  VALUES
    ((SELECT id FROM v1), 24.7136, 46.6753, 'الرياض - حي العليا', true, now() - INTERVAL '2 hours'),
    ((SELECT id FROM v2), 26.4207, 50.0888, 'الدمام - حي الشاطئ', true, now() - INTERVAL '30 minutes'),
    ((SELECT id FROM v3), 21.4858, 39.1925, 'جدة - حي الروضة', true, now() - INTERVAL '1 day')
  RETURNING vehicle_id
)

-- ميكانيكي
, ins_mechanic AS (
  INSERT INTO public.mechanics (id, name, employee_id, phone, email, specializations, hourly_rate, is_active, hire_date, created_at, updated_at)
  VALUES ((SELECT id FROM mech1), 'مركز صيانة متقدم', 'MECH-001', '0555555555', 'mech@example.com', ARRAY['محرك','كهرباء'], 120, true, current_date - INTERVAL '400 days', now(), now())
  RETURNING id
)

-- مورد ومخزون
, ins_supplier AS (
  INSERT INTO public.suppliers (id, name, contact_person, email, phone, address, tax_number, payment_terms, rating, is_active, created_at, updated_at)
  VALUES ((SELECT id FROM supp1), 'شركة قطع الغيار', 'ماجد', 'supplier@example.com', '0544444444', 'الرياض - الصناعية', '4000000001', 'NET 30', 4.5, true, now(), now())
  RETURNING id
)
, ins_inventory AS (
  INSERT INTO public.inventory_items (id, name, description, sku, barcode, part_number, supplier_id, unit_of_measure, unit_cost, selling_price, current_stock, minimum_stock, reorder_point, location, expiry_date, is_active, created_at, updated_at)
  VALUES
    ((SELECT id FROM i1), 'فلتر زيت', 'فلتر زيت محرك', 'OIL-FLT-01', '1234567890123', 'PN-OF-001', (SELECT id FROM supp1), 'piece', 25, 40, 150, 20, 50, 'Aisle 1', NULL, true, now(), now()),
    ((SELECT id FROM i2), 'زيت محرك 5W30', 'زيت محرك صناعي', 'OIL-5W30-01', '1234567890456', 'PN-OIL-5W30', (SELECT id FROM supp1), 'liter', 35, 55, 300, 40, 100, 'Aisle 2', NULL, true, now(), now())
  RETURNING id
)

-- سجل صيانة على مركبة داخل الصيانة
, ins_maintenance AS (
  INSERT INTO public.vehicle_maintenance (
    id, vehicle_id, mechanic_id, maintenance_type, description, reported_issue, scheduled_date, completed_date,
    status, odometer_in, odometer_out, labor_cost, parts_cost, total_cost, warranty_period, notes, images, created_by, created_at, updated_at
  )
  VALUES
    (
      (SELECT id FROM m1), (SELECT id FROM v3), (SELECT id FROM mech1),
      'oil_change', 'تغيير زيت وفحص عام', 'صوت خفيف من المحرك', current_date, NULL,
      'scheduled', 26000, NULL, 0, 0, 0, 0, 'سيتم الفحص الشامل مع تغيير الفلاتر', ARRAY[]::text[], NULL, now(), now()
    )
  RETURNING id
)

-- ربط قطع/زيوت مستخدمة في أمر الصيانة
, ins_maintenance_parts AS (
  INSERT INTO public.maintenance_parts_used (maintenance_id, inventory_item_id, quantity_used, unit_cost, total_cost, created_at)
  VALUES
    ((SELECT id FROM m1), (SELECT id FROM i1), 1, 25, 25, now())
  RETURNING maintenance_id
)
, ins_maintenance_oils AS (
  INSERT INTO public.maintenance_oils_used (maintenance_id, inventory_item_id, quantity_used, unit_cost, total_cost, created_at)
  VALUES
    ((SELECT id FROM m1), (SELECT id FROM i2), 5, 35, 175, now())
  RETURNING maintenance_id
)

-- ساعات عمل الفني للصيانة
, ins_work_hours AS (
  INSERT INTO public.maintenance_work_hours (maintenance_id, mechanic_id, start_time, end_time, break_hours, total_hours, hourly_rate, total_cost, notes, created_at, updated_at)
  VALUES
    ((SELECT id FROM m1), (SELECT id FROM mech1), now() - INTERVAL '3 hours', NULL, 0.25, NULL, 120, NULL, 'بدء العمل على المركبة', now(), now())
  RETURNING maintenance_id
)

-- إعداد نظامي افتراضي وتسجيل نشاط
, ins_settings AS (
  INSERT INTO public.system_settings (setting_key, setting_value, description, is_active, created_by, created_at, updated_at)
  VALUES
    ('app.general', '{"currency":"SAR","locale":"ar-SA","timezone":"Asia/Riyadh"}', 'إعدادات عامة للتطبيق', true, NULL, now(), now())
  RETURNING id
)
INSERT INTO public.activity_logs (action, entity_type, entity_id, tag, metadata, created_by, created_at)
VALUES
  ('create', 'vehicle', (SELECT id FROM v1), 'seed', '{"message":"تمت إضافة مركبة تجريبية"}', NULL, now()),
  ('create', 'vehicle', (SELECT id FROM v2), 'seed', '{"message":"تمت إضافة مركبة تجريبية"}', NULL, now()),
  ('create', 'vehicle', (SELECT id FROM v3), 'seed', '{"message":"تمت إضافة مركبة تجريبية"}', NULL, now()),
  ('create', 'maintenance', (SELECT id FROM m1), 'seed', '{"message":"تمت إضافة أمر صيانة تجريبي"}', NULL, now());
