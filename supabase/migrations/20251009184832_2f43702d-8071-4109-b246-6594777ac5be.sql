-- تصحيح المبلغ السالب في العقد
-- حساب المبلغ الصحيح: من 2025-10-15 إلى 2026-01-30 = 107 أيام
-- 107 أيام * 65 ريال يومياً = 6955 ريال

UPDATE rental_contracts 
SET 
  total_amount = 6955.00,
  remaining_amount = 5955.00,  -- 6955 - 1000 (الوديعة المدفوعة)
  daily_rate = 65.00
WHERE id = 'a4308511-3bf4-4469-b3d6-b52a4d1e3000';

-- إضافة تعليق للتوثيق
COMMENT ON COLUMN rental_contracts.total_amount IS 'المبلغ الإجمالي للعقد (أيام العقد * السعر اليومي)';
