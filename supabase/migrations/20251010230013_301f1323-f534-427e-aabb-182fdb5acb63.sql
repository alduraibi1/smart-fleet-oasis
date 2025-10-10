-- إضافة قيم جديدة للمصروفات (استرداد الودائع)
ALTER TABLE payment_vouchers 
DROP CONSTRAINT IF EXISTS payment_vouchers_expense_category_check;

ALTER TABLE payment_vouchers 
ADD CONSTRAINT payment_vouchers_expense_category_check 
CHECK (expense_category IN (
  'maintenance', 'fuel', 'insurance', 'owner_commission', 
  'salary', 'office_expenses', 'parts_purchase', 
  'oil_purchase', 'service_fees', 'deposit_refund', 'other'
));

ALTER TABLE payment_vouchers 
DROP CONSTRAINT IF EXISTS payment_vouchers_expense_type_check;

ALTER TABLE payment_vouchers 
ADD CONSTRAINT payment_vouchers_expense_type_check 
CHECK (expense_type IN ('operational', 'capital', 'administrative', 'refund'));