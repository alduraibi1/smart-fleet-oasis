
-- إنشاء جدول لحفظ إعدادات التقارير المفضلة
CREATE TABLE public.saved_report_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول للتقارير المجدولة
CREATE TABLE public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  schedule_type VARCHAR(50) NOT NULL DEFAULT 'weekly',
  schedule_config JSONB NOT NULL DEFAULT '{}',
  recipients TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول لإعدادات الإشعارات التلقائية
CREATE TABLE public.profitability_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  threshold_config JSONB NOT NULL DEFAULT '{}',
  notification_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول لحفظ البيانات التاريخية للمقارنات
CREATE TABLE public.profitability_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'vehicle', 'owner', 'customer'
  entity_id UUID NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تطبيق RLS على الجداول الجديدة
ALTER TABLE public.saved_report_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profitability_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profitability_snapshots ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للإعدادات المحفوظة
CREATE POLICY "Users can manage their own report settings" 
  ON public.saved_report_settings 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- سياسات الأمان للتقارير المجدولة
CREATE POLICY "Users can manage their own scheduled reports" 
  ON public.scheduled_reports 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- سياسات الأمان لإشعارات الربحية
CREATE POLICY "Users can manage their own profitability alerts" 
  ON public.profitability_alerts 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- سياسات الأمان للبيانات التاريخية
CREATE POLICY "Authenticated users can view profitability snapshots" 
  ON public.profitability_snapshots 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert profitability snapshots" 
  ON public.profitability_snapshots 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- إنشاء فهارس للأداء
CREATE INDEX idx_saved_report_settings_user_id ON public.saved_report_settings(user_id);
CREATE INDEX idx_saved_report_settings_type ON public.saved_report_settings(report_type);
CREATE INDEX idx_scheduled_reports_user_id ON public.scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_next_run ON public.scheduled_reports(next_run_at) WHERE is_active = true;
CREATE INDEX idx_profitability_alerts_user_id ON public.profitability_alerts(user_id);
CREATE INDEX idx_profitability_snapshots_entity ON public.profitability_snapshots(entity_type, entity_id);
CREATE INDEX idx_profitability_snapshots_date ON public.profitability_snapshots(snapshot_date);

-- دالة لحفظ لقطة من بيانات الربحية
CREATE OR REPLACE FUNCTION public.save_profitability_snapshot(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_metrics JSONB,
  p_period_start DATE,
  p_period_end DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  snapshot_id UUID;
BEGIN
  -- حذف اللقطة الموجودة لنفس الكيان والفترة إن وجدت
  DELETE FROM public.profitability_snapshots
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND period_start = p_period_start
    AND period_end = p_period_end;
  
  -- إدراج لقطة جديدة
  INSERT INTO public.profitability_snapshots (
    snapshot_date,
    entity_type,
    entity_id,
    metrics,
    period_start,
    period_end
  ) VALUES (
    CURRENT_DATE,
    p_entity_type,
    p_entity_id,
    p_metrics,
    p_period_start,
    p_period_end
  ) RETURNING id INTO snapshot_id;
  
  RETURN snapshot_id;
END;
$$;

-- دالة للحصول على مقارنة بين الفترات
CREATE OR REPLACE FUNCTION public.get_profitability_comparison(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_current_start DATE,
  p_current_end DATE,
  p_previous_start DATE,
  p_previous_end DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_metrics JSONB;
  previous_metrics JSONB;
  comparison_result JSONB;
BEGIN
  -- الحصول على بيانات الفترة الحالية
  SELECT metrics INTO current_metrics
  FROM public.profitability_snapshots
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND period_start = p_current_start
    AND period_end = p_current_end
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- الحصول على بيانات الفترة السابقة
  SELECT metrics INTO previous_metrics
  FROM public.profitability_snapshots
  WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND period_start = p_previous_start
    AND period_end = p_previous_end
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- بناء نتيجة المقارنة
  comparison_result := jsonb_build_object(
    'current_period', jsonb_build_object(
      'start_date', p_current_start,
      'end_date', p_current_end,
      'metrics', COALESCE(current_metrics, '{}'::jsonb)
    ),
    'previous_period', jsonb_build_object(
      'start_date', p_previous_start,
      'end_date', p_previous_end,
      'metrics', COALESCE(previous_metrics, '{}'::jsonb)
    ),
    'has_comparison', (current_metrics IS NOT NULL AND previous_metrics IS NOT NULL)
  );
  
  RETURN comparison_result;
END;
$$;

-- دالة للتحقق من تجاوز عتبات الربحية
CREATE OR REPLACE FUNCTION public.check_profitability_thresholds()
RETURNS TABLE (
  alert_type VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id UUID,
  entity_name TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  severity VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- التحقق من المركبات ذات الربحية المنخفضة
  RETURN QUERY
  WITH vehicle_alerts AS (
    SELECT 
      'low_profitability'::VARCHAR(50) as alert_type,
      'vehicle'::VARCHAR(50) as entity_type,
      v.id as entity_id,
      (v.plate_number || ' - ' || v.brand || ' ' || v.model) as entity_name,
      COALESCE((s.metrics->>'profit_margin')::NUMERIC, 0) as current_value,
      -5.0::NUMERIC as threshold_value,
      CASE 
        WHEN COALESCE((s.metrics->>'profit_margin')::NUMERIC, 0) < -10 THEN 'critical'
        WHEN COALESCE((s.metrics->>'profit_margin')::NUMERIC, 0) < -5 THEN 'warning'
        ELSE 'info'
      END::VARCHAR(20) as severity
    FROM vehicles v
    LEFT JOIN profitability_snapshots s ON s.entity_id = v.id 
      AND s.entity_type = 'vehicle' 
      AND s.snapshot_date = CURRENT_DATE
    WHERE v.status = 'available'
      AND COALESCE((s.metrics->>'profit_margin')::NUMERIC, 0) < -5
  )
  SELECT * FROM vehicle_alerts;
END;
$$;

-- تحديث الجدول المالي للربط مع المحاسبة
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS profitability_snapshot_id UUID REFERENCES public.profitability_snapshots(id);

-- إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_profitability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_saved_report_settings_updated_at
  BEFORE UPDATE ON public.saved_report_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_profitability();

CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_profitability();

CREATE TRIGGER update_profitability_alerts_updated_at
  BEFORE UPDATE ON public.profitability_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_profitability();
