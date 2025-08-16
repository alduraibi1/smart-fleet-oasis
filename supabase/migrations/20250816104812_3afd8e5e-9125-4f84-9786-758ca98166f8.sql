
-- إنشاء جدول التنبؤات للصيانة
CREATE TABLE IF NOT EXISTS public.maintenance_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  prediction_type VARCHAR(50) NOT NULL DEFAULT 'maintenance',
  predicted_date DATE,
  predicted_mileage INTEGER,
  confidence_score NUMERIC(3,2) DEFAULT 0.75,
  recommendations JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إضافة RLS للجدول
ALTER TABLE public.maintenance_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage maintenance predictions" 
ON public.maintenance_predictions 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- إنشاء دالة لتوليد التنبؤات (مبسطة)
CREATE OR REPLACE FUNCTION public.generate_maintenance_predictions(p_vehicle_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_maintenance_date DATE;
  predicted_date DATE;
  result JSONB;
BEGIN
  -- الحصول على تاريخ آخر صيانة
  SELECT MAX(completed_date) INTO last_maintenance_date
  FROM vehicle_maintenance 
  WHERE vehicle_id = p_vehicle_id AND status = 'completed';
  
  -- حساب التاريخ المتوقع للصيانة القادمة (كل 6 أشهر افتراضياً)
  predicted_date := COALESCE(last_maintenance_date, CURRENT_DATE) + INTERVAL '6 months';
  
  -- حذف التنبؤات القديمة لهذه المركبة
  DELETE FROM maintenance_predictions 
  WHERE vehicle_id = p_vehicle_id AND prediction_type = 'maintenance';
  
  -- إدراج تنبؤ جديد
  INSERT INTO maintenance_predictions (
    vehicle_id, 
    prediction_type, 
    predicted_date, 
    confidence_score,
    recommendations,
    status
  ) VALUES (
    p_vehicle_id,
    'maintenance',
    predicted_date,
    0.75,
    jsonb_build_object(
      'maintenance_type', 'periodic_maintenance',
      'estimated_cost', 800,
      'priority', 'medium'
    ),
    'active'
  );
  
  result := jsonb_build_object(
    'success', true,
    'predicted_date', predicted_date,
    'message', 'تم توليد تنبؤ الصيانة بنجاح'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_maintenance_predictions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER maintenance_predictions_updated_at
  BEFORE UPDATE ON maintenance_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_predictions_updated_at();
