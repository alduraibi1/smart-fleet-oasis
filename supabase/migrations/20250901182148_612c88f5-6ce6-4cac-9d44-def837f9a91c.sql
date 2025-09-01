-- إضافة فئات المخزون الأساسية
INSERT INTO inventory_categories (name, description) VALUES
('قطع غيار', 'قطع غيار السيارات والمركبات'),
('زيوت ومواد التشحيم', 'زيوت المحركات ومواد التشحيم المختلفة'),
('إطارات', 'إطارات وكفرات المركبات'),
('مواد استهلاكية', 'المواد الاستهلاكية العامة'),
('أدوات وعدد', 'أدوات الصيانة والإصلاح');

-- الحصول على معرفات الفئات للاستخدام في البيانات التالية
DO $$
DECLARE
    spare_parts_id UUID;
    oils_id UUID;
    tires_id UUID;
    consumables_id UUID;
    tools_id UUID;
BEGIN
    -- الحصول على معرفات الفئات
    SELECT id INTO spare_parts_id FROM inventory_categories WHERE name = 'قطع غيار';
    SELECT id INTO oils_id FROM inventory_categories WHERE name = 'زيوت ومواد التشحيم';
    SELECT id INTO tires_id FROM inventory_categories WHERE name = 'إطارات';
    SELECT id INTO consumables_id FROM inventory_categories WHERE name = 'مواد استهلاكية';
    SELECT id INTO tools_id FROM inventory_categories WHERE name = 'أدوات وعدد';

    -- إضافة عناصر المخزون
    -- قطع الغيار
    INSERT INTO inventory_items (category_id, name, description, sku, part_number, unit_cost, selling_price, current_stock, minimum_stock, maximum_stock, reorder_point, unit_of_measure, location) VALUES
    (spare_parts_id, 'فلتر هواء', 'فلتر هواء للمحرك', 'AF-001', 'AIR-FILTER-STD', 25.50, 35.00, 50, 10, 100, 15, 'قطعة', 'A1-01'),
    (spare_parts_id, 'فلتر زيت', 'فلتر زيت المحرك', 'OF-001', 'OIL-FILTER-STD', 18.75, 28.00, 75, 15, 150, 20, 'قطعة', 'A1-02'),
    (spare_parts_id, 'شمعات الإشعال', 'شمعات إشعال للمحرك', 'SP-001', 'SPARK-PLUG-STD', 12.00, 18.50, 120, 20, 200, 30, 'قطعة', 'A1-03'),
    (spare_parts_id, 'تيل فرامل أمامي', 'تيل فرامل للعجل الأمامي', 'BP-F001', 'BRAKE-PAD-FRONT', 85.00, 125.00, 40, 8, 80, 12, 'طقم', 'A2-01'),
    (spare_parts_id, 'تيل فرامل خلفي', 'تيل فرامل للعجل الخلفي', 'BP-R001', 'BRAKE-PAD-REAR', 75.00, 110.00, 35, 8, 70, 12, 'طقم', 'A2-02');

    -- زيوت ومواد التشحيم
    INSERT INTO inventory_items (category_id, name, description, sku, unit_cost, selling_price, current_stock, minimum_stock, maximum_stock, reorder_point, unit_of_measure, location) VALUES
    (oils_id, 'زيت محرك 5W-30', 'زيت محرك سينثتيك 5W-30', 'EO-5W30', 45.00, 65.00, 80, 15, 150, 25, 'لتر', 'B1-01'),
    (oils_id, 'زيت محرك 10W-40', 'زيت محرك نصف سينثتيك 10W-40', 'EO-10W40', 38.50, 55.00, 60, 12, 120, 20, 'لتر', 'B1-02'),
    (oils_id, 'زيت فرامل DOT 4', 'سائل فرامل DOT 4', 'BF-DOT4', 22.00, 32.00, 25, 5, 50, 8, 'لتر', 'B2-01'),
    (oils_id, 'مياه رديتر', 'مياه تبريد للرديتر', 'CF-001', 15.50, 24.00, 40, 8, 80, 12, 'لتر', 'B2-02');

    -- إطارات
    INSERT INTO inventory_items (category_id, name, description, sku, unit_cost, selling_price, current_stock, minimum_stock, maximum_stock, reorder_point, unit_of_measure, location) VALUES
    (tires_id, 'إطار 195/65R15', 'إطار راديال مقاس 195/65R15', 'TR-19565R15', 280.00, 420.00, 20, 4, 40, 6, 'قطعة', 'C1-01'),
    (tires_id, 'إطار 205/55R16', 'إطار راديال مقاس 205/55R16', 'TR-20555R16', 320.00, 480.00, 16, 4, 32, 6, 'قطعة', 'C1-02'),
    (tires_id, 'إطار 225/45R17', 'إطار راديال مقاس 225/45R17', 'TR-22545R17', 380.00, 570.00, 12, 3, 24, 5, 'قطعة', 'C1-03');

    -- مواد استهلاكية
    INSERT INTO inventory_items (category_id, name, description, sku, unit_cost, selling_price, current_stock, minimum_stock, maximum_stock, reorder_point, unit_of_measure, location) VALUES
    (consumables_id, 'مناديل ورقية', 'مناديل ورقية للتنظيف', 'PT-001', 8.50, 12.00, 100, 20, 200, 30, 'علبة', 'D1-01'),
    (consumables_id, 'قفازات نايلون', 'قفازات نايلون للحماية', 'GL-001', 15.00, 22.50, 50, 10, 100, 15, 'علبة', 'D1-02'),
    (consumables_id, 'ملمع السيارات', 'ملمع وواكس للسيارات', 'CP-001', 28.00, 42.00, 30, 6, 60, 10, 'علبة', 'D2-01');

    -- أدوات وعدد
    INSERT INTO inventory_items (category_id, name, description, sku, unit_cost, selling_price, current_stock, minimum_stock, maximum_stock, reorder_point, unit_of_measure, location) VALUES
    (tools_id, 'مفتاح ربط 10مم', 'مفتاح ربط حجم 10مم', 'WR-10MM', 12.50, 18.00, 25, 5, 50, 8, 'قطعة', 'E1-01'),
    (tools_id, 'مفتاح ربط 14مم', 'مفتاح ربط حجم 14مم', 'WR-14MM', 14.50, 21.00, 20, 4, 40, 6, 'قطعة', 'E1-02'),
    (tools_id, 'مقياس ضغط الإطار', 'مقياس ضغط هوائي للإطارات', 'TG-001', 45.00, 68.00, 8, 2, 16, 3, 'قطعة', 'E2-01');

    -- إضافة حركات مخزون تجريبية (إدخال أولي)
    INSERT INTO stock_transactions (item_id, transaction_type, quantity, unit_cost, total_cost, reference_type, notes, performed_by) 
    SELECT id, 'in', current_stock, unit_cost, current_stock * unit_cost, 'initial_stock', 'رصيد أولي', auth.uid()
    FROM inventory_items;

    -- إضافة بعض حركات الإخراج للاختبار
    INSERT INTO stock_transactions (item_id, transaction_type, quantity, unit_cost, total_cost, reference_type, notes, performed_by)
    SELECT id, 'out', 5, unit_cost, 5 * unit_cost, 'maintenance', 'استخدام في الصيانة', auth.uid()
    FROM inventory_items 
    WHERE name IN ('فلتر هواء', 'زيت محرك 5W-30', 'تيل فرامل أمامي')
    LIMIT 3;

    -- تحديث المخزون بعد الإخراج
    UPDATE inventory_items 
    SET current_stock = current_stock - 5, updated_at = now()
    WHERE name IN ('فلتر هواء', 'زيت محرك 5W-30', 'تيل فرامل أمامي');

END $$;