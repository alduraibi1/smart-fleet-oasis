
-- المرحلة الرابعة: نظام التحليلات والذكاء الاصطناعي

-- جدول التنبؤات المالية بالذكاء الاصطناعي
CREATE TABLE financial_ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_type VARCHAR(50) NOT NULL, -- 'revenue', 'expense', 'profit', 'cash_flow'
  entity_type VARCHAR(50) NOT NULL, -- 'vehicle', 'customer', 'owner', 'overall'
  entity_id UUID, -- null للتنبؤات العامة
  
  prediction_date DATE NOT NULL,
  predicted_value NUMERIC NOT NULL,
  confidence_score NUMERIC DEFAULT 0.75 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- فترة التنبؤ
  prediction_period VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'quarterly'
  
  -- بيانات النموذج
  model_version VARCHAR(10) DEFAULT '1.0',
  input_features JSONB DEFAULT '{}', -- المتغيرات المستخدمة في التنبؤ
  accuracy_metrics JSONB DEFAULT '{}', -- مقاييس دقة النموذج
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الشذوذات المالية
CREATE TABLE financial_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_type VARCHAR(50) NOT NULL, -- 'revenue_drop', 'expense_spike', 'payment_delay'
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  anomaly_score NUMERIC NOT NULL CHECK (anomaly_score >= 0 AND anomaly_score <= 10),
  expected_value NUMERIC,
  actual_value NUMERIC,
  deviation_percentage NUMERIC,
  
  detection_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'detected', -- 'detected', 'investigating', 'resolved', 'false_positive'
  
  -- بيانات السياق
  context_data JSONB DEFAULT '{}',
  investigation_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول التحليلات السلوكية
CREATE TABLE behavioral_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type VARCHAR(50) NOT NULL, -- 'customer_behavior', 'payment_patterns', 'usage_trends'
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  
  -- نتائج التحليل
  pattern_data JSONB NOT NULL DEFAULT '{}',
  insights JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '{}',
  
  -- درجات المخاطر والفرص
  risk_score NUMERIC DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 10),
  opportunity_score NUMERIC DEFAULT 0 CHECK (opportunity_score >= 0 AND opportunity_score <= 10),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول مراكز التكلفة
CREATE TABLE cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_code VARCHAR(20) NOT NULL UNIQUE,
  center_name TEXT NOT NULL,
  center_type VARCHAR(50) NOT NULL, -- 'vehicle', 'customer', 'department', 'project'
  entity_id UUID, -- ربط بالكيان المرتبط
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول ربط الكيانات بمراكز التكلفة
CREATE TABLE cost_center_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  cost_center_id UUID NOT NULL REFERENCES cost_centers(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- فهرسة للجداول الجديدة
CREATE INDEX idx_financial_ai_predictions_entity ON financial_ai_predictions(entity_type, entity_id);
CREATE INDEX idx_financial_ai_predictions_date ON financial_ai_predictions(prediction_date);
CREATE INDEX idx_financial_anomalies_entity ON financial_anomalies(entity_type, entity_id);
CREATE INDEX idx_financial_anomalies_status ON financial_anomalies(status, detection_date);
CREATE INDEX idx_behavioral_analytics_entity ON behavioral_analytics(entity_type, entity_id);
CREATE INDEX idx_cost_centers_type ON cost_centers(center_type, is_active);

-- تفعيل RLS
ALTER TABLE financial_ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_center_mappings ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة التنبؤات المالية" ON financial_ai_predictions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة الشذوذات المالية" ON financial_anomalies
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة التحليلات السلوكية" ON behavioral_analytics
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage cost centers" ON cost_centers
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage cost center mappings" ON cost_center_mappings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- triggers لتحديث updated_at
CREATE TRIGGER update_updated_at_predictions
  BEFORE UPDATE ON financial_ai_predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_updated_at_behavioral
  BEFORE UPDATE ON behavioral_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_updated_at_cost_centers
  BEFORE UPDATE ON cost_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة لضمان وجود مركز تكلفة للكيان
CREATE OR REPLACE FUNCTION ensure_cost_center_for_entity(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_center_code TEXT DEFAULT NULL,
  p_center_name TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_cc UUID;
  generated_code TEXT;
  generated_name TEXT;
  new_cc UUID;
BEGIN
  -- تحقق من وجود ربط مسبق
  SELECT cost_center_id INTO existing_cc
  FROM cost_center_mappings
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;

  IF existing_cc IS NOT NULL THEN
    RETURN existing_cc;
  END IF;

  -- توليد كود واسم افتراضيين إذا لم يمررا
  IF p_center_code IS NULL THEN
    generated_code := CASE p_entity_type
      WHEN 'vehicle' THEN 'VH-' || substr(p_entity_id::text, 1, 8)
      WHEN 'customer' THEN 'CU-' || substr(p_entity_id::text, 1, 8)
      WHEN 'owner' THEN 'OW-' || substr(p_entity_id::text, 1, 8)
      WHEN 'contract' THEN 'CT-' || substr(p_entity_id::text, 1, 8)
      ELSE 'CC-' || substr(p_entity_id::text, 1, 8)
    END;
  ELSE
    generated_code := p_center_code;
  END IF;

  IF p_center_name IS NULL THEN
    generated_name := initcap(p_entity_type) || ' ' || substr(p_entity_id::text, 1, 8);
  ELSE
    generated_name := p_center_name;
  END IF;

  -- إنشاء مركز التكلفة
  INSERT INTO cost_centers(center_code, center_name, center_type, entity_id)
  VALUES (generated_code, generated_name, p_entity_type, p_entity_id)
  RETURNING id INTO new_cc;

  -- ربطه بالكيان
  INSERT INTO cost_center_mappings(entity_type, entity_id, cost_center_id)
  VALUES (p_entity_type, p_entity_id, new_cc);

  RETURN new_cc;
END;
$$;

-- دالة لإنشاء مراكز تكلفة تلقائية للمركبات الجديدة
CREATE OR REPLACE FUNCTION create_vehicle_cost_center()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  name TEXT;
BEGIN
  code := 'VH-' || NEW.plate_number;
  name := coalesce(NEW.brand, '') || ' ' || coalesce(NEW.model, '') || ' - ' || coalesce(NEW.plate_number, '');
  PERFORM ensure_cost_center_for_entity('vehicle', NEW.id, code, name);
  RETURN NEW;
END;
$$;

-- دالة لإنشاء مراكز تكلفة تلقائية للعملاء الجدد
CREATE OR REPLACE FUNCTION create_customer_cost_center()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
  name TEXT;
BEGIN
  code := 'CU-' || substr(NEW.id::text, 1, 8);
  name := coalesce(NEW.name, 'عميل') || ' (' || substr(NEW.id::text, 1, 6) || ')';
  PERFORM ensure_cost_center_for_entity('customer', NEW.id, code, name);
  RETURN NEW;
END;
$$;

-- دالة توليد التنبؤات المالية
CREATE OR REPLACE FUNCTION generate_financial_predictions(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_prediction_months INTEGER DEFAULT 3
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  historical_data JSONB;
  predictions JSONB := '[]'::JSONB;
  base_value NUMERIC;
  trend_factor NUMERIC := 1.05; -- نمو افتراضي 5%
  seasonal_factor NUMERIC := 1.0;
  month_counter INTEGER := 1;
  prediction_value NUMERIC;
BEGIN
  -- جمع البيانات التاريخية (مبسط)
  IF p_entity_type = 'vehicle' THEN
    SELECT COALESCE(AVG(total_amount), 0) INTO base_value
    FROM payment_receipts pr
    JOIN rental_contracts rc ON pr.contract_id = rc.id
    WHERE rc.vehicle_id = p_entity_id
    AND pr.payment_date >= CURRENT_DATE - INTERVAL '6 months';
  ELSE
    base_value := 1000; -- قيمة افتراضية
  END IF;
  
  -- توليد التنبؤات للأشهر القادمة
  WHILE month_counter <= p_prediction_months LOOP
    -- حساب العوامل الموسمية (مبسط)
    seasonal_factor := CASE 
      WHEN EXTRACT(MONTH FROM CURRENT_DATE + (month_counter || ' months')::INTERVAL) IN (6,7,8) THEN 1.2
      WHEN EXTRACT(MONTH FROM CURRENT_DATE + (month_counter || ' months')::INTERVAL) IN (12,1,2) THEN 0.9
      ELSE 1.0
    END;
    
    prediction_value := base_value * POWER(trend_factor, month_counter * 0.1) * seasonal_factor;
    
    -- إدراج التنبؤ في قاعدة البيانات
    INSERT INTO financial_ai_predictions (
      prediction_type, entity_type, entity_id, prediction_date, 
      predicted_value, confidence_score, input_features
    ) VALUES (
      'revenue', p_entity_type, p_entity_id, 
      CURRENT_DATE + (month_counter || ' months')::INTERVAL,
      prediction_value, 0.75,
      jsonb_build_object(
        'base_value', base_value,
        'trend_factor', trend_factor,
        'seasonal_factor', seasonal_factor
      )
    );
    
    month_counter := month_counter + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'predictions_generated', p_prediction_months,
    'base_value', base_value
  );
END;
$$;

-- دالة اكتشاف الشذوذات المالية
CREATE OR REPLACE FUNCTION detect_financial_anomalies()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  anomaly_count INTEGER := 0;
  vehicle_record RECORD;
  avg_revenue NUMERIC;
  current_revenue NUMERIC;
  deviation NUMERIC;
BEGIN
  -- البحث عن شذوذات في إيرادات المركبات
  FOR vehicle_record IN 
    SELECT DISTINCT v.id, v.plate_number
    FROM vehicles v
    WHERE v.status = 'available'
  LOOP
    -- حساب متوسط الإيراد الشهري للمركبة
    SELECT COALESCE(AVG(total_amount), 0) INTO avg_revenue
    FROM payment_receipts pr
    JOIN rental_contracts rc ON pr.contract_id = rc.id
    WHERE rc.vehicle_id = vehicle_record.id
    AND pr.payment_date >= CURRENT_DATE - INTERVAL '6 months'
    AND pr.payment_date < CURRENT_DATE - INTERVAL '1 month';
    
    -- حساب الإيراد للشهر الحالي
    SELECT COALESCE(SUM(total_amount), 0) INTO current_revenue
    FROM payment_receipts pr
    JOIN rental_contracts rc ON pr.contract_id = rc.id
    WHERE rc.vehicle_id = vehicle_record.id
    AND pr.payment_date >= DATE_TRUNC('month', CURRENT_DATE);
    
    -- حساب الانحراف
    IF avg_revenue > 0 THEN
      deviation := ABS((current_revenue - avg_revenue) / avg_revenue * 100);
      
      -- إذا كان الانحراف أكبر من 30%، اعتبره شذوذ
      IF deviation > 30 THEN
        INSERT INTO financial_anomalies (
          anomaly_type, entity_type, entity_id, anomaly_score,
          expected_value, actual_value, deviation_percentage,
          context_data
        ) VALUES (
          CASE WHEN current_revenue < avg_revenue THEN 'revenue_drop' ELSE 'revenue_spike' END,
          'vehicle', vehicle_record.id, LEAST(deviation / 10, 10),
          avg_revenue, current_revenue, deviation,
          jsonb_build_object(
            'vehicle_plate', vehicle_record.plate_number,
            'analysis_period', '6_months_average_vs_current_month'
          )
        );
        anomaly_count := anomaly_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN anomaly_count;
END;
$$;

-- دالة تحليل سلوك العملاء
CREATE OR REPLACE FUNCTION analyze_customer_behavior(p_customer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  customer_data RECORD;
  rental_patterns JSONB;
  payment_behavior JSONB;
  risk_indicators JSONB;
  recommendations JSONB;
  risk_score NUMERIC := 0;
  opportunity_score NUMERIC := 0;
BEGIN
  -- جمع بيانات العميل
  SELECT * INTO customer_data
  FROM customers
  WHERE id = p_customer_id;
  
  -- تحليل أنماط الإيجار
  WITH rental_stats AS (
    SELECT 
      COUNT(*) as total_contracts,
      AVG(EXTRACT(DAY FROM end_date - start_date)) as avg_rental_duration,
      AVG(total_amount) as avg_contract_value,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_contracts,
      MAX(start_date) as last_rental_date
    FROM rental_contracts
    WHERE customer_id = p_customer_id
  )
  SELECT jsonb_build_object(
    'total_contracts', total_contracts,
    'avg_rental_duration', avg_rental_duration,
    'avg_contract_value', avg_contract_value,
    'cancellation_rate', CASE WHEN total_contracts > 0 THEN cancelled_contracts::NUMERIC / total_contracts * 100 ELSE 0 END,
    'days_since_last_rental', EXTRACT(DAY FROM CURRENT_DATE - last_rental_date)
  ) INTO rental_patterns
  FROM rental_stats;
  
  -- تحليل سلوك الدفع
  WITH payment_stats AS (
    SELECT 
      COUNT(*) as total_payments,
      AVG(amount) as avg_payment_amount,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_payments
    FROM payment_receipts
    WHERE customer_name = customer_data.name
  )
  SELECT jsonb_build_object(
    'total_payments', total_payments,
    'avg_payment_amount', avg_payment_amount,
    'payment_reliability', CASE WHEN total_payments > 0 THEN confirmed_payments::NUMERIC / total_payments * 100 ELSE 100 END
  ) INTO payment_behavior
  FROM payment_stats;
  
  -- حساب مؤشرات المخاطر
  risk_score := CASE 
    WHEN (rental_patterns->>'cancellation_rate')::NUMERIC > 20 THEN risk_score + 3
    WHEN (rental_patterns->>'cancellation_rate')::NUMERIC > 10 THEN risk_score + 1
    ELSE risk_score
  END;
  
  risk_score := CASE 
    WHEN (payment_behavior->>'payment_reliability')::NUMERIC < 80 THEN risk_score + 4
    WHEN (payment_behavior->>'payment_reliability')::NUMERIC < 95 THEN risk_score + 1
    ELSE risk_score
  END;
  
  -- حساب درجة الفرص
  opportunity_score := CASE 
    WHEN (rental_patterns->>'total_contracts')::INTEGER > 10 THEN opportunity_score + 3
    WHEN (rental_patterns->>'total_contracts')::INTEGER > 5 THEN opportunity_score + 2
    ELSE opportunity_score + 1
  END;
  
  opportunity_score := CASE 
    WHEN (rental_patterns->>'avg_contract_value')::NUMERIC > 5000 THEN opportunity_score + 2
    WHEN (rental_patterns->>'avg_contract_value')::NUMERIC > 2000 THEN opportunity_score + 1
    ELSE opportunity_score
  END;
  
  -- بناء التوصيات
  recommendations := jsonb_build_array();
  
  IF (rental_patterns->>'cancellation_rate')::NUMERIC > 15 THEN
    recommendations := recommendations || jsonb_build_array('تحسين شروط الإلغاء لتقليل معدل الإلغاءات');
  END IF;
  
  IF (rental_patterns->>'days_since_last_rental')::NUMERIC > 90 THEN
    recommendations := recommendations || jsonb_build_array('إرسال عروض خاصة لاستعادة العميل');
  END IF;
  
  IF (payment_behavior->>'payment_reliability')::NUMERIC > 95 AND (rental_patterns->>'total_contracts')::INTEGER > 5 THEN
    recommendations := recommendations || jsonb_build_array('عميل مميز - يستحق خصومات الولاء');
  END IF;
  
  -- حفظ التحليل
  INSERT INTO behavioral_analytics (
    analysis_type, entity_type, entity_id,
    analysis_period_start, analysis_period_end,
    pattern_data, insights, recommendations,
    risk_score, opportunity_score
  ) VALUES (
    'customer_behavior', 'customer', p_customer_id,
    CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE,
    jsonb_build_object('rental_patterns', rental_patterns, 'payment_behavior', payment_behavior),
    jsonb_build_object('risk_indicators', risk_indicators),
    jsonb_build_object('recommendations', recommendations),
    risk_score, opportunity_score
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'risk_score', risk_score,
    'opportunity_score', opportunity_score,
    'recommendations', recommendations,
    'rental_patterns', rental_patterns,
    'payment_behavior', payment_behavior
  );
END;
$$;

-- إدراج بعض التنبؤات التجريبية
INSERT INTO financial_ai_predictions (prediction_type, entity_type, prediction_date, predicted_value, confidence_score, prediction_period) VALUES
('revenue', 'overall', CURRENT_DATE + INTERVAL '1 month', 150000, 0.85, 'monthly'),
('revenue', 'overall', CURRENT_DATE + INTERVAL '2 months', 165000, 0.80, 'monthly'),
('revenue', 'overall', CURRENT_DATE + INTERVAL '3 months', 180000, 0.75, 'monthly'),
('expense', 'overall', CURRENT_DATE + INTERVAL '1 month', 80000, 0.90, 'monthly'),
('expense', 'overall', CURRENT_DATE + INTERVAL '2 months', 85000, 0.85, 'monthly'),
('expense', 'overall', CURRENT_DATE + INTERVAL '3 months', 90000, 0.80, 'monthly');
