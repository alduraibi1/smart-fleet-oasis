-- إضافة عمود رقم الهاتف البديل لجهة الاتصال للطوارئ
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS emergency_contact_phone_secondary VARCHAR(20);

COMMENT ON COLUMN customers.emergency_contact_phone_secondary IS 'رقم الهاتف البديل لجهة الاتصال في حالات الطوارئ';