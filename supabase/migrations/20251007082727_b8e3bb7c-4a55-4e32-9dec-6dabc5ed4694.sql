-- إضافة حقول جديدة لجدول vehicles
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS min_daily_rate NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS max_daily_rate NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS insurance_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100);

-- تحديث القيم الافتراضية للأسعار بناءً على السعر اليومي الحالي
UPDATE vehicles 
SET min_daily_rate = daily_rate * 0.8,
    max_daily_rate = daily_rate * 1.2
WHERE min_daily_rate IS NULL OR max_daily_rate IS NULL;

-- إنشاء جدول لنقاط فحص المركبة (30 نقطة من الصورة)
CREATE TABLE IF NOT EXISTS vehicle_inspection_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  
  -- الهيكل الخارجي (7 نقاط)
  body_front BOOLEAN DEFAULT false,
  body_rear BOOLEAN DEFAULT false,
  body_right_side BOOLEAN DEFAULT false,
  body_left_side BOOLEAN DEFAULT false,
  body_roof BOOLEAN DEFAULT false,
  body_hood BOOLEAN DEFAULT false,
  body_trunk BOOLEAN DEFAULT false,
  
  -- الإطارات والجنوط (5 نقاط)
  tires_front_right BOOLEAN DEFAULT false,
  tires_front_left BOOLEAN DEFAULT false,
  tires_rear_right BOOLEAN DEFAULT false,
  tires_rear_left BOOLEAN DEFAULT false,
  spare_tire BOOLEAN DEFAULT false,
  
  -- الأضواء (6 نقاط)
  lights_headlights BOOLEAN DEFAULT false,
  lights_tail_lights BOOLEAN DEFAULT false,
  lights_brake_lights BOOLEAN DEFAULT false,
  lights_turn_signals BOOLEAN DEFAULT false,
  lights_fog_lights BOOLEAN DEFAULT false,
  lights_interior BOOLEAN DEFAULT false,
  
  -- الزجاج والمرايا (4 نقاط)
  glass_windshield BOOLEAN DEFAULT false,
  glass_rear_window BOOLEAN DEFAULT false,
  glass_side_windows BOOLEAN DEFAULT false,
  mirrors BOOLEAN DEFAULT false,
  
  -- المحرك والميكانيك (4 نقاط)
  engine_condition BOOLEAN DEFAULT false,
  oil_level BOOLEAN DEFAULT false,
  coolant_level BOOLEAN DEFAULT false,
  battery_condition BOOLEAN DEFAULT false,
  
  -- الداخلية (4 نقاط)
  interior_seats BOOLEAN DEFAULT false,
  interior_dashboard BOOLEAN DEFAULT false,
  interior_controls BOOLEAN DEFAULT false,
  interior_cleanliness BOOLEAN DEFAULT false,
  
  -- معلومات الفحص
  inspector_name VARCHAR(255),
  inspection_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  overall_condition VARCHAR(50) CHECK (overall_condition IN ('excellent', 'good', 'fair', 'poor')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- إنشاء index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_vehicle_inspection_points_vehicle_id ON vehicle_inspection_points(vehicle_id);

-- تفعيل RLS
ALTER TABLE vehicle_inspection_points ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة نقاط الفحص"
  ON vehicle_inspection_points
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_inspection_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inspection_points_timestamp
  BEFORE UPDATE ON vehicle_inspection_points
  FOR EACH ROW
  EXECUTE FUNCTION update_inspection_points_updated_at();

-- إنشاء storage bucket للصور
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- سياسات Storage للصور
CREATE POLICY "المستخدمون المسجلون يمكنهم رفع الصور"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "الجميع يمكنهم مشاهدة صور المركبات"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "المستخدمون المسجلون يمكنهم حذف الصور"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'vehicle-images');

COMMENT ON TABLE vehicle_inspection_points IS 'جدول لحفظ نقاط فحص المركبة الشاملة (30 نقطة)';
COMMENT ON COLUMN vehicles.min_daily_rate IS 'الحد الأدنى للسعر اليومي';
COMMENT ON COLUMN vehicles.max_daily_rate IS 'الحد الأقصى للسعر اليومي';
COMMENT ON COLUMN vehicles.insurance_company IS 'شركة التأمين';
COMMENT ON COLUMN vehicles.insurance_policy_number IS 'رقم وثيقة التأمين';