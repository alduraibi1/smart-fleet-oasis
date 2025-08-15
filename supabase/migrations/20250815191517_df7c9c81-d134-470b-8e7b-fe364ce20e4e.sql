
-- إنشاء جدول ساعات العمل للصيانة
CREATE TABLE maintenance_work_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID NOT NULL REFERENCES vehicle_maintenance(id) ON DELETE CASCADE,
  mechanic_id UUID NOT NULL REFERENCES mechanics(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  break_hours NUMERIC DEFAULT 0,
  total_hours NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - COALESCE(break_hours, 0)
      ELSE 0 
    END
  ) STORED,
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (
    (CASE 
      WHEN end_time IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - COALESCE(break_hours, 0)
      ELSE 0 
    END) * hourly_rate
  ) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول قطع الغيار المستخدمة في الصيانة
CREATE TABLE maintenance_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID NOT NULL REFERENCES vehicle_maintenance(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_used NUMERIC NOT NULL CHECK (quantity_used > 0),
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity_used * unit_cost) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الزيوت والسوائل المستخدمة في الصيانة
CREATE TABLE maintenance_oils_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID NOT NULL REFERENCES vehicle_maintenance(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_used NUMERIC NOT NULL CHECK (quantity_used > 0),
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity_used * unit_cost) STORED,
  viscosity VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة فهارس للأداء
CREATE INDEX idx_maintenance_work_hours_maintenance_id ON maintenance_work_hours(maintenance_id);
CREATE INDEX idx_maintenance_work_hours_mechanic_id ON maintenance_work_hours(mechanic_id);
CREATE INDEX idx_maintenance_parts_used_maintenance_id ON maintenance_parts_used(maintenance_id);
CREATE INDEX idx_maintenance_parts_used_item_id ON maintenance_parts_used(inventory_item_id);
CREATE INDEX idx_maintenance_oils_used_maintenance_id ON maintenance_oils_used(maintenance_id);
CREATE INDEX idx_maintenance_oils_used_item_id ON maintenance_oils_used(inventory_item_id);

-- إضافة سياسات الأمان RLS
ALTER TABLE maintenance_work_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_parts_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_oils_used ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage work hours" ON maintenance_work_hours FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage parts used" ON maintenance_parts_used FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage oils used" ON maintenance_oils_used FOR ALL USING (auth.uid() IS NOT NULL);

