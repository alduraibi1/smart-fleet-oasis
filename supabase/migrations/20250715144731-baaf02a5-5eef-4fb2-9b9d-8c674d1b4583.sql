-- إنشاء جداول المخزون الأساسية
CREATE TABLE public.inventory_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  contact_person VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  tax_number VARCHAR,
  payment_terms TEXT,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.inventory_categories(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  sku VARCHAR UNIQUE,
  barcode VARCHAR,
  unit_of_measure VARCHAR NOT NULL DEFAULT 'piece',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  minimum_stock NUMERIC NOT NULL DEFAULT 0,
  maximum_stock NUMERIC DEFAULT 0,
  reorder_point NUMERIC DEFAULT 0,
  location VARCHAR,
  expiry_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.stock_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC,
  total_cost NUMERIC,
  reference_type VARCHAR,
  reference_id UUID,
  notes TEXT,
  performed_by UUID,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'delivered', 'cancelled')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  received_quantity NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جداول دعم الصيانة
CREATE TABLE public.mechanics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  employee_id VARCHAR UNIQUE,
  phone VARCHAR,
  email VARCHAR,
  specializations TEXT[],
  hourly_rate NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  hire_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  maintenance_type VARCHAR NOT NULL,
  estimated_duration_hours NUMERIC,
  estimated_cost NUMERIC,
  required_parts JSONB,
  checklist_items TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  template_id UUID REFERENCES public.maintenance_templates(id),
  maintenance_type VARCHAR NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_mileage INTEGER,
  priority VARCHAR NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تحديث جدول الصيانة الموجود لإضافة المزيد من التفاصيل
ALTER TABLE public.vehicle_maintenance 
ADD COLUMN IF NOT EXISTS mechanic_id UUID REFERENCES public.mechanics(id),
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.maintenance_templates(id),
ADD COLUMN IF NOT EXISTS parts_used JSONB,
ADD COLUMN IF NOT EXISTS oils_used JSONB,
ADD COLUMN IF NOT EXISTS labor_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS parts_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS warranty_until DATE,
ADD COLUMN IF NOT EXISTS images TEXT[];

-- إنشاء الفهارس للأداء
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_items_supplier ON public.inventory_items(supplier_id);
CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku);
CREATE INDEX idx_stock_transactions_item ON public.stock_transactions(item_id);
CREATE INDEX idx_stock_transactions_date ON public.stock_transactions(transaction_date);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_maintenance_schedules_vehicle ON public.maintenance_schedules(vehicle_id);
CREATE INDEX idx_maintenance_schedules_date ON public.maintenance_schedules(scheduled_date);
CREATE INDEX idx_vehicle_maintenance_mechanic ON public.vehicle_maintenance(mechanic_id);

-- تمكين RLS على جميع الجداول
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS للمخزون
CREATE POLICY "Authenticated users can manage inventory categories" ON public.inventory_categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage inventory items" ON public.inventory_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage stock transactions" ON public.stock_transactions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage purchase orders" ON public.purchase_orders FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage purchase order items" ON public.purchase_order_items FOR ALL USING (auth.uid() IS NOT NULL);

-- إنشاء سياسات RLS للصيانة
CREATE POLICY "Authenticated users can manage mechanics" ON public.mechanics FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage maintenance templates" ON public.maintenance_templates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage maintenance schedules" ON public.maintenance_schedules FOR ALL USING (auth.uid() IS NOT NULL);

-- إنشاء تريجرز لتحديث updated_at
CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON public.inventory_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mechanics_updated_at BEFORE UPDATE ON public.mechanics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_templates_updated_at BEFORE UPDATE ON public.maintenance_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_schedules_updated_at BEFORE UPDATE ON public.maintenance_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة بيانات أولية للفئات
INSERT INTO public.inventory_categories (name, description) VALUES
('قطع غيار المحرك', 'قطع غيار وأجزاء المحرك'),
('قطع غيار الفرامل', 'أقراص وخدادات الفرامل'),
('الإطارات والعجلات', 'إطارات وعجلات مختلف الأحجام'),
('الزيوت والسوائل', 'زيوت المحرك وسوائل التشغيل'),
('قطع الكهرباء', 'البطاريات والأسلاك الكهربائية'),
('المرشحات', 'مرشحات الهواء والوقود والزيت'),
('التكييف', 'قطع غيار نظام التكييف'),
('الإضاءة', 'المصابيح والكشافات');

-- إضافة قوالب صيانة أساسية
INSERT INTO public.maintenance_templates (name, description, maintenance_type, estimated_duration_hours, estimated_cost) VALUES
('صيانة دورية أساسية', 'فحص شامل وتغيير الزيت والمرشحات', 'scheduled', 2.0, 150.00),
('فحص الفرامل', 'فحص وتنظيف نظام الفرامل', 'inspection', 1.0, 80.00),
('تغيير الإطارات', 'تغيير وتوازن الإطارات', 'tire_service', 1.5, 200.00),
('صيانة التكييف', 'فحص وتنظيف نظام التكييف', 'air_conditioning', 2.0, 120.00),
('فحص كهربائي', 'فحص النظام الكهربائي والبطارية', 'electrical', 1.0, 100.00);