
-- ملاحظة: هذا السكربت يُنشئ بيانات تجريبية دون حذف بياناتك الحالية

-- 1) ملاك المركبات + 2) المركبات + 3) صور المركبات + 4) مواقع المركبات
WITH inserted_owners AS (
  INSERT INTO vehicle_owners (name, email, phone, national_id, address, is_active, created_at, updated_at)
  VALUES
    ('مالك السيارات - الرياض', 'owner.riyadh@example.com', '+966500000001', '1012345671', 'الرياض - السعودية', true, now(), now()),
    ('مالك السيارات - جدة',   'owner.jeddah@example.com',  '+966500000002', '1012345672', 'جدة - السعودية',   true, now(), now()),
    ('مالك السيارات - الدمام', 'owner.dammam@example.com',  '+966500000003', '1012345673', 'الدمام - السعودية', true, now(), now()),
    ('مالك السيارات - مكة',   'owner.makkah@example.com',  '+966500000004', '1012345674', 'مكة - السعودية',   true, now(), now()),
    ('مالك السيارات - المدينة','owner.madina@example.com', '+966500000005', '1012345675', 'المدينة - السعودية',true, now(), now()),
    ('مالك السيارات - أبها',   'owner.abha@example.com',    '+966500000006', '1012345676', 'أبها - السعودية',   true, now(), now())
  RETURNING id, name
),
inserted_vehicles AS (
  INSERT INTO vehicles (
    plate_number, brand, model, year, color, status,
    daily_rate, mileage, fuel_type, transmission, seating_capacity,
    owner_id, created_at, updated_at
  )
  SELECT
    v.plate_number, v.brand, v.model, v.year, v.color, v.status,
    v.daily_rate, v.mileage, v.fuel_type, v.transmission, v.seating_capacity,
    o.id, now(), now()
  FROM (VALUES
    ('ح ب ل 1234', 'Toyota', 'Camry', 2021, 'أبيض',       'available', 220.00,  45000, 'gasoline', 'automatic', 5, 'مالك السيارات - الرياض'),
    ('س د م 5678', 'Hyundai','Sonata',2020, 'أسود',       'rented',    200.00,  62000, 'gasoline', 'automatic', 5, 'مالك السيارات - جدة'),
    ('ع ر س 9012', 'Kia',    'Sportage',2019,'فضي',       'maintenance',180.00, 78000, 'gasoline', 'automatic', 5, 'مالك السيارات - الدمام'),
    ('ص ن ك 3456', 'Nissan', 'Altima', 2022, 'أزرق',      'available', 250.00,  21000, 'gasoline', 'automatic', 5, 'مالك السيارات - مكة'),
    ('ق ف ح 7890', 'Honda',  'Civic',  2018, 'أحمر',      'out_of_service',150.00,95000,'gasoline','manual',   5, 'مالك السيارات - المدينة'),
    ('ط ظ ج 1122', 'Tesla',  'Model 3',2023, 'أبيض لؤلؤي','available', 450.00,  12000, 'electric', 'automatic', 5, 'مالك السيارات - الرياض'),
    ('و ه ل 3344', 'Ford',   'Explorer',2021,'رمادي',     'available', 320.00,  38000, 'gasoline', 'automatic', 7, 'مالك السيارات - جدة'),
    ('ى ش ت 5566', 'Chevrolet','Malibu',2020,'كحلي',      'rented',    210.00,  64000, 'gasoline', 'automatic', 5, 'مالك السيارات - الدمام'),
    ('ث خ ذ 7788', 'Toyota', 'RAV4',   2022, 'أخضر',      'available', 300.00,  23000, 'gasoline', 'automatic', 5, 'مالك السيارات - مكة'),
    ('ض غ ف 9900', 'Hyundai','Elantra',2019,'ذهبي',       'maintenance',160.00, 82000, 'gasoline', 'manual',    5, 'مالك السيارات - المدينة'),
    ('ا ب ت 1357', 'BMW',    '320i',   2021, 'أسود لامع', 'available', 500.00,  30000, 'gasoline', 'automatic', 5, 'مالك السيارات - أبها'),
    ('ج د ه 2468', 'Mercedes','C200',  2022, 'فضي معدني', 'available', 650.00,  18000, 'gasoline', 'automatic', 5, 'مالك السيارات - أبها')
  ) AS v(plate_number, brand, model, year, color, status, daily_rate, mileage, fuel_type, transmission, seating_capacity, owner_name)
  LEFT JOIN inserted_owners o ON o.name = v.owner_name
  RETURNING id, plate_number
),
ins_vehicle_images AS (
  INSERT INTO vehicle_images (vehicle_id, url, type, description, upload_date)
  SELECT iv.id, 'https://via.placeholder.com/800x500?text=' || replace(iv.plate_number,' ','+'), 'exterior', 'صورة خارجية للمركبة', now()
  FROM inserted_vehicles iv
  UNION ALL
  SELECT iv.id, 'https://via.placeholder.com/800x500?text=Interior+' || replace(iv.plate_number,' ','+'), 'interior', 'صورة داخلية للمركبة', now()
  FROM inserted_vehicles iv
  RETURNING id
),
ins_vehicle_locations AS (
  INSERT INTO vehicle_location (vehicle_id, latitude, longitude, address, is_tracked, last_updated)
  SELECT iv.id,
         24.7136 + (random()-0.5) * 0.2,   -- قرب الرياض
         46.6753 + (random()-0.5) * 0.2,
         'حي الأعمال، الرياض، السعودية',
         true,
         now()
  FROM inserted_vehicles iv
  RETURNING id
)
SELECT 'inserted_owners='|| (SELECT count(*) FROM inserted_owners)
     || ', inserted_vehicles=' || (SELECT count(*) FROM inserted_vehicles)
     || ', vehicle_images=' || (SELECT count(*) FROM ins_vehicle_images)
     || ', vehicle_locations=' || (SELECT count(*) FROM ins_vehicle_locations) AS summary;

