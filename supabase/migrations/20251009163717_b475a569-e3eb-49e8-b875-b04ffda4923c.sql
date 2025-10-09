-- المرحلة 1: إنشاء نظام ترقيم متسلسل للعقود
CREATE SEQUENCE IF NOT EXISTS contract_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT LPAD(nextval('contract_number_seq')::TEXT, 5, '0') INTO sequence_num;
  RETURN 'CR-' || year_part || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- المرحلة 2: إضافة حقول مفقودة لجدول العقود
ALTER TABLE rental_contracts 
ADD COLUMN IF NOT EXISTS vat_included BOOLEAN DEFAULT false;

ALTER TABLE rental_contracts 
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS handover_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS return_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT;

-- إضافة تعليق توضيحي
COMMENT ON COLUMN rental_contracts.vat_included IS 'هل المبلغ يشمل ضريبة القيمة المضافة';
COMMENT ON COLUMN rental_contracts.pdf_url IS 'رابط ملف PDF للعقد';
COMMENT ON COLUMN rental_contracts.handover_pdf_url IS 'رابط ملف PDF لنموذج استلام المركبة';
COMMENT ON COLUMN rental_contracts.return_pdf_url IS 'رابط ملف PDF لنموذج إرجاع المركبة';
COMMENT ON COLUMN rental_contracts.invoice_pdf_url IS 'رابط ملف PDF للفاتورة الضريبية';