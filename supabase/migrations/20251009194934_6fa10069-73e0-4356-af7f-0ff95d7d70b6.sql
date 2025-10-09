-- إنشاء bucket للصور التعاقدية
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-images', 'contract-images', true)
ON CONFLICT (id) DO NOTHING;

-- السماح للمستخدمين المصادقين برفع الصور
CREATE POLICY "Authenticated users can upload contract images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contract-images');

-- السماح للجميع بمشاهدة الصور
CREATE POLICY "Public can view contract images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'contract-images');

-- السماح للمستخدمين المصادقين بحذف صورهم
CREATE POLICY "Authenticated users can delete their contract images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contract-images');