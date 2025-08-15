
-- إدخال عقود إيجار تجريبية + سندات قبض + فواتير لاختبار شامل
-- الملاحظات:
-- - يتم توليد أرقام عقود وفواتير فريدة باستخدام gen_random_uuid
-- - سندات القبض تُنشأ مباشرة هنا (لا نعتمد على وجود تريجرات)
-- - تحديث حالة المركبات بما يتوافق مع حالة العقد
-- - هذا السكربت آمن للتشغيل مرة واحدة (الأرقام فريدة)

WITH selected_customers AS (
  SELECT id, name, phone, email
  FROM customers
  WHERE is_active IS DISTINCT FROM false
  ORDER BY created_at DESC
  LIMIT 12
),
selected_vehicles AS (
  SELECT id, plate_number, COALESCE(daily_rate, 200)::numeric AS daily_rate
  FROM vehicles
  WHERE status IN ('available','rented','maintenance') -- نسمح بالخلط للحالات التجريبية
  ORDER BY created_at DESC
  LIMIT 12
),
pairs AS (
  SELECT
    ROW_NUMBER() OVER () AS idx,
    c.id AS customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    c.email AS customer_email,
    v.id AS vehicle_id,
    v.plate_number,
    v.daily_rate
  FROM selected_customers c
  JOIN selected_vehicles v ON TRUE
  LIMIT 12
),
prepared AS (
  SELECT
    p.*,
    -- تصنيف الحالات (4 نشط، 3 مكتمل، 2 معلق، 2 منتهي، 1 ملغى)
    CASE 
      WHEN idx <= 4 THEN 'active'
      WHEN idx BETWEEN 5 AND 7 THEN 'completed'
      WHEN idx BETWEEN 8 AND 9 THEN 'pending'
      WHEN idx BETWEEN 10 AND 11 THEN 'expired'
      ELSE 'cancelled'
    END AS contract_status,
    -- أيام الإيجار حسب الحالة
    CASE 
      WHEN idx <= 4 THEN 4 + (idx % 3)           -- active
      WHEN idx BETWEEN 5 AND 7 THEN 5 + (idx % 3) -- completed
      WHEN idx BETWEEN 8 AND 9 THEN 3 + (idx % 2) -- pending
      WHEN idx BETWEEN 10 AND 11 THEN 4 + (idx % 2) -- expired
      ELSE 3                                     -- cancelled
    END AS days_count,
    -- تواريخ البداية والنهاية
    CASE 
      WHEN idx <= 4 THEN (CURRENT_DATE - (2 + (idx % 3))::int)
      WHEN idx BETWEEN 5 AND 7 THEN (CURRENT_DATE - (30 + idx)::int)
      WHEN idx BETWEEN 8 AND 9 THEN (CURRENT_DATE + (3 + (idx % 4))::int)
      WHEN idx BETWEEN 10 AND 11 THEN (CURRENT_DATE - (15 + idx)::int)
      ELSE (CURRENT_DATE - 7)
    END AS start_date_calc
  FROM pairs p
),
prepared_dates AS (
  SELECT
    *,
    (start_date_calc + (days_count || ' days')::interval)::date AS end_date_calc
  FROM prepared
),
finance AS (
  SELECT
    *,
    -- المبالغ الأساسية
    (daily_rate * days_count)::numeric AS base_amount,
    (50 * (idx % 3))::numeric AS additional_charges_calc,    -- 0, 50, 100
    (30 * (idx % 2))::numeric AS discount_amount_calc,       -- 0, 30
    -- إجمالي المبلغ
    ((daily_rate * days_count) + (50 * (idx % 3)) - (30 * (idx % 2)))::numeric AS total_amount_calc,
    -- إيداع وباقي المدفوعات حسب الحالة
    CASE 
      WHEN contract_status IN ('active','pending') THEN 300::numeric
      WHEN contract_status = 'expired' THEN 200::numeric
      ELSE 0::numeric
    END AS deposit_calc,
    CASE 
      WHEN contract_status = 'completed' THEN ((daily_rate * days_count) + (50 * (idx % 3)) - (30 * (idx % 2)))::numeric
      WHEN contract_status = 'active' THEN ROUND((((daily_rate * days_count) + (50 * (idx % 3)) - (30 * (idx % 2))) * 0.4)::numeric, 2)
      WHEN contract_status = 'expired' THEN ROUND((((daily_rate * days_count) + (50 * (idx % 3)) - (30 * (idx % 2))) * 0.3)::numeric, 2)
      WHEN contract_status = 'pending' THEN 0::numeric
      ELSE 0::numeric
    END AS paid_amount_calc
  FROM prepared_dates
),
to_insert AS (
  SELECT
    -- حقول العقد
    ('CR-' || TO_CHAR(NOW(),'YYYYMM') || '-' || SUBSTR(gen_random_uuid()::text,1,8) || '-D') AS contract_number,
    customer_id,
    vehicle_id,
    start_date_calc AS start_date,
    end_date_calc AS end_date,
    NULL::date AS actual_return_date,
    daily_rate::numeric AS daily_rate,
    total_amount_calc AS total_amount,
    deposit_calc AS deposit_amount,
    0::numeric AS insurance_amount,
    additional_charges_calc AS additional_charges,
    discount_amount_calc AS discount_amount,
    (ARRAY['cash','pos','bank_transfer'])[(idx % 3)+1] AS payment_method,
    CASE 
      WHEN contract_status = 'completed' THEN 'paid'
      WHEN contract_status IN ('active','expired') AND (total_amount_calc - paid_amount_calc) > 0 THEN 
        CASE WHEN contract_status = 'expired' THEN 'overdue' ELSE 'partial' END
      WHEN contract_status = 'pending' THEN 'pending'
      ELSE 'cancelled'
    END AS payment_status,
    paid_amount_calc AS paid_amount,
    GREATEST(total_amount_calc - paid_amount_calc, 0)::numeric AS remaining_amount,
    'مكتب الرياض'::text AS pickup_location,
    CASE WHEN contract_status = 'completed' THEN 'مكتب الرياض'::text ELSE NULL::text END AS return_location,
    (10000 + idx * 150)::int AS mileage_start,
    NULL::int AS mileage_end,
    'نصف'::text AS fuel_level_start,
    NULL::text AS fuel_level_end,
    contract_status AS status,
    ('عقد تجريبي للحالة: ' || contract_status)::text AS notes,
    'الشروط والأحكام القياسية'::text AS terms_conditions,
    NULL::text AS customer_signature,
    NULL::text AS employee_signature,
    NULL::timestamp with time zone AS signed_at,
    NOW() AS created_at,
    NOW() AS updated_at,
    NULL::uuid AS created_by,
    -- للمرجعية لاحقاً
    customer_name,
    customer_phone,
    customer_email,
    plate_number
  FROM finance
),
new_contracts AS (
  INSERT INTO rental_contracts (
    contract_number, customer_id, vehicle_id, start_date, end_date, actual_return_date,
    daily_rate, total_amount, deposit_amount, insurance_amount, additional_charges, discount_amount,
    payment_method, payment_status, paid_amount, remaining_amount,
    pickup_location, return_location, mileage_start, mileage_end,
    fuel_level_start, fuel_level_end, status, notes, terms_conditions,
    customer_signature, employee_signature, signed_at, created_at, updated_at, created_by
  )
  SELECT
    contract_number, customer_id, vehicle_id, start_date, end_date,
    CASE WHEN status = 'completed' THEN end_date::timestamp ELSE NULL END AS actual_return_date,
    daily_rate, total_amount, deposit_amount, insurance_amount, additional_charges, discount_amount,
    payment_method, payment_status, paid_amount, remaining_amount,
    pickup_location, return_location, mileage_start, mileage_end,
    fuel_level_start, fuel_level_end, status, notes, terms_conditions,
    customer_signature, employee_signature, signed_at, created_at, updated_at, created_by
  FROM to_insert
  RETURNING id, contract_number, customer_id, vehicle_id, start_date, end_date, total_amount, paid_amount, remaining_amount, payment_method, status
),
-- تحديث حالة المركبات بناءً على العقود الجديدة
updated_vehicles AS (
  UPDATE vehicles v
  SET status = CASE 
    WHEN nc.status IN ('active','expired','pending') THEN 'rented'
    ELSE 'available'
  END
  FROM new_contracts nc
  WHERE v.id = nc.vehicle_id
  RETURNING v.id
),
-- سندات القبض للعقود التي بها مدفوعات
receipts AS (
  INSERT INTO payment_receipts (
    receipt_number, contract_id, customer_id, customer_name, vehicle_id,
    amount, payment_method, payment_date, receipt_type, status, issued_by, notes
  )
  SELECT
    generate_receipt_number(),
    nc.id,
    nc.customer_id,
    (SELECT name FROM customers WHERE id = nc.customer_id),
    nc.vehicle_id,
    nc.paid_amount,
    nc.payment_method,
    nc.start_date,
    'rental_payment',
    CASE WHEN nc.status = 'completed' THEN 'confirmed'
         WHEN nc.status IN ('active','expired') THEN 'confirmed'
         WHEN nc.status = 'pending' THEN 'pending'
         ELSE 'cancelled' END,
    (SELECT id FROM profiles ORDER BY created_at LIMIT 1), -- مُصدر السند
    'سند قبض تجريبي للعقد ' || nc.contract_number
  FROM new_contracts nc
  WHERE nc.paid_amount > 0
  RETURNING id
),
-- فواتير مرتبطة بكل عقد
invoices_insert AS (
  INSERT INTO invoices (
    invoice_number, invoice_date, due_date, contract_id, vehicle_id,
    subtotal, tax_amount, discount_amount, total_amount, paid_amount,
    vat_rate, status, notes, invoice_type, payment_terms, currency,
    customer_name, customer_email, customer_phone, customer_address, created_at
  )
  SELECT
    'INV-' || TO_CHAR(NOW(),'YYYYMM') || '-' || SUBSTR(gen_random_uuid()::text,1,8) || '-D',
    nc.start_date,
    COALESCE(nc.end_date, nc.start_date),
    nc.id,
    nc.vehicle_id,
    ROUND((nc.total_amount / 1.15)::numeric, 2) AS subtotal_calc,
    ROUND((nc.total_amount - (nc.total_amount / 1.15))::numeric, 2) AS vat_calc,
    0,
    nc.total_amount,
    nc.paid_amount,
    15.00,
    CASE 
      WHEN nc.remaining_amount = 0 THEN 'paid'
      WHEN nc.status = 'expired' AND nc.remaining_amount > 0 THEN 'overdue'
      WHEN nc.paid_amount > 0 THEN 'partial'
      WHEN nc.status = 'cancelled' THEN 'cancelled'
      ELSE 'sent'
    END,
    'فاتورة تجريبية مرتبطة بالعقد ' || nc.contract_number,
    'rental',
    'الدفع عند الاستلام',
    'SAR',
    (SELECT name FROM customers WHERE id = nc.customer_id),
    (SELECT email FROM customers WHERE id = nc.customer_id),
    (SELECT phone FROM customers WHERE id = nc.customer_id),
    NULL,
    NOW()
  FROM new_contracts nc
  RETURNING id
)
SELECT 
  (SELECT COUNT(*) FROM new_contracts) AS inserted_contracts,
  (SELECT COUNT(*) FROM receipts) AS inserted_receipts,
  (SELECT COUNT(*) FROM invoices_insert) AS inserted_invoices,
  (SELECT COUNT(*) FROM updated_vehicles) AS vehicles_updated;
