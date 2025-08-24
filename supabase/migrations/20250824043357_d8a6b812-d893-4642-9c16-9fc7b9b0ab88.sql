
-- إضافة عمود tracker_id إلى جدول المركبات
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS tracker_id VARCHAR(50);

-- إنشاء فهرس للبحث السريع بـ tracker_id
CREATE INDEX IF NOT EXISTS idx_vehicles_tracker_id ON public.vehicles(tracker_id);

-- إنشاء جدول لتفاصيل التأمين
CREATE TABLE IF NOT EXISTS public.vehicle_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  insurance_company VARCHAR(255),
  policy_number VARCHAR(100),
  start_date DATE,
  end_date DATE,
  coverage_amount DECIMAL(12,2),
  premium_amount DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تمكين RLS للجدول الجديد
ALTER TABLE public.vehicle_insurance ENABLE ROW LEVEL SECURITY;

-- إضافة سياسة الأمان للتأمين
CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة التأمين" ON public.vehicle_insurance
  FOR ALL USING (auth.uid() IS NOT NULL);

-- إنشاء جدول لربط أجهزة التتبع
CREATE TABLE IF NOT EXISTS public.vehicle_tracker_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  tracker_id VARCHAR(50) NOT NULL,
  plate_number VARCHAR(20) NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tracker_id),
  UNIQUE(vehicle_id)
);

-- تمكين RLS لجدول الربط
ALTER TABLE public.vehicle_tracker_mappings ENABLE ROW LEVEL SECURITY;

-- إضافة سياسة الأمان لربط أجهزة التتبع
CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة ربط التتبع" ON public.vehicle_tracker_mappings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- دالة لتطبيع أرقام اللوحات للمقارنة
CREATE OR REPLACE FUNCTION normalize_plate_number(plate TEXT)
RETURNS TEXT AS $$
BEGIN
  -- إزالة المسافات والرموز الخاصة وتحويل للأحرف العربية الموحدة
  RETURN TRIM(REGEXP_REPLACE(
    TRANSLATE(plate, 
      'أإآئ٠١٢٣٤٥٦٧٨٩', 
      'ااايء0123456789'
    ), 
    '[^ا-ي0-9]', '', 'g'
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- إضافة trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_vehicle_insurance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_insurance_updated_at_trigger
  BEFORE UPDATE ON public.vehicle_insurance
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_insurance_updated_at();

CREATE TRIGGER vehicle_tracker_mappings_updated_at_trigger
  BEFORE UPDATE ON public.vehicle_tracker_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