-- دالة لحساب إجمالي تكلفة الصيانة
CREATE OR REPLACE FUNCTION calculate_maintenance_total_cost(maintenance_record_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  labor_cost NUMERIC := 0;
  parts_cost NUMERIC := 0;
  oils_cost NUMERIC := 0;
  total_cost NUMERIC := 0;
BEGIN
  -- حساب تكلفة العمالة
  SELECT COALESCE(SUM(total_cost), 0) INTO labor_cost
  FROM maintenance_work_hours
  WHERE maintenance_id = maintenance_record_id;
  
  -- حساب تكلفة قطع الغيار
  SELECT COALESCE(SUM(total_cost), 0) INTO parts_cost
  FROM maintenance_parts_used
  WHERE maintenance_id = maintenance_record_id;
  
  -- حساب تكلفة الزيوت
  SELECT COALESCE(SUM(total_cost), 0) INTO oils_cost
  FROM maintenance_oils_used
  WHERE maintenance_id = maintenance_record_id;
  
  total_cost := labor_cost + parts_cost + oils_cost;
  
  RETURN total_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تريقر لتحديث تكلفة الصيانة تلقائياً
CREATE OR REPLACE FUNCTION update_maintenance_cost()
RETURNS TRIGGER AS $$
DECLARE
  maintenance_record_id UUID;
  new_total_cost NUMERIC;
BEGIN
  -- تحديد معرف سجل الصيانة
  IF TG_TABLE_NAME = 'maintenance_work_hours' THEN
    maintenance_record_id := COALESCE(NEW.maintenance_id, OLD.maintenance_id);
  ELSIF TG_TABLE_NAME = 'maintenance_parts_used' THEN
    maintenance_record_id := COALESCE(NEW.maintenance_id, OLD.maintenance_id);
  ELSIF TG_TABLE_NAME = 'maintenance_oils_used' THEN
    maintenance_record_id := COALESCE(NEW.maintenance_id, OLD.maintenance_id);
  END IF;
  
  -- حساب التكلفة الجديدة
  new_total_cost := calculate_maintenance_total_cost(maintenance_record_id);
  
  -- تحديث سجل الصيانة
  UPDATE vehicle_maintenance 
  SET 
    total_cost = new_total_cost,
    labor_cost = (SELECT COALESCE(SUM(total_cost), 0) FROM maintenance_work_hours WHERE maintenance_id = maintenance_record_id),
    parts_cost = (SELECT COALESCE(SUM(total_cost), 0) FROM maintenance_parts_used WHERE maintenance_id = maintenance_record_id),
    updated_at = now()
  WHERE id = maintenance_record_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- إنشاء التريجرز
CREATE TRIGGER trigger_update_maintenance_cost_work_hours
  AFTER INSERT OR UPDATE OR DELETE ON maintenance_work_hours
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_cost();

CREATE TRIGGER trigger_update_maintenance_cost_parts
  AFTER INSERT OR UPDATE OR DELETE ON maintenance_parts_used
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_cost();

CREATE TRIGGER trigger_update_maintenance_cost_oils
  AFTER INSERT OR UPDATE OR DELETE ON maintenance_oils_used
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_cost();

-- دالة لخصم قطع الغيار من المخزون
CREATE OR REPLACE FUNCTION deduct_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- خصم الكمية من المخزون عند إضافة قطعة غيار مستخدمة
  IF TG_OP = 'INSERT' THEN
    UPDATE inventory_items 
    SET current_stock = current_stock - NEW.quantity_used,
        updated_at = now()
    WHERE id = NEW.inventory_item_id;
    
    -- تسجيل حركة المخزون
    INSERT INTO stock_transactions (
      item_id, transaction_type, quantity, unit_cost, total_cost,
      reference_type, reference_id, notes, performed_by
    ) VALUES (
      NEW.inventory_item_id, 'out', NEW.quantity_used, NEW.unit_cost, NEW.total_cost,
      'maintenance', NEW.maintenance_id, 'استخدام في الصيانة', auth.uid()
    );
    
  -- إعادة الكمية عند الحذف
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE inventory_items 
    SET current_stock = current_stock + OLD.quantity_used,
        updated_at = now()
    WHERE id = OLD.inventory_item_id;
    
    -- تسجيل حركة المخزون
    INSERT INTO stock_transactions (
      item_id, transaction_type, quantity, unit_cost, total_cost,
      reference_type, reference_id, notes, performed_by
    ) VALUES (
      OLD.inventory_item_id, 'in', OLD.quantity_used, OLD.unit_cost, OLD.total_cost,
      'maintenance_return', OLD.maintenance_id, 'إرجاع من الصيانة', auth.uid()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق التريجر على قطع الغيار والزيوت
CREATE TRIGGER trigger_deduct_parts_stock
  AFTER INSERT OR DELETE ON maintenance_parts_used
  FOR EACH ROW EXECUTE FUNCTION deduct_inventory_stock();

CREATE TRIGGER trigger_deduct_oils_stock
  AFTER INSERT OR DELETE ON maintenance_oils_used
  FOR EACH ROW EXECUTE FUNCTION deduct_inventory_stock();

-- إضافة حقول جديدة لجدول vehicle_maintenance
ALTER TABLE vehicle_maintenance 
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS work_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS work_end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_duration_hours NUMERIC DEFAULT 0;

-- إضافة تريجر لتحديث التوقيتات
CREATE OR REPLACE FUNCTION update_maintenance_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_maintenance_timestamps
  BEFORE UPDATE ON vehicle_maintenance
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_timestamps();