-- 5) الموردون
WITH inserted_suppliers AS (
  INSERT INTO suppliers (name, contact_person, email, phone, address, tax_number, payment_terms, rating, is_active, created_at, updated_at)
  VALUES
    ('شركة زيوت الشرق',      'أحمد علي',   'east.oil@example.com', '+966511111111', 'الدمام - الصناعية',  '300123456700003', '30 يوم', 5, true, now(), now()),
    ('مؤسسة قطع الغيار',     'محمد سعيد',  'parts.house@example.com','+966522222222','جدة - البلد',       '300223456700004', 'نقداً',  4, true, now(), now()),
    ('ورشة الصيانة السريعة', 'سالم بخيت',  'quick.fix@example.com', '+966533333333', 'الرياض - مخرج 10',   '300323456700005', '15 يوم', 4, true, now(), now()),
    ('متجر الإطارات',        'فهد القحطاني','tires.store@example.com','+966544444444','الرياض - العليا',   '300423456700006', '45 يوم', 5, true, now(), now()),
    ('بطاريات الخليج',       'ماجد سالم',  'gulf.battery@example.com','+966555555555','الخبر - التحلية',   '300523456700007', '30 يوم', 3, true, now(), now())
  RETURNING id, name
)
SELECT 'inserted_suppliers='|| (SELECT count(*) FROM inserted_suppliers) AS summary;

