-- إنشاء جدول سجلات المزامنة مع علم
CREATE TABLE IF NOT EXISTS public.elm_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_type VARCHAR(50) NOT NULL, -- 'manual', 'scheduled', 'api'
  records_processed INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  sync_status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'failed', 'partial'
  error_details JSONB,
  changes_summary JSONB,
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء جدول إعدادات المزامنة
CREATE TABLE IF NOT EXISTS public.elm_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN DEFAULT FALSE,
  sync_interval_hours INTEGER DEFAULT 24,
  last_sync TIMESTAMPTZ,
  next_sync TIMESTAMPTZ,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  sync_mode VARCHAR(20) DEFAULT 'incremental', -- 'full', 'incremental'
  notification_settings JSONB DEFAULT '{"onComplete": true, "onNewVehicles": true, "onExpirations": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.elm_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elm_sync_config ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول - المسؤولون والمديرون فقط
CREATE POLICY "Admins and managers can view sync logs"
ON public.elm_sync_logs
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admins can manage sync logs"
ON public.elm_sync_logs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins and managers can view sync config"
ON public.elm_sync_config
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Admins can manage sync config"
ON public.elm_sync_config
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- إنشاء صف إعدادات افتراضي
INSERT INTO public.elm_sync_config (is_enabled, sync_interval_hours, sync_mode)
VALUES (false, 24, 'incremental')
ON CONFLICT DO NOTHING;

-- إضافة دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_elm_sync_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER elm_sync_config_updated_at
BEFORE UPDATE ON public.elm_sync_config
FOR EACH ROW
EXECUTE FUNCTION update_elm_sync_config_updated_at();