
-- إضافة بيانات تجريبية للمالكين
INSERT INTO vehicle_owners (id, name, phone, email, national_id, address, commission_rate, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'أحمد محمد الشريف', '0501234567', 'ahmed@example.com', '1234567890', 'الرياض - حي النرجس', 15.0, true),
('550e8400-e29b-41d4-a716-446655440002', 'فاطمة عبدالله النجار', '0509876543', 'fatima@example.com', '1234567891', 'جدة - حي الصفا', 18.0, true),
('550e8400-e29b-41d4-a716-446655440003', 'محمد سعد القحطاني', '0512345678', 'mohammed@example.com', '1234567892', 'الدمام - حي الشاطئ', 20.0, true);

-- إضافة بيانات تجريبية للمركبات
INSERT INTO vehicles (
  id, plate_number, brand, model, year, color, fuel_type, transmission, 
  status, mileage, daily_rate, monthly_rate, security_deposit, 
  insurance_expiry, license_expiry, inspection_expiry, owner_id, is_active
) VALUES 
('650e8400-e29b-41d4-a716-446655440001', 'أ ب ج 123', 'تويوتا', 'كامري', 2023, 'أبيض', 'gasoline', 'automatic', 'available', 15000, 200, 5500, 2000, '2024-12-31', '2025-06-30', '2024-09-15', '550e8400-e29b-41d4-a716-446655440001', true),
('650e8400-e29b-41d4-a716-446655440002', 'د هـ و 456', 'هونداي', 'إلانترا', 2022, 'أسود', 'gasoline', 'automatic', 'available', 22000, 180, 5000, 1800, '2024-11-30', '2025-05-15', '2024-10-20', '550e8400-e29b-41d4-a716-446655440001', true),
('650e8400-e29b-41d4-a716-446655440003', 'ز ح ط 789', 'نيسان', 'ألتيما', 2023, 'فضي', 'gasoline', 'automatic', 'rented', 18000, 220, 6000, 2200, '2025-01-15', '2025-07-10', '2024-11-05', '550e8400-e29b-41d4-a716-446655440002', true),
('650e8400-e29b-41d4-a716-446655440004', 'ي ك ل 321', 'كيا', 'أوبتيما', 2021, 'أحمر', 'gasoline', 'automatic', 'maintenance', 35000, 170, 4800, 1700, '2024-10-31', '2025-04-20', '2024-08-15', '550e8400-e29b-41d4-a716-446655440002', true),
('650e8400-e29b-41d4-a716-446655440005', 'م ن س 654', 'مازda', 'CX-5', 2023, 'أزرق', 'gasoline', 'automatic', 'available', 12000, 250, 7000, 2500, '2025-02-28', '2025-08-15', '2024-12-10', '550e8400-e29b-41d4-a716-446655440003', true),
('650e8400-e29b-41d4-a716-446655440006', 'ع ف ص 987', 'شيفروليه', 'كروز', 2022, 'أبيض', 'gasoline', 'automatic', 'available', 28000, 160, 4500, 1600, '2024-09-30', '2025-03-25', '2024-07-20', '550e8400-e29b-41d4-a716-446655440003', true),
('650e8400-e29b-41d4-a716-446655440007', 'ق ر ش 147', 'فولكس واجن', 'جيتا', 2023, 'رمادي', 'gasoline', 'automatic', 'available', 16000, 190, 5300, 1900, '2025-03-31', '2025-09-10', '2025-01-15', '550e8400-e29b-41d4-a716-446655440001', true),
('650e8400-e29b-41d4-a716-446655440008', 'ت ث خ 258', 'فورد', 'فوكس', 2021, 'أخضر', 'gasoline', 'automatic', 'available', 31000, 155, 4300, 1550, '2024-08-31', '2025-02-14', '2024-06-30', '550e8400-e29b-41d4-a716-446655440002', true),
('650e8400-e29b-41d4-a716-446655440009', 'ذ ض ظ 369', 'هونداي', 'توسان', 2023, 'بني', 'gasoline', 'automatic', 'rented', 14000, 230, 6500, 2300, '2025-04-30', '2025-10-05', '2025-02-20', '550e8400-e29b-41d4-a716-446655440003', true),
('650e8400-e29b-41d4-a716-446655440010', 'غ أ ب 741', 'تويوتا', 'كورولا', 2022, 'ذهبي', 'gasoline', 'automatic', 'available', 24000, 175, 4900, 1750, '2024-12-15', '2025-06-01', '2024-09-30', '550e8400-e29b-41d4-a716-446655440001', true);