-- 6) الفنيون (الميكانيكيون)
WITH inserted_mechanics AS (
  INSERT INTO mechanics (name, employee_id, phone, email, hourly_rate, specializations, is_active, hire_date, created_at, updated_at)
  VALUES
    ('خالد الميكانيكي', 'MECH-001', '+966560000001', 'khaled.mechanic@example.com', 120, ARRAY['engine','suspension'], true, current_date - interval '400 days', now(), now()),
    ('سعيد كهربائي سيارات', 'MECH-002', '+966560000002', 'saeed.electric@example.com', 140, ARRAY['electrical','diagnostics'], true, current_date - interval '300 days', now(), now()),
    ('مطلق خبير زيوت', 'MECH-003', '+966560000003', 'mutlaq.oil@example.com', 100, ARRAY['oil','filters'], true, current_date - interval '200 days', now(), now())
  RETURNING id
)
SELECT 'inserted_mechanics='|| (SELECT count(*) FROM inserted_mechanics) AS summary;

-- 7) تصنيفات المخزون
WITH inserted_categories AS (
  INSERT INTO inventory_categories (name, description, created_at, updated_at)
  VALUES
    ('زيوت', 'زيوت محركات وتروس', now(), now()),
    ('فلاتر', 'فلاتر زيت وهواء',   now(), now()),
    ('فرامل', 'أقمشة وهوبات',     now(), now()),
    ('إطارات', 'أنواع الإطارات',  now(), now()),
    ('بطاريات', 'بطاريات السيارات',now(), now())
  RETURNING id, name
)
SELECT 'inserted_categories='|| (SELECT count(*) FROM inserted_categories) AS summary;

-- 8) عناصر المخزون (يرتبط بالموردين والتصنيفات)
WITH cats AS (
  SELECT id, name FROM inventory_categories
),
sups AS (
  SELECT id, name FROM suppliers
),
inserted_items AS (
  INSERT INTO inventory_items (
    name, description, unit_cost, selling_price, current_stock, minimum_stock,
    maximum_stock, reorder_point, expiry_date, unit_of_measure, location,
    category_id, supplier_id, sku, barcode, is_active, created_at, updated_at
  )
  SELECT * FROM (
    VALUES
      ('زيت محرك 5W-30', 'زيت تخليقي',            35, 55, 120, 20, 300, 50, current_date + interval '18 months', 'liter',  'مستودع أ-زيوت',
        (SELECT id FROM cats WHERE name='زيوت' LIMIT 1), (SELECT id FROM sups WHERE name='شركة زيوت الشرق' LIMIT 1),'OIL-5W30','1234567890001', true, now(), now()),
      ('فلتر زيت تويوتا', 'فلتر أصلي',            18, 30,  80, 15, 200, 30, NULL,                           'piece', 'مستودع ب-فلاتر',
        (SELECT id FROM cats WHERE name='فلاتر' LIMIT 1), (SELECT id FROM sups WHERE name='مؤسسة قطع الغيار' LIMIT 1),'FLT-TY-001','1234567890002', true, now(), now()),
      ('أقمشة فرامل أمامية', 'جودة عالية',        45, 70,  60, 10, 150, 25, NULL,                           'set',   'مستودع ج-فرامل',
        (SELECT id FROM cats WHERE name='فرامل' LIMIT 1), (SELECT id FROM sups WHERE name='مؤسسة قطع الغيار' LIMIT 1),'BRK-FR-001','1234567890003', true, now(), now()),
      ('إطار 18"', 'مقاس 235/55/R18',             220, 320, 40, 8, 100, 15, NULL,                           'piece', 'مستودع د-إطارات',
        (SELECT id FROM cats WHERE name='إطارات' LIMIT 1), (SELECT id FROM sups WHERE name='متجر الإطارات' LIMIT 1),'TIR-18-235','1234567890004', true, now(), now()),
      ('بطارية 70 أمبير', 'بطارية مغمورة',        180, 260, 25, 5, 80,  10, current_date + interval '24 months','piece','مستودع هـ-بطاريات',
        (SELECT id FROM cats WHERE name='بطاريات' LIMIT 1), (SELECT id FROM sups WHERE name='بطاريات الخليج' LIMIT 1),'BAT-70A','1234567890005', true, now(), now()),
      ('فلتر هواء', 'فلتر هواء قياسي',            20, 35,  70, 12, 180, 20, NULL,                           'piece', 'مستودع ب-فلاتر',
        (SELECT id FROM cats WHERE name='فلاتر' LIMIT 1), (SELECT id FROM sups WHERE name='مؤسسة قطع الغيار' LIMIT 1),'FLT-AIR-001','1234567890006', true, now(), now()),
      ('زيت قير ATF', 'لناقل حركة أوتوماتيك',     50, 80,  50, 10, 120, 20, current_date + interval '12 months','liter','مستودع أ-زيوت',
        (SELECT id FROM cats WHERE name='زيوت' LIMIT 1), (SELECT id FROM sups WHERE name='شركة زيوت الشرق' LIMIT 1),'OIL-ATF','1234567890007', true, now(), now()),
      ('إطار 17"', 'مقاس 215/60/R17',             190, 290, 35, 7,  90,  12, NULL,                           'piece', 'مستودع د-إطارات',
        (SELECT id FROM cats WHERE name='إطارات' LIMIT 1), (SELECT id FROM sups WHERE name='متجر الإطارات' LIMIT 1),'TIR-17-215','1234567890008', true, now(), now())
  ) AS t(
    name, description, unit_cost, selling_price, current_stock, minimum_stock,
    maximum_stock, reorder_point, expiry_date, unit_of_measure, location,
    category_id, supplier_id, sku, barcode, is_active, created_at, updated_at
  )
  RETURNING id, name, unit_cost
)
SELECT 'inserted_items='|| (SELECT count(*) FROM inserted_items) AS summary;

