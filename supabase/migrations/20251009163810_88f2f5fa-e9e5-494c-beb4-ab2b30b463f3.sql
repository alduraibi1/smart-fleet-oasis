-- إصلاح دالة الترقيم لتكون آمنة
DROP FUNCTION IF EXISTS generate_contract_number();

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT LPAD(nextval('contract_number_seq')::TEXT, 5, '0') INTO sequence_num;
  RETURN 'CR-' || year_part || '-' || sequence_num;
END;
$$;