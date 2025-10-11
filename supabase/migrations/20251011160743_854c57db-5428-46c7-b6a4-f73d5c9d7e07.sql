-- المرحلة 5: إضافة CHECK constraint لضمان الحد الأدنى للوديعة
ALTER TABLE rental_contracts 
DROP CONSTRAINT IF EXISTS rental_contracts_deposit_minimum_check;

ALTER TABLE rental_contracts 
ADD CONSTRAINT rental_contracts_deposit_minimum_check 
CHECK (deposit_amount >= 1000);

COMMENT ON CONSTRAINT rental_contracts_deposit_minimum_check 
ON rental_contracts IS 
'الحد الأدنى للوديعة 1000 ريال سعودي';