-- 9) أوامر شراء + عناصر أوامر الشراء (مع تحديث الإجماليات)
WITH s AS (
  SELECT id FROM suppliers WHERE name='شركة زيوت الشرق' LIMIT 1
), s2 AS (
  SELECT id FROM suppliers WHERE name='مؤسسة قطع الغيار' LIMIT 1
), po AS (
  INSERT INTO purchase_orders (supplier_id, order_date, expected_delivery_date, subtotal, tax_amount, discount_amount, total_amount, order_number, status, notes, created_at, updated_at)
  VALUES
    ((SELECT id FROM s),  current_date - interval '10 days', current_date - interval '5 days', 0,0,0,0, 'PO-2025-0001', 'approved', 'توريد زيوت', now(), now()),
    ((SELECT id FROM s2), current_date - interval '7 days',  current_date - interval '2 days', 0,0,0,0, 'PO-2025-0002', 'approved', 'توريد فلاتر وفرامل', now(), now())
  RETURNING id, order_number
), items AS (
  SELECT id, name, unit_cost FROM inventory_items
), poi AS (
  INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_cost, total_cost)
  SELECT (SELECT id FROM po WHERE order_number='PO-2025-0001'), (SELECT id FROM items WHERE name='زيت محرك 5W-30' LIMIT 1), 100, (SELECT unit_cost FROM items WHERE name='زيت محرك 5W-30' LIMIT 1), 100 * (SELECT unit_cost FROM items WHERE name='زيت محرك 5W-30' LIMIT 1)
  UNION ALL
  SELECT (SELECT id FROM po WHERE order_number='PO-2025-0001'), (SELECT id FROM items WHERE name='زيت قير ATF' LIMIT 1),     60,  (SELECT unit_cost FROM items WHERE name='زيت قير ATF' LIMIT 1),      60 * (SELECT unit_cost FROM items WHERE name='زيت قير ATF' LIMIT 1)
  UNION ALL
  SELECT (SELECT id FROM po WHERE order_number='PO-2025-0002'), (SELECT id FROM items WHERE name='فلتر زيت تويوتا' LIMIT 1),  50,  (SELECT unit_cost FROM items WHERE name='فلتر زيت تويوتا' LIMIT 1),   50 * (SELECT unit_cost FROM items WHERE name='فلتر زيت تويوتا' LIMIT 1)
  UNION ALL
  SELECT (SELECT id FROM po WHERE order_number='PO-2025-0002'), (SELECT id FROM items WHERE name='أقمشة فرامل أمامية' LIMIT 1), 40, (SELECT unit_cost FROM items WHERE name='أقمشة فرامل أمامية' LIMIT 1), 40 * (SELECT unit_cost FROM items WHERE name='أقمشة فرامل أمامية' LIMIT 1)
  RETURNING id, purchase_order_id
)
UPDATE purchase_orders po
SET subtotal = sub.subtotal,
    tax_amount = round(sub.subtotal * 0.15, 2),
    discount_amount = 0,
    total_amount = round(sub.subtotal * 1.15, 2),
    updated_at = now()
