-- إنشاء bucket للمستندات إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-documents', 'contract-documents', false)
ON CONFLICT (id) DO NOTHING;

-- إضافة أعمدة لروابط PDF في جدول العقود إذا لم تكن موجودة
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'rental_contracts' 
                 AND column_name = 'contract_pdf_url') THEN
    ALTER TABLE rental_contracts ADD COLUMN contract_pdf_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'rental_contracts' 
                 AND column_name = 'invoice_pdf_url') THEN
    ALTER TABLE rental_contracts ADD COLUMN invoice_pdf_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'rental_contracts' 
                 AND column_name = 'handover_pdf_url') THEN
    ALTER TABLE rental_contracts ADD COLUMN handover_pdf_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'rental_contracts' 
                 AND column_name = 'return_pdf_url') THEN
    ALTER TABLE rental_contracts ADD COLUMN return_pdf_url TEXT;
  END IF;
END $$;

-- سياسات RLS للـ bucket
CREATE POLICY "Authenticated users can upload contract documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contract-documents');

CREATE POLICY "Authenticated users can read contract documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contract-documents');

CREATE POLICY "Authenticated users can update contract documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'contract-documents');

CREATE POLICY "Authenticated users can delete contract documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contract-documents');

COMMENT ON COLUMN rental_contracts.contract_pdf_url IS 'رابط ملف PDF لعقد الإيجار';
COMMENT ON COLUMN rental_contracts.invoice_pdf_url IS 'رابط ملف PDF للفاتورة الضريبية';
COMMENT ON COLUMN rental_contracts.handover_pdf_url IS 'رابط ملف PDF لنموذج الاستلام';
COMMENT ON COLUMN rental_contracts.return_pdf_url IS 'رابط ملف PDF لنموذج الإرجاع';
