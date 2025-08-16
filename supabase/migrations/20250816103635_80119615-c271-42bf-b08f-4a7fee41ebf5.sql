
-- Add new tables for enhanced maintenance system

-- Enhanced maintenance records with AI predictions
ALTER TABLE vehicle_maintenance 
ADD COLUMN IF NOT EXISTS predicted_completion_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS actual_completion_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS customer_satisfaction integer CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
ADD COLUMN IF NOT EXISTS warranty_period_days integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approval_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS digital_signature jsonb,
ADD COLUMN IF NOT EXISTS before_images text[],
ADD COLUMN IF NOT EXISTS after_images text[],
ADD COLUMN IF NOT EXISTS diagnostic_data jsonb,
ADD COLUMN IF NOT EXISTS ai_recommendations jsonb;

-- Maintenance KPIs and analytics
CREATE TABLE IF NOT EXISTS maintenance_kpis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  vehicle_id uuid,
  mechanic_id uuid,
  total_jobs integer DEFAULT 0,
  completed_jobs integer DEFAULT 0,
  avg_completion_time numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  customer_satisfaction_avg numeric DEFAULT 0,
  downtime_hours numeric DEFAULT 0,
  efficiency_score numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- AI maintenance predictions
CREATE TABLE IF NOT EXISTS maintenance_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL,
  prediction_type varchar(50) NOT NULL, -- 'next_service', 'part_failure', 'cost_estimate'
  predicted_date date,
  predicted_mileage integer,
  confidence_score numeric(3,2) DEFAULT 0.75,
  factors jsonb, -- driving patterns, weather, usage intensity
  recommendations jsonb,
  status varchar(20) DEFAULT 'active', -- active, completed, cancelled
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Quality management and inspections
CREATE TABLE IF NOT EXISTS maintenance_quality_checks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_id uuid NOT NULL,
  checklist_template_id uuid,
  inspector_id uuid,
  inspection_date timestamp with time zone DEFAULT now(),
  overall_score numeric(3,2),
  checks_passed integer DEFAULT 0,
  checks_failed integer DEFAULT 0,
  notes text,
  requires_rework boolean DEFAULT false,
  approved boolean DEFAULT false,
  approved_by uuid,
  approval_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Quality checklist items
CREATE TABLE IF NOT EXISTS quality_checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quality_check_id uuid NOT NULL,
  item_name varchar(255) NOT NULL,
  status varchar(20) DEFAULT 'pending', -- passed, failed, na
  notes text,
  priority varchar(20) DEFAULT 'medium',
  order_index integer DEFAULT 0
);

