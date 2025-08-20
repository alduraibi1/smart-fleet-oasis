
-- تمكين القراءة للمستخدمين المسجلين فقط على الجداول الأساسية لعرض البيانات في الواجهة

-- المركبات
CREATE POLICY "auth can read vehicles"
  ON public.vehicles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- صور المركبات
CREATE POLICY "auth can read vehicle_images"
  ON public.vehicle_images
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- مواقع المركبات
CREATE POLICY "auth can read vehicle_location"
  ON public.vehicle_location
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ملاك المركبات
CREATE POLICY "auth can read vehicle_owners"
  ON public.vehicle_owners
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- الميكانيكيون
CREATE POLICY "auth can read mechanics"
  ON public.mechanics
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- الموردون
CREATE POLICY "auth can read suppliers"
  ON public.suppliers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- مواد المخزون
CREATE POLICY "auth can read inventory_items"
  ON public.inventory_items
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- سجلات الصيانة
CREATE POLICY "auth can read vehicle_maintenance"
  ON public.vehicle_maintenance
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- الأجزاء المستخدمة في الصيانة
CREATE POLICY "auth can read maintenance_parts_used"
  ON public.maintenance_parts_used
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- الزيوت المستخدمة في الصيانة
CREATE POLICY "auth can read maintenance_oils_used"
  ON public.maintenance_oils_used
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ساعات العمل للصيانة
CREATE POLICY "auth can read maintenance_work_hours"
  ON public.maintenance_work_hours
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- إعدادات النظام (لتحميل الإعدادات العامة)
CREATE POLICY "auth can read system_settings"
  ON public.system_settings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