-- إضافة عملاء إضافيين
INSERT INTO customers (
  id, name, name_english, phone, phone_secondary, email, national_id, nationality, 
  date_of_birth, gender, marital_status, license_number, license_expiry, license_type,
  address, city, district, country, preferred_language, is_active, customer_source,
  credit_limit, payment_terms, preferred_payment_method, rating
) VALUES 
('750e8400-e29b-41d4-a716-446655440001', 'عبدالرحمن أحمد السالم', 'Abdulrahman Ahmed Alsalem', '0501111111', '0502222222', 'abdulrahman@email.com', '1122334455', 'سعودي', '1990-05-15', 'male', 'married', 'LIC123456', '2025-12-31', 'private', 'الرياض - حي الملز', 'الرياض', 'الملز', 'السعودية', 'ar', true, 'referral', 10000, 'cash', 'cash', 4.5),
('750e8400-e29b-41d4-a716-446655440002', 'سارة محمد الحربي', 'Sarah Mohammed Alharbi', '0503333333', '0504444444', 'sarah@email.com', '2233445566', 'سعودي', '1985-08-22', 'female', 'single', 'LIC789012', '2024-10-15', 'private', 'جدة - حي الروضة', 'جدة', 'الروضة', 'السعودية', 'ar', true, 'website', 15000, 'installments', 'credit_card', 5.0),
('750e8400-e29b-41d4-a716-446655440003', 'خالد عبدالله القرني', 'Khalid Abdullah Alqarni', '0505555555', null, 'khalid@email.com', '3344556677', 'سعودي', '1992-03-10', 'male', 'married', 'LIC345678', '2025-08-20', 'private', 'الدمام - حي الفيصلية', 'الدمام', 'الفيصلية', 'السعودية', 'ar', true, 'social_media', 8000, 'cash', 'bank_transfer', 4.2),
('750e8400-e29b-41d4-a716-446655440004', 'نورة سعد الغامدي', 'Noura Saad Alghamdi', '0506666666', '0507777777', 'noura@email.com', '4455667788', 'سعودي', '1988-11-30', 'female', 'married', 'LIC901234', '2025-06-10', 'private', 'مكة - حي العزيزية', 'مكة', 'العزيزية', 'السعودية', 'ar', true, 'referral', 12000, 'installments', 'pos', 4.8),
('750e8400-e29b-41d4-a716-446655440005', 'فهد علي العتيبي', 'Fahad Ali Alotaibi', '0508888888', null, 'fahad@email.com', '5566778899', 'سعودي', '1995-01-18', 'male', 'single', 'LIC567890', '2024-09-25', 'private', 'الطائف - حي السلامة', 'الطائف', 'السلامة', 'السعودية', 'ar', true, 'walk_in', 5000, 'cash', 'cash', 3.9);

-- إضافة عقود تجريبية
INSERT INTO rental_contracts (
  id, contract_number, vehicle_id, customer_id, start_date, end_date, 
  daily_rate, total_amount, paid_amount, security_deposit, status, payment_status,
  payment_method, notes, created_by
) VALUES 
('850e8400-e29b-41d4-a716-446655440001', 'CON-2024-001', 
 '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 
 '2024-01-15', '2024-02-15', 220, 6820, 6820, 2200, 'active', 'paid', 'cash', 'عقد شهري مع عميل مميز', auth.uid()),
('850e8400-e29b-41d4-a716-446655440002', 'CON-2024-002', 
 '650e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440002', 
 '2024-01-10', '2024-01-25', 230, 3450, 2000, 2300, 'active', 'partial', 'credit_card', 'عقد قصير الأمد', auth.uid()),
