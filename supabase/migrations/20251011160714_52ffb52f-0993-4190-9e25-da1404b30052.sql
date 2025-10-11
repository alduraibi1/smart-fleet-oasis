-- المرحلة 1: إضافة حقل rental_paid_amount لتتبع المدفوع من الإيجار فقط
ALTER TABLE rental_contracts 
ADD COLUMN IF NOT EXISTS rental_paid_amount NUMERIC DEFAULT 0 
CHECK (rental_paid_amount >= 0);

COMMENT ON COLUMN rental_contracts.rental_paid_amount IS 
'المبلغ المدفوع من قيمة الإيجار فقط (لا يشمل الوديعة)';