-- حذف جميع سياسات INSERT المتضاربة على جدول vehicles
DROP POLICY IF EXISTS "Authenticated users can insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_admin_manager" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_by_role_or_permission" ON public.vehicles;

-- إنشاء سياسة INSERT واضحة وبسيطة للمستخدمين المسجلين
CREATE POLICY "allow_authenticated_insert_vehicles"
ON public.vehicles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- التأكد من أن سياسات SELECT موجودة للمستخدمين المسجلين
DROP POLICY IF EXISTS "vehicles_select_by_role" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_select_by_role_or_permission" ON public.vehicles;

CREATE POLICY "allow_authenticated_select_vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);