FROM (
  SELECT purchase_order_id, SUM(total_cost) AS subtotal
  FROM purchase_order_items
  GROUP BY purchase_order_id
) sub
WHERE po.id = sub.purchase_order_id;

-- 10) فواتير + بنود الفواتير (مستقلة للاختبار)
WITH inv AS (
  INSERT INTO invoices (
    invoice_number, invoice_date, due_date, invoice_type, status,
    customer_name, customer_phone, customer_email, customer_address,
    currency, vat_rate, subtotal, tax_amount, discount_amount, total_amount,
    payment_terms, created_at, updated_at
  )
  VALUES
    ('INV-2025-0001', current_date - interval '12 days', current_date - interval '2 days', 'rental', 'sent',
      'عميل تجريبي 1', '+966590000001', 'test1@example.com', 'الرياض', 'SAR', 15.00, 2000, 300, 0, 2300, 'الدفع خلال 7 أيام', now(), now()),
    ('INV-2025-0002', current_date - interval '9 days',  current_date - interval '1 days', 'maintenance', 'paid',
      'عميل تجريبي 2', '+966590000002', 'test2@example.com', 'جدة', 'SAR', 15.00, 1500, 225, 0, 1725, 'الدفع عند الاستلام', now(), now()),
    ('INV-2025-0003', current_date - interval '5 days',  current_date + interval '2 days', 'additional_charges', 'draft',
      'عميل تجريبي 3', '+966590000003', 'test3@example.com', 'الدمام', 'SAR', 15.00, 800,  120, 0, 920,  'الدفع خلال 14 يوم', now(), now())
  RETURNING id, invoice_number
),
ins_items AS (
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price, line_order)
  SELECT (SELECT id FROM inv WHERE invoice_number='INV-2025-0001'), 'أجرة إيجار 5 أيام', 5, 400, 2000, 1
  UNION ALL
  SELECT (SELECT id FROM inv WHERE invoice_number='INV-2025-0002'), 'صيانة دورية - قطع وزيوت', 1, 1500, 1500, 1
  UNION ALL
  SELECT (SELECT id FROM inv WHERE invoice_number='INV-2025-0003'), 'رسوم إضافية نظافة', 1, 800, 800, 1
  RETURNING id
)
SELECT 'inserted_invoices='||(SELECT count(*) FROM inv)||', inserted_invoice_items='||(SELECT count(*) FROM ins_items) AS summary;

-- 11) جداول صيانة مقررة للمركبات المُضافة
WITH v AS (
  SELECT id FROM vehicles
  ORDER BY created_at DESC
  LIMIT 5
), ins_sched AS (
  INSERT INTO maintenance_schedules (vehicle_id, scheduled_date, maintenance_type, priority, status, notes, created_at, updated_at)
  SELECT id, current_date + interval '10 days', 'دورية 10 آلاف كم', 'medium', 'scheduled', 'فحص عام وتغيير زيت', now(), now() FROM v
  UNION ALL
  SELECT id, current_date + interval '20 days', 'تبديل فلاتر', 'low', 'scheduled', 'فلتر زيت وهواء', now(), now() FROM v
  RETURNING id
)
SELECT 'maintenance_schedules_inserted='||(SELECT count(*) FROM ins_sched) AS summary;