-- Workshop management
CREATE TABLE IF NOT EXISTS workshop_bays (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bay_number varchar(10) NOT NULL UNIQUE,
  bay_type varchar(50), -- general, specialty, diagnostic
  is_available boolean DEFAULT true,
  current_vehicle_id uuid,
  equipment jsonb, -- available tools and equipment
  specializations text[], -- types of work this bay is suited for
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Real-time workshop status
CREATE TABLE IF NOT EXISTS workshop_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bay_id uuid,
  vehicle_id uuid,
  mechanic_id uuid,
  maintenance_id uuid,
  status varchar(30) DEFAULT 'scheduled', -- scheduled, in_progress, waiting_parts, quality_check, completed
  started_at timestamp with time zone,
  estimated_completion timestamp with time zone,
  actual_completion timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Smart alerts and notifications
CREATE TABLE IF NOT EXISTS maintenance_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type varchar(50) NOT NULL, -- overdue, prediction, quality_issue, inventory_low
  entity_type varchar(20) NOT NULL, -- vehicle, maintenance, mechanic
  entity_id uuid NOT NULL,
  severity varchar(20) DEFAULT 'medium', -- low, medium, high, critical
  title varchar(255) NOT NULL,
  message text NOT NULL,
  action_required boolean DEFAULT false,
  action_url varchar(255),
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid,
  acknowledged_at timestamp with time zone,
  auto_resolve boolean DEFAULT false,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Maintenance costs tracking with better granularity
CREATE TABLE IF NOT EXISTS maintenance_cost_breakdown (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_id uuid NOT NULL,
  cost_category varchar(50) NOT NULL, -- labor, parts, oils, external, overhead
  item_name varchar(255),
  quantity numeric DEFAULT 1,
  unit_cost numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  supplier_id uuid,
  invoice_reference varchar(100),
  cost_center_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Vehicle health scoring
CREATE TABLE IF NOT EXISTS vehicle_health_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL,
  score_date date DEFAULT CURRENT_DATE,
  overall_score numeric(3,2) DEFAULT 0,
  engine_score numeric(3,2) DEFAULT 0,
  transmission_score numeric(3,2) DEFAULT 0,
  brakes_score numeric(3,2) DEFAULT 0,
  suspension_score numeric(3,2) DEFAULT 0,
  electrical_score numeric(3,2) DEFAULT 0,
  body_score numeric(3,2) DEFAULT 0,
  factors jsonb, -- mileage, age, maintenance_history, usage_pattern
  recommendations jsonb,
  next_assessment_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE maintenance_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_bays ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_cost_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_health_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Authenticated users can manage maintenance KPIs" ON maintenance_kpis FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage maintenance predictions" ON maintenance_predictions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage quality checks" ON maintenance_quality_checks FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage checklist items" ON quality_checklist_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage workshop bays" ON workshop_bays FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage workshop status" ON workshop_status FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage maintenance alerts" ON maintenance_alerts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage cost breakdown" ON maintenance_cost_breakdown FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage vehicle health scores" ON vehicle_health_scores FOR ALL USING (auth.uid() IS NOT NULL);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_kpis_date ON maintenance_kpis(date);
CREATE INDEX IF NOT EXISTS idx_maintenance_kpis_vehicle ON maintenance_kpis(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_predictions_vehicle ON maintenance_predictions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_predictions_date ON maintenance_predictions(predicted_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_entity ON maintenance_alerts(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_alerts_severity ON maintenance_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_vehicle_health_scores_vehicle ON vehicle_health_scores(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_health_scores_date ON vehicle_health_scores(score_date);

-- Functions for calculating KPIs
CREATE OR REPLACE FUNCTION calculate_maintenance_kpis(p_date date, p_vehicle_id uuid DEFAULT NULL, p_mechanic_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  kpi_record RECORD;
BEGIN
  -- Calculate daily KPIs
  FOR kpi_record IN 
    SELECT 
      COALESCE(p_vehicle_id, vm.vehicle_id) as vehicle_id,
      COALESCE(p_mechanic_id, vm.mechanic_id) as mechanic_id,
      COUNT(*) as total_jobs,
      COUNT(CASE WHEN vm.status = 'completed' THEN 1 END) as completed_jobs,
      AVG(EXTRACT(EPOCH FROM (vm.completed_date - vm.scheduled_date))/3600) as avg_completion_time,
      SUM(CASE WHEN vm.status = 'completed' THEN vm.total_cost ELSE 0 END) as total_revenue,
      SUM(vm.labor_cost + vm.parts_cost) as total_cost,
      AVG(vm.quality_rating) as customer_satisfaction_avg,
      SUM(CASE WHEN vm.status = 'completed' 
          THEN EXTRACT(EPOCH FROM (vm.completed_date - vm.scheduled_date))/3600 
          ELSE 0 END) as downtime_hours
    FROM vehicle_maintenance vm
    WHERE DATE(vm.scheduled_date) = p_date
      AND (p_vehicle_id IS NULL OR vm.vehicle_id = p_vehicle_id)
      AND (p_mechanic_id IS NULL OR vm.mechanic_id = p_mechanic_id)
    GROUP BY vm.vehicle_id, vm.mechanic_id
  LOOP
    INSERT INTO maintenance_kpis (
      date, vehicle_id, mechanic_id, total_jobs, completed_jobs,
      avg_completion_time, total_revenue, total_cost, customer_satisfaction_avg,
      downtime_hours, efficiency_score
    ) VALUES (
      p_date, kpi_record.vehicle_id, kpi_record.mechanic_id,
      kpi_record.total_jobs, kpi_record.completed_jobs,
      kpi_record.avg_completion_time, kpi_record.total_revenue, kpi_record.total_cost,
      kpi_record.customer_satisfaction_avg, kpi_record.downtime_hours,
      CASE WHEN kpi_record.total_jobs > 0 
           THEN (kpi_record.completed_jobs::numeric / kpi_record.total_jobs * 100)
           ELSE 0 END
    ) ON CONFLICT (date, vehicle_id, mechanic_id) DO UPDATE SET
      total_jobs = EXCLUDED.total_jobs,
      completed_jobs = EXCLUDED.completed_jobs,
      avg_completion_time = EXCLUDED.avg_completion_time,
      total_revenue = EXCLUDED.total_revenue,
      total_cost = EXCLUDED.total_cost,
      customer_satisfaction_avg = EXCLUDED.customer_satisfaction_avg,
      downtime_hours = EXCLUDED.downtime_hours,
      efficiency_score = EXCLUDED.efficiency_score,
      updated_at = now();
  END LOOP;
END;
$$;

-- Function to generate AI maintenance predictions
CREATE OR REPLACE FUNCTION generate_maintenance_predictions(p_vehicle_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vehicle_data RECORD;
  last_maintenance_date date;
  avg_mileage_per_month numeric;
  prediction_data jsonb := '[]'::jsonb;
BEGIN
  -- Get vehicle information and maintenance history
  SELECT v.*, v.current_mileage, 
         EXTRACT(DAYS FROM now() - v.registration_date)/30 as months_in_service
  INTO vehicle_data
  FROM vehicles v WHERE v.id = p_vehicle_id;
  
  -- Get last maintenance date
  SELECT MAX(completed_date) INTO last_maintenance_date
  FROM vehicle_maintenance 
  WHERE vehicle_id = p_vehicle_id AND status = 'completed';
  
  -- Calculate average monthly mileage
  IF vehicle_data.months_in_service > 0 THEN
    avg_mileage_per_month := vehicle_data.current_mileage / vehicle_data.months_in_service;
  ELSE
    avg_mileage_per_month := 1000; -- Default assumption
  END IF;
  
  -- Generate predictions for different maintenance types
  -- Oil change prediction (every 5000 km or 3 months)
  INSERT INTO maintenance_predictions (
    vehicle_id, prediction_type, predicted_date, predicted_mileage,
    confidence_score, factors, recommendations
  ) VALUES (
    p_vehicle_id, 'oil_change',
    CURRENT_DATE + INTERVAL '3 months',
    vehicle_data.current_mileage + (avg_mileage_per_month * 3),
    0.85,
    jsonb_build_object(
      'last_service', last_maintenance_date,
      'avg_monthly_mileage', avg_mileage_per_month,
      'vehicle_age_months', vehicle_data.months_in_service
    ),
    jsonb_build_object(
      'priority', 'medium',
      'estimated_cost', 200,
      'required_parts', '["Engine Oil", "Oil Filter"]'
    )
  ) ON CONFLICT (vehicle_id, prediction_type) DO UPDATE SET
    predicted_date = EXCLUDED.predicted_date,
    predicted_mileage = EXCLUDED.predicted_mileage,
    confidence_score = EXCLUDED.confidence_score,
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'predictions_generated', 1,
    'vehicle_id', p_vehicle_id
  );
END;
$$;

-- Create triggers for automatic KPI calculation
CREATE OR REPLACE FUNCTION trigger_calculate_kpis()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate KPIs when maintenance record is updated
  PERFORM calculate_maintenance_kpis(
    DATE(COALESCE(NEW.completed_date, NEW.scheduled_date)), 
    NEW.vehicle_id, 
    NEW.mechanic_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER maintenance_kpi_trigger
  AFTER INSERT OR UPDATE ON vehicle_maintenance
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_kpis();

-- Add unique constraints where needed
ALTER TABLE maintenance_kpis ADD CONSTRAINT IF NOT EXISTS unique_kpi_date_vehicle_mechanic 
  UNIQUE (date, vehicle_id, mechanic_id);

ALTER TABLE maintenance_predictions ADD CONSTRAINT IF NOT EXISTS unique_prediction_vehicle_type 
  UNIQUE (vehicle_id, prediction_type);
