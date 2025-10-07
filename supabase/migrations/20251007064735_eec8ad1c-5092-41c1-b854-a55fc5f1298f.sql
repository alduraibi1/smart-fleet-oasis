-- إضافة حقول جديدة لجدول vehicles لدعم بيانات علم
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS registration_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS inspection_expiry DATE,
ADD COLUMN IF NOT EXISTS inspection_status VARCHAR(20) DEFAULT 'valid',
ADD COLUMN IF NOT EXISTS insurance_status VARCHAR(20) DEFAULT 'valid',
ADD COLUMN IF NOT EXISTS renewal_fees DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS renewal_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS registration_expiry DATE;

-- إنشاء index للبحث السريع بتاريخ انتهاء الفحص والتأمين
CREATE INDEX IF NOT EXISTS idx_vehicles_inspection_expiry ON public.vehicles(inspection_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_expiry ON public.vehicles(insurance_expiry);
CREATE INDEX IF NOT EXISTS idx_vehicles_registration_expiry ON public.vehicles(registration_expiry);

-- إضافة تعليقات توضيحية
COMMENT ON COLUMN public.vehicles.registration_type IS 'نوع التسجيل: خاص، عام، نقل، إلخ';
COMMENT ON COLUMN public.vehicles.inspection_expiry IS 'تاريخ انتهاء الفحص الدوري';
COMMENT ON COLUMN public.vehicles.inspection_status IS 'حالة الفحص: valid, expired, near_expiry';
COMMENT ON COLUMN public.vehicles.insurance_status IS 'حالة التأمين: valid, expired, near_expiry';
COMMENT ON COLUMN public.vehicles.renewal_fees IS 'رسوم تجديد التسجيل';
COMMENT ON COLUMN public.vehicles.renewal_status IS 'حالة التجديد: active, pending, overdue';
COMMENT ON COLUMN public.vehicles.registration_expiry IS 'تاريخ انتهاء رخصة السير';