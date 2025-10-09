-- إنشاء Storage Bucket للعقود إذا لم يكن موجوداً
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'contracts'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('contracts', 'contracts', true);
  END IF;
END $$;