('850e8400-e29b-41d4-a716-446655440003', 'CON-2024-003', 
 '650e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', 
 '2023-12-20', '2024-01-05', 190, 3040, 3040, 1900, 'completed', 'paid', 'bank_transfer', 'عقد منتهي بنجاح', auth.uid()),
('850e8400-e29b-41d4-a716-446655440004', 'CON-2024-004', 
 '650e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440004', 
 '2024-02-01', '2024-03-01', 250, 7750, 5000, 2500, 'active', 'partial', 'pos', 'عقد شهري قيد التحصيل', auth.uid()),
('850e8400-e29b-41d4-a716-446655440005', 'CON-2024-005', 
 '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440005', 
 '2024-01-01', '2024-01-08', 180, 1440, 1440, 1800, 'completed', 'paid', 'cash', 'عقد أسبوعي منتهي', auth.uid());

-- إضافة سندات قبض مرتبطة بالعقود
INSERT INTO payment_receipts (
  id, receipt_number, contract_id, customer_id, customer_name, vehicle_id, 
  amount, payment_method, payment_date, type, status, issued_by, notes
) VALUES 
('950e8400-e29b-41d4-a716-446655440001', 'REC-2024-000001', 
 '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 
 'عبدالرحمن أحمد السالم', '650e8400-e29b-41d4-a716-446655440003', 
 6820, 'cash', '2024-01-15', 'rental_payment', 'confirmed', auth.uid(), 'دفع كامل للعقد'),
('950e8400-e29b-41d4-a716-446655440002', 'REC-2024-000002', 
 '850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 
 'سارة محمد الحربي', '650e8400-e29b-41d4-a716-446655440009', 
 2000, 'credit_card', '2024-01-10', 'rental_payment', 'confirmed', auth.uid(), 'دفعة جزئية'),
('950e8400-e29b-41d4-a716-446655440003', 'REC-2024-000003', 
 '850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', 
 'خالد عبدالله القرني', '650e8400-e29b-41d4-a716-446655440007', 
 3040, 'bank_transfer', '2023-12-20', 'rental_payment', 'confirmed', auth.uid(), 'دفع كامل');

-- إضافة سجلات صيانة
INSERT INTO vehicle_maintenance (
  id, vehicle_id, maintenance_type, description, status, scheduled_date,
  completed_date, cost, labor_cost, parts_cost, mechanic_id, odometer_in, odometer_out
) VALUES 
('A50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', 
 'periodic', 'صيانة دورية شاملة', 'completed', '2024-01-20', '2024-01-22', 850, 300, 550, null, 35000, 35000),
('A50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 
 'breakdown', 'إصلاح نظام التكييف', 'in_progress', '2024-02-01', null, 0, 0, 0, null, 15000, null),
('A50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', 
 'inspection', 'فحص دوري قبل التجديد', 'scheduled', '2024-02-15', null, 0, 0, 0, null, null, null);

-- إضافة إشعارات ذكية
INSERT INTO smart_notifications (
  id, title, message, type, category, priority, status, 
  reference_type, reference_id, user_id, created_at
) VALUES 
('B50e8400-e29b-41d4-a716-446655440001', 'انتهاء صلاحية التأمين قريباً', 
 'تأمين المركبة أ ب ج 123 سينتهي خلال 30 يوماً', 'document_expiry', 'system', 'high', 'unread', 
 'vehicle', '650e8400-e29b-41d4-a716-446655440001', null, now() - interval '2 hours'),
('B50e8400-e29b-41d4-a716-446655440002', 'عقد يحتاج متابعة دفع', 
 'العقد CON-2024-002 له مستحقات متأخرة', 'payment_due', 'financial', 'medium', 'unread', 
 'contract', '850e8400-e29b-41d4-a716-446655440002', null, now() - interval '1 day'),
('B50e8400-e29b-41d4-a716-446655440003', 'صيانة مجدولة غداً', 
 'المركبة د هـ و 456 لها موعد صيانة غداً', 'maintenance_due', 'maintenance', 'medium', 'unread', 
 'vehicle', '650e8400-e29b-41d4-a716-446655440002', null, now() - interval '6 hours');
