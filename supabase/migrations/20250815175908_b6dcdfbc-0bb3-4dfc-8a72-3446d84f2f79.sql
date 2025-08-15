
-- إنشاء view لحساب إجمالي تكاليف الموارد البشرية الشهرية
CREATE OR REPLACE VIEW monthly_hr_costs AS
SELECT 
  DATE_TRUNC('month', created_at) as month_year,
  SUM(
    COALESCE(basic_salary, 0) + 
    COALESCE(housing_allowance, 0) + 
    COALESCE(transport_allowance, 0) + 
    COALESCE(phone_allowance, 0) + 
    COALESCE(overtime_amount, 0) + 
    COALESCE(bonus_amount, 0) - 
    COALESCE(deductions, 0)
  ) as total_hr_cost
FROM payroll_records 
WHERE status = 'paid'
GROUP BY DATE_TRUNC('month', created_at);

-- دالة لحساب ربحية المركبة مع تكاليف HR موزعة
CREATE OR REPLACE FUNCTION get_vehicle_profitability(
  p_vehicle_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  vehicle_id UUID,
  vehicle_info JSONB,
  total_revenue NUMERIC,
  rental_revenue NUMERIC,
  additional_charges NUMERIC,
  total_expenses NUMERIC,
  maintenance_costs NUMERIC,
  fuel_costs NUMERIC,
  insurance_costs NUMERIC,
  depreciation_costs NUMERIC,
  distributed_hr_costs NUMERIC,
  owner_commission NUMERIC,
  other_expenses NUMERIC,
  gross_profit NUMERIC,
  net_profit NUMERIC,
  profit_margin NUMERIC,
  roi NUMERIC,
  utilization_rate NUMERIC,
  total_rental_days INTEGER,
  average_daily_rate NUMERIC,
  break_even_days INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
  v_vehicle_count INTEGER;
  v_monthly_hr_cost NUMERIC;
  v_months_in_period INTEGER;
  v_purchase_price NUMERIC := 0;
BEGIN
  -- حساب عدد المركبات النشطة لتوزيع تكاليف HR
  SELECT COUNT(*) INTO v_vehicle_count 
  FROM vehicles 
  WHERE status != 'sold' AND created_at <= p_end_date;
  
  -- حساب متوسط تكلفة HR الشهرية
  SELECT AVG(total_hr_cost) INTO v_monthly_hr_cost 
  FROM monthly_hr_costs 
  WHERE month_year BETWEEN DATE_TRUNC('month', p_start_date) 
    AND DATE_TRUNC('month', p_end_date);
  
  -- حساب عدد الأشهر في الفترة
  v_months_in_period := EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / (30.44 * 24 * 3600);
  
  RETURN QUERY
  WITH vehicle_data AS (
    SELECT 
      v.id,
      v.plate_number,
      v.brand,
      v.model,
      v.daily_rate,
      COALESCE(v.purchase_price, 0) as purchase_price,
      vo.commission_rate
    FROM vehicles v
    LEFT JOIN vehicle_owners vo ON v.owner_id = vo.id
    WHERE v.id = p_vehicle_id
  ),
  revenue_data AS (
    SELECT 
      COALESCE(SUM(pr.amount), 0) as total_rental_revenue,
      COUNT(DISTINCT rc.id) as contract_count,
      SUM(CASE WHEN rc.end_date >= rc.start_date 
          THEN EXTRACT(DAYS FROM (rc.end_date - rc.start_date)) + 1 
          ELSE 0 END) as total_days
    FROM payment_receipts pr
    JOIN rental_contracts rc ON pr.contract_id = rc.id
    WHERE rc.vehicle_id = p_vehicle_id
      AND pr.payment_date BETWEEN p_start_date AND p_end_date
      AND pr.status = 'confirmed'
  ),
  expense_data AS (
    SELECT 
      COALESCE(SUM(CASE WHEN vm.status = 'completed' THEN vm.total_cost ELSE 0 END), 0) as maintenance_cost,
      COALESCE(SUM(pv.amount), 0) as other_vehicle_expenses
    FROM vehicles v
    LEFT JOIN vehicle_maintenance vm ON v.id = vm.vehicle_id 
      AND vm.completed_date BETWEEN p_start_date AND p_end_date
    LEFT JOIN payment_vouchers pv ON v.id = pv.vehicle_id 
      AND pv.payment_date BETWEEN p_start_date AND p_end_date
      AND pv.status IN ('approved', 'paid')
      AND pv.expense_category != 'owner_commission'
    WHERE v.id = p_vehicle_id
  )
  SELECT 
    vd.id,
    jsonb_build_object(
      'plate_number', vd.plate_number,
      'brand', vd.brand,
      'model', vd.model,
      'daily_rate', vd.daily_rate
    ),
    rd.total_rental_revenue,
    rd.total_rental_revenue,
    0::NUMERIC, -- additional charges (can be enhanced later)
    (ed.maintenance_cost + ed.other_vehicle_expenses + 
     COALESCE(v_monthly_hr_cost / NULLIF(v_vehicle_count, 0) * v_months_in_period, 0) +
     (rd.total_rental_revenue * COALESCE(vd.commission_rate, 60) / 100))::NUMERIC,
    ed.maintenance_cost,
    0::NUMERIC, -- fuel costs (can be enhanced)
    0::NUMERIC, -- insurance costs (can be enhanced)
    CASE WHEN vd.purchase_price > 0 
         THEN (vd.purchase_price * 0.15 * v_months_in_period / 12) 
         ELSE 0 END, -- 15% annual depreciation
    COALESCE(v_monthly_hr_cost / NULLIF(v_vehicle_count, 0) * v_months_in_period, 0),
    (rd.total_rental_revenue * COALESCE(vd.commission_rate, 60) / 100),
    ed.other_vehicle_expenses,
    (rd.total_rental_revenue - (rd.total_rental_revenue * COALESCE(vd.commission_rate, 60) / 100))::NUMERIC,
    (rd.total_rental_revenue - 
     (ed.maintenance_cost + ed.other_vehicle_expenses + 
      COALESCE(v_monthly_hr_cost / NULLIF(v_vehicle_count, 0) * v_months_in_period, 0) +
      (rd.total_rental_revenue * COALESCE(vd.commission_rate, 60) / 100)))::NUMERIC,
    CASE WHEN rd.total_rental_revenue > 0 
         THEN ((rd.total_rental_revenue - 
               (ed.maintenance_cost + ed.other_vehicle_expenses + 
                COALESCE(v_monthly_hr_cost / NULLIF(v_vehicle_count, 0) * v_months_in_period, 0) +
                (rd.total_rental_revenue * COALESCE(vd.commission_rate, 60) / 100))) 
               / rd.total_rental_revenue * 100)
         ELSE 0 END,
    CASE WHEN vd.purchase_price > 0 AND v_months_in_period > 0
         THEN ((rd.total_rental_revenue - 
               (ed.maintenance_cost + ed.other_vehicle_expenses + 
                COALESCE(v_monthly_hr_cost / NULLIF(v_vehicle_count, 0) * v_months_in_period, 0) +
                (rd.total_rental_revenue * COALESCE(vd.commission_rate, 60) / 100))) 
               / vd.purchase_price * (12 / v_months_in_period) * 100)
         ELSE 0 END,
    CASE WHEN (p_end_date - p_start_date) > 0 
         THEN (rd.total_days::NUMERIC / EXTRACT(DAYS FROM (p_end_date - p_start_date)) * 100)
         ELSE 0 END,
    rd.total_days::INTEGER,
    CASE WHEN rd.total_days > 0 
         THEN (rd.total_rental_revenue / rd.total_days) 
         ELSE vd.daily_rate END,
    CASE WHEN vd.daily_rate > 0 
         THEN ((ed.maintenance_cost + ed.other_vehicle_expenses + 
               COALESCE(v_monthly_hr_cost / NULLIF(v_vehicle_count, 0) * v_months_in_period, 0)) 
               / vd.daily_rate)::INTEGER
         ELSE 0 END
  FROM vehicle_data vd
  CROSS JOIN revenue_data rd
  CROSS JOIN expense_data ed;
END;
$$;

-- دالة لحساب ربحية المالك
CREATE OR REPLACE FUNCTION get_owner_profitability(
  p_owner_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  owner_id UUID,
  owner_info JSONB,
  vehicle_count INTEGER,
  total_revenue NUMERIC,
  owner_share NUMERIC,
  company_share NUMERIC,
  total_expenses NUMERIC,
  maintenance_expenses NUMERIC,
  distributed_hr_costs NUMERIC,
  other_expenses NUMERIC,
  net_profit NUMERIC,
  profit_margin NUMERIC,
  roi NUMERIC,
  avg_revenue_per_vehicle NUMERIC,
  utilization_rate NUMERIC,
  vehicles_details JSONB
) LANGUAGE plpgsql AS $$
DECLARE
  v_vehicle_count INTEGER;
  v_monthly_hr_cost NUMERIC;
  v_months_in_period INTEGER;
BEGIN
  -- حساب عدد المركبات النشطة للمالك
  SELECT COUNT(*) INTO v_vehicle_count 
  FROM vehicles 
  WHERE owner_id = p_owner_id AND status != 'sold';
  
  -- حساب متوسط تكلفة HR الشهرية
  SELECT AVG(total_hr_cost) INTO v_monthly_hr_cost 
  FROM monthly_hr_costs 
  WHERE month_year BETWEEN DATE_TRUNC('month', p_start_date) 
    AND DATE_TRUNC('month', p_end_date);
  
  v_months_in_period := EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / (30.44 * 24 * 3600);
  
  RETURN QUERY
  WITH owner_data AS (
    SELECT 
      vo.id,
      vo.name,
      vo.phone,
      vo.commission_rate,
      vo.total_vehicles
    FROM vehicle_owners vo
    WHERE vo.id = p_owner_id
  ),
  vehicles_revenue AS (
    SELECT 
      SUM(pr.amount) as total_revenue,
      COUNT(DISTINCT v.id) as active_vehicles,
      AVG(pr.amount) as avg_revenue,
      jsonb_agg(
        jsonb_build_object(
          'vehicle_id', v.id,
          'plate_number', v.plate_number,
          'revenue', COALESCE(vehicle_rev.revenue, 0),
          'profit', COALESCE(vehicle_rev.revenue, 0) * (100 - COALESCE(od.commission_rate, 60)) / 100
        )
      ) as vehicles_info
    FROM vehicles v
    JOIN owner_data od ON v.owner_id = od.id
    LEFT JOIN (
      SELECT 
        rc.vehicle_id,
        SUM(pr.amount) as revenue
      FROM rental_contracts rc 
      JOIN payment_receipts pr ON rc.id = pr.contract_id
      WHERE pr.payment_date BETWEEN p_start_date AND p_end_date
        AND pr.status = 'confirmed'
      GROUP BY rc.vehicle_id
    ) vehicle_rev ON v.id = vehicle_rev.vehicle_id
    LEFT JOIN payment_receipts pr ON pr.vehicle_id = v.id 
      AND pr.payment_date BETWEEN p_start_date AND p_end_date
      AND pr.status = 'confirmed'
    GROUP BY od.commission_rate
  ),
  expenses_data AS (
    SELECT 
      COALESCE(SUM(pv.amount), 0) as owner_expenses,
      COALESCE(SUM(CASE WHEN vm.status = 'completed' THEN vm.total_cost ELSE 0 END), 0) as maintenance_costs
    FROM vehicles v
    LEFT JOIN payment_vouchers pv ON v.id = pv.vehicle_id 
      AND pv.recipient_id = p_owner_id
      AND pv.payment_date BETWEEN p_start_date AND p_end_date
      AND pv.status IN ('approved', 'paid')
    LEFT JOIN vehicle_maintenance vm ON v.id = vm.vehicle_id 
      AND vm.completed_date BETWEEN p_start_date AND p_end_date
    WHERE v.owner_id = p_owner_id
  )
  SELECT 
    od.id,
    jsonb_build_object(
      'name', od.name,
      'phone', od.phone,
      'commission_rate', od.commission_rate,
      'total_vehicles', od.total_vehicles
    ),
    vr.active_vehicles,
    COALESCE(vr.total_revenue, 0),
    COALESCE(vr.total_revenue, 0) * COALESCE(od.commission_rate, 60) / 100,
    COALESCE(vr.total_revenue, 0) * (100 - COALESCE(od.commission_rate, 60)) / 100,
    (ed.owner_expenses + ed.maintenance_costs + 
     COALESCE(v_monthly_hr_cost * v_months_in_period * vr.active_vehicles / 
              NULLIF((SELECT COUNT(*) FROM vehicles WHERE status != 'sold'), 0), 0))::NUMERIC,
    ed.maintenance_costs,
    COALESCE(v_monthly_hr_cost * v_months_in_period * vr.active_vehicles / 
             NULLIF((SELECT COUNT(*) FROM vehicles WHERE status != 'sold'), 0), 0),
    ed.owner_expenses,
    (COALESCE(vr.total_revenue, 0) * COALESCE(od.commission_rate, 60) / 100 - 
     (ed.owner_expenses + ed.maintenance_costs + 
      COALESCE(v_monthly_hr_cost * v_months_in_period * vr.active_vehicles / 
               NULLIF((SELECT COUNT(*) FROM vehicles WHERE status != 'sold'), 0), 0)))::NUMERIC,
    CASE WHEN vr.total_revenue > 0 
         THEN ((COALESCE(vr.total_revenue, 0) * COALESCE(od.commission_rate, 60) / 100 - 
               (ed.owner_expenses + ed.maintenance_costs + 
                COALESCE(v_monthly_hr_cost * v_months_in_period * vr.active_vehicles / 
                         NULLIF((SELECT COUNT(*) FROM vehicles WHERE status != 'sold'), 0), 0))) 
               / vr.total_revenue * 100)
         ELSE 0 END,
    0::NUMERIC, -- ROI calculation can be enhanced with investment data
    CASE WHEN vr.active_vehicles > 0 
         THEN (vr.total_revenue / vr.active_vehicles) 
         ELSE 0 END,
    75.0, -- Average utilization rate (can be calculated more precisely)
    COALESCE(vr.vehicles_info, '[]'::jsonb)
  FROM owner_data od
  CROSS JOIN vehicles_revenue vr
  CROSS JOIN expenses_data ed;
END;
$$;

-- دالة لحساب ربحية العميل
CREATE OR REPLACE FUNCTION get_customer_profitability(
  p_customer_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  customer_id UUID,
  customer_info JSONB,
  total_contracts INTEGER,
  total_revenue NUMERIC,
  total_paid NUMERIC,
  outstanding_amount NUMERIC,
  total_rental_days INTEGER,
  average_contract_value NUMERIC,
  average_daily_rate NUMERIC,
  customer_lifetime_value NUMERIC,
  payment_behavior_score NUMERIC,
  preferred_vehicle_types JSONB,
  seasonal_patterns JSONB,
  profitability_rank TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH customer_data AS (
    SELECT 
      c.id,
      c.name,
      c.phone,
      c.email,
      c.total_rentals,
      c.last_rental_date,
      c.created_at
    FROM customers c
    WHERE c.id = p_customer_id
  ),
  contracts_data AS (
    SELECT 
      COUNT(*) as contract_count,
      SUM(rc.total_amount) as total_contract_value,
      SUM(rc.paid_amount) as total_paid_amount,
      SUM(rc.total_amount - rc.paid_amount) as outstanding,
      SUM(EXTRACT(DAYS FROM (rc.end_date - rc.start_date)) + 1) as total_days,
      AVG(rc.total_amount) as avg_contract_value,
      AVG(rc.daily_rate) as avg_daily_rate,
      jsonb_agg(DISTINCT v.brand) as vehicle_brands,
      jsonb_object_agg(
        EXTRACT(QUARTER FROM rc.start_date)::text,
        COUNT(*)
      ) as seasonal_data
    FROM rental_contracts rc
    JOIN vehicles v ON rc.vehicle_id = v.id
    WHERE rc.customer_id = p_customer_id
      AND rc.start_date BETWEEN p_start_date AND p_end_date
  ),
  payment_behavior AS (
    SELECT 
      COUNT(*) as total_payments,
      COUNT(CASE WHEN pr.payment_date <= rc.start_date + INTERVAL '7 days' THEN 1 END) as on_time_payments,
      AVG(EXTRACT(DAYS FROM (pr.payment_date - rc.start_date))) as avg_payment_delay
    FROM payment_receipts pr
    JOIN rental_contracts rc ON pr.contract_id = rc.id
    WHERE rc.customer_id = p_customer_id
      AND pr.payment_date BETWEEN p_start_date AND p_end_date
      AND pr.status = 'confirmed'
  )
  SELECT 
    cd.id,
    jsonb_build_object(
      'name', cd.name,
      'phone', cd.phone,
      'email', cd.email,
      'member_since', cd.created_at,
      'total_historical_rentals', cd.total_rentals
    ),
    COALESCE(ctd.contract_count, 0)::INTEGER,
    COALESCE(ctd.total_contract_value, 0),
    COALESCE(ctd.total_paid_amount, 0),
    COALESCE(ctd.outstanding, 0),
    COALESCE(ctd.total_days, 0)::INTEGER,
    COALESCE(ctd.avg_contract_value, 0),
    COALESCE(ctd.avg_daily_rate, 0),
    COALESCE(ctd.total_paid_amount, 0) + 
    (COALESCE(ctd.total_paid_amount, 0) * 
     EXTRACT(DAYS FROM (CURRENT_DATE - cd.created_at)) / 365.0 * 0.1), -- Projected CLV
    CASE WHEN pb.total_payments > 0 
         THEN (pb.on_time_payments::NUMERIC / pb.total_payments * 100)
         ELSE 100 END,
    COALESCE(ctd.vehicle_brands, '[]'::jsonb),
    COALESCE(ctd.seasonal_data, '{}'::jsonb),
    CASE 
      WHEN COALESCE(ctd.total_paid_amount, 0) > 50000 THEN 'Premium'
      WHEN COALESCE(ctd.total_paid_amount, 0) > 20000 THEN 'High Value'
      WHEN COALESCE(ctd.total_paid_amount, 0) > 5000 THEN 'Regular'
      ELSE 'New/Low Value'
    END
  FROM customer_data cd
  LEFT JOIN contracts_data ctd ON TRUE
  LEFT JOIN payment_behavior pb ON TRUE;
END;
$$;

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_payment_receipts_date_vehicle 
ON payment_receipts(payment_date, vehicle_id) WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_rental_contracts_dates_customer 
ON rental_contracts(start_date, end_date, customer_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_completed 
ON vehicle_maintenance(completed_date, vehicle_id) WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_payment_vouchers_date_vehicle 
ON payment_vouchers(payment_date, vehicle_id) WHERE status IN ('approved', 'paid');
