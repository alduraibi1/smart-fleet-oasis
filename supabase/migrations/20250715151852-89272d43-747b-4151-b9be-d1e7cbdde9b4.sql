-- إنشاء bucket للعملاء
INSERT INTO storage.buckets (id, name, public) VALUES ('customers', 'customers', true);

-- إنشاء سياسات التخزين للعملاء
CREATE POLICY "المستخدمون المسجلون يمكنهم عرض وثائق العملاء" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'customers' AND auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم رفع وثائق العملاء" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'customers' AND auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم تحديث وثائق العملاء" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'customers' AND auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم حذف وثائق العملاء" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'customers' AND auth.uid() IS NOT NULL);