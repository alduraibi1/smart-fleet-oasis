
-- المرحلة الثانية: الذكاء الاصطناعي والتحليلات المتقدمة

-- جدول نماذج التنبؤ المالي بالذكاء الاصطناعي
CREATE TABLE financial_ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_type VARCHAR(50) NOT NULL, -- 'revenue', 'expense', 'cash_flow', 'maintenance_cost'
  entity_type VARCHAR(50) NOT NULL, -- 'vehicle', 'owner', 'customer', 'company'
  entity_id UUID,
  prediction_date DATE NOT NULL,
  predicted_value NUMERIC(15,2) NOT NULL,
  confidence_score NUMERIC(5,2) DEFAULT 0.75, -- من 0 إلى 1
  prediction_period VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly', 'quarterly'
  model_version VARCHAR(20) DEFAULT '1.0',
  input_features JSONB DEFAULT '{}', -- البيانات المستخدمة في التنبؤ
  accuracy_metrics JSONB DEFAULT '{}', -- مقاييس دقة النموذج
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- فهرسة لتحسين الأداء
CREATE INDEX idx_financial_predictions_type_entity ON financial_ai_predictions(prediction_type, entity_type, entity_id);
CREATE INDEX idx_financial_predictions_date ON financial_ai_predictions(prediction_date);

-- جدول تحليلات الأنماط والسلوكيات
CREATE TABLE behavioral_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type VARCHAR(50) NOT NULL, -- 'customer_behavior', 'vehicle_usage', 'seasonal_trends'
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}', -- البيانات المكتشفة
  insights JSONB DEFAULT '{}', -- الرؤى المستخرجة
  recommendations JSONB DEFAULT '{}', -- التوصيات الذكية
  risk_score NUMERIC(5,2) DEFAULT 0, -- درجة المخاطر من 0 إلى 10
  opportunity_score NUMERIC(5,2) DEFAULT 0, -- درجة الفرص من 0 إلى 10
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- فهرسة للتحليلات السلوكية
CREATE INDEX idx_behavioral_analytics_type ON behavioral_analytics(analysis_type, entity_type);
CREATE INDEX idx_behavioral_analytics_period ON behavioral_analytics(analysis_period_start, analysis_period_end);

-- جدول التنبيهات الذكية المخصصة
CREATE TABLE smart_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL UNIQUE,
  rule_type VARCHAR(50) NOT NULL, -- 'threshold', 'trend', 'anomaly', 'pattern'
  entity_type VARCHAR(50) NOT NULL,
  conditions JSONB NOT NULL, -- شروط تفعيل التنبيه
  alert_template JSONB NOT NULL, -- قالب الرسالة
  severity_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول سجل التنبيهات الذكية المفعلة
CREATE TABLE smart_alert_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES smart_alert_rules(id),
  entity_id UUID,
  trigger_value NUMERIC(15,2),
  threshold_value NUMERIC(15,2),
  alert_data JSONB DEFAULT '{}',
  notification_sent BOOLEAN DEFAULT false,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الكشف عن الشذوذ المالي
CREATE TABLE financial_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_type VARCHAR(50) NOT NULL, -- 'unusual_expense', 'revenue_drop', 'cost_spike'
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  detected_at TIMESTAMPTZ DEFAULT now(),
  anomaly_score NUMERIC(5,2) NOT NULL, -- من 0 إلى 10
  expected_value NUMERIC(15,2),
  actual_value NUMERIC(15,2),
  deviation_percentage NUMERIC(5,2),
  context_data JSONB DEFAULT '{}', -- السياق المحيط بالشذوذ
  investigation_status VARCHAR(20) DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- فهرسة للشذوذات
CREATE INDEX idx_financial_anomalies_type ON financial_anomalies(anomaly_type, entity_type);
CREATE INDEX idx_financial_anomalies_score ON financial_anomalies(anomaly_score DESC);
CREATE INDEX idx_financial_anomalies_status ON financial_anomalies(investigation_status);

-- جدول تحسين التسعير الذكي
CREATE TABLE dynamic_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL,
  vehicle_criteria JSONB DEFAULT '{}', -- معايير المركبات المؤهلة
  seasonal_factors JSONB DEFAULT '{}', -- عوامل الموسمية
  demand_factors JSONB DEFAULT '{}', -- عوامل الطلب
  competition_factors JSONB DEFAULT '{}', -- عوامل المنافسة
  base_price_adjustment NUMERIC(5,2) DEFAULT 0, -- تعديل السعر الأساسي بالنسبة المئوية
  min_price_limit NUMERIC(10,2),
  max_price_limit NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول سجل تطبيق التسعير الذكي
CREATE TABLE dynamic_pricing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL,
  rule_id UUID REFERENCES dynamic_pricing_rules(id),
  original_price NUMERIC(10,2) NOT NULL,
  adjusted_price NUMERIC(10,2) NOT NULL,
  adjustment_reason TEXT,
  applied_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE financial_ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_alert_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing_log ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة التنبؤات المالية" ON financial_ai_predictions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة التحليلات السلوكية" ON behavioral_analytics
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة قواعد التنبيه الذكي" ON smart_alert_rules
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة سجل التنبيهات" ON smart_alert_log
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة الشذوذات المالية" ON financial_anomalies
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة قواعد التسعير الذكي" ON dynamic_pricing_rules
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة سجل التسعير الذكي" ON dynamic_pricing_log
  FOR ALL USING (auth.uid() IS NOT NULL);

-- إضافة triggers لتحديث updated_at
CREATE TRIGGER update_financial_ai_predictions_updated_at
  BEFORE UPDATE ON financial_ai_predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_behavioral_analytics_updated_at
  BEFORE UPDATE ON behavioral_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_alert_rules_updated_at
  BEFORE UPDATE ON smart_alert_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dynamic_pricing_rules_updated_at
  BEFORE UPDATE ON dynamic_pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة لتوليد التنبؤات المالية
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

-- دالة للكشف عن الشذوذات المالية
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

-- دالة لتحليل السلوك وإنتاج التوصيات
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
