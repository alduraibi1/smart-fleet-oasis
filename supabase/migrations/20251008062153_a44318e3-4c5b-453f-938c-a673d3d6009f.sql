-- إصلاح سياسة UPDATE للمركبات
DROP POLICY IF EXISTS "Users can update vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_by_role" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_by_role_or_permission" ON public.vehicles;

-- إنشاء سياسة UPDATE واضحة وكاملة للمستخدمين المسجلين
CREATE POLICY "allow_authenticated_update_vehicles"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);