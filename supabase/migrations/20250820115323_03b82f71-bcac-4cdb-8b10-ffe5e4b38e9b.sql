
-- إنشاء جدول معلومات التأمين للمركبات
CREATE TABLE public.vehicle_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  insurance_company TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  insurance_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive',
  coverage_amount NUMERIC(12,2),
  premium_amount NUMERIC(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول سجل مواقع المركبات التاريخية
CREATE TABLE public.vehicle_location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  address TEXT,
  speed NUMERIC(5,2),
  direction NUMERIC(5,2),
  fuel_level NUMERIC(5,2),
  engine_status VARCHAR(20),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source VARCHAR(50) DEFAULT 'external_tracker',
  raw_data JSONB
);

-- إنشاء جدول أجهزة التتبع
CREATE TABLE public.vehicle_trackers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  tracker_id TEXT NOT NULL UNIQUE,
  tracker_type VARCHAR(50) DEFAULT 'gps',
  provider VARCHAR(100),
  sim_number TEXT,
  installation_date DATE,
  last_communication TIMESTAMP WITH TIME ZONE,
  battery_level NUMERIC(5,2),
  signal_strength NUMERIC(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول مناطق السياج الجغرافي
CREATE TABLE public.geofences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  center_latitude NUMERIC(10,8) NOT NULL,
  center_longitude NUMERIC(11,8) NOT NULL,
  radius_meters INTEGER NOT NULL,
  polygon_coordinates JSONB,
  geofence_type VARCHAR(20) DEFAULT 'circular',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول ربط المركبات بالمناطق الجغرافية
CREATE TABLE public.vehicle_geofences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  geofence_id UUID NOT NULL REFERENCES public.geofences(id) ON DELETE CASCADE,
  alert_on_entry BOOLEAN DEFAULT false,
  alert_on_exit BOOLEAN DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id, geofence_id)
);

-- إنشاء جدول تنبيهات السياج الجغرافي
CREATE TABLE public.geofence_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  geofence_id UUID NOT NULL REFERENCES public.geofences(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL, -- 'entry', 'exit'
  location_latitude NUMERIC(10,8),
  location_longitude NUMERIC(11,8),
  alert_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- إنشاء جدول بيانات الاتصال مع نظام التتبع الخارجي
CREATE TABLE public.external_tracking_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_name TEXT NOT NULL,
  api_endpoint TEXT,
  username TEXT,
  password_encrypted TEXT,
  api_key_encrypted TEXT,
  sync_interval_minutes INTEGER DEFAULT 5,
  last_sync TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_vehicle_insurance_vehicle_id ON public.vehicle_insurance(vehicle_id);
CREATE INDEX idx_vehicle_insurance_end_date ON public.vehicle_insurance(end_date);
CREATE INDEX idx_vehicle_location_history_vehicle_id ON public.vehicle_location_history(vehicle_id);
CREATE INDEX idx_vehicle_location_history_recorded_at ON public.vehicle_location_history(recorded_at);
CREATE INDEX idx_vehicle_trackers_vehicle_id ON public.vehicle_trackers(vehicle_id);
CREATE INDEX idx_vehicle_trackers_tracker_id ON public.vehicle_trackers(tracker_id);
CREATE INDEX idx_geofence_alerts_vehicle_id ON public.geofence_alerts(vehicle_id);
CREATE INDEX idx_geofence_alerts_alert_time ON public.geofence_alerts(alert_time);

-- إضافة Row Level Security
ALTER TABLE public.vehicle_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_tracking_config ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS
CREATE POLICY "Authenticated users can manage vehicle insurance" ON public.vehicle_insurance
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view location history" ON public.vehicle_location_history
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert location history" ON public.vehicle_location_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can manage vehicle trackers" ON public.vehicle_trackers
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage geofences" ON public.geofences
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage vehicle geofences" ON public.vehicle_geofences
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view geofence alerts" ON public.geofence_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage geofence alerts" ON public.geofence_alerts
  FOR ALL USING (true);

CREATE POLICY "Only admins can manage tracking config" ON public.external_tracking_config
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- إنشاء triggers للتحديث التلقائي
CREATE OR REPLACE FUNCTION update_vehicle_insurance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_vehicle_insurance_updated_at
  BEFORE UPDATE ON public.vehicle_insurance
  FOR each ROW EXECUTE PROCEDURE update_vehicle_insurance_updated_at();

CREATE TRIGGER trigger_update_vehicle_trackers_updated_at
  BEFORE UPDATE ON public.vehicle_trackers
  FOR each ROW EXECUTE PROCEDURE update_vehicle_insurance_updated_at();

CREATE TRIGGER trigger_update_geofences_updated_at
  BEFORE UPDATE ON public.geofences
  FOR each ROW EXECUTE PROCEDURE update_vehicle_insurance_updated_at();

CREATE TRIGGER trigger_update_external_tracking_config_updated_at
  BEFORE UPDATE ON public.external_tracking_config
  FOR each ROW EXECUTE PROCEDURE update_vehicle_insurance_updated_at();

-- إنشاء دالة للتحقق من انتهاء التأمين
CREATE OR REPLACE FUNCTION check_insurance_expiry()
RETURNS INTEGER AS $$
DECLARE
  expiring_count INTEGER := 0;
  insurance_record RECORD;
BEGIN
  -- البحث عن بوالص التأمين التي ستنتهي خلال 30 يوم
  FOR insurance_record IN 
    SELECT vi.*, v.plate_number, v.brand, v.model
    FROM vehicle_insurance vi
    JOIN vehicles v ON vi.vehicle_id = v.id
    WHERE vi.end_date <= CURRENT_DATE + INTERVAL '30 days'
      AND vi.end_date > CURRENT_DATE
      AND vi.is_active = true
  LOOP
    -- إنشاء تنبيه للتأمين المنتهي
    INSERT INTO smart_notifications (
      title,
      message,
      type,
      category,
      priority,
      reference_type,
      reference_id,
      delivery_channels,
      reference_data
    ) VALUES (
      'تنبيه انتهاء تأمين مركبة',
      'المركبة ' || insurance_record.plate_number || ' (' || insurance_record.brand || ' ' || insurance_record.model || ') سينتهي تأمينها في ' || insurance_record.end_date,
      'warning',
      'vehicles',
      CASE 
        WHEN insurance_record.end_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
        WHEN insurance_record.end_date <= CURRENT_DATE + INTERVAL '15 days' THEN 'high'
        ELSE 'medium'
      END,
      'vehicle',
      insurance_record.vehicle_id,
      ARRAY['in_app', 'email']::text[],
      jsonb_build_object(
        'insurance_company', insurance_record.insurance_company,
        'policy_number', insurance_record.policy_number,
        'end_date', insurance_record.end_date,
        'vehicle_plate', insurance_record.plate_number
      )
    );
    
    expiring_count := expiring_count + 1;
  END LOOP;
  
  RETURN expiring_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
