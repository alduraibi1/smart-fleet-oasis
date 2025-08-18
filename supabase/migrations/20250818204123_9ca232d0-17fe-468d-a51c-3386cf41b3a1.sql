
-- حذف جميع الجداول الموجودة
DROP TABLE IF EXISTS public.smart_alert_rules CASCADE;
DROP TABLE IF EXISTS public.maintenance_schedules CASCADE;
DROP TABLE IF EXISTS public.notification_templates CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.vehicle_location CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.inventory_items_extended CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.profitability_snapshots CASCADE;
DROP TABLE IF EXISTS public.maintenance_work_hours CASCADE;
DROP TABLE IF EXISTS public.customer_documents CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.dynamic_pricing_rules CASCADE;
DROP TABLE IF EXISTS public.maintenance_templates CASCADE;
DROP TABLE IF EXISTS public.vehicle_images CASCADE;
DROP TABLE IF EXISTS public.financial_ai_predictions CASCADE;
DROP TABLE IF EXISTS public.stock_transactions CASCADE;
DROP TABLE IF EXISTS public.payment_vouchers CASCADE;
DROP TABLE IF EXISTS public.customer_guarantors CASCADE;
DROP TABLE IF EXISTS public.user_notification_preferences CASCADE;
DROP TABLE IF EXISTS public.behavioral_analytics CASCADE;
DROP TABLE IF EXISTS public.notification_history CASCADE;
DROP TABLE IF EXISTS public.chart_of_accounts CASCADE;
DROP TABLE IF EXISTS public.notification_settings CASCADE;
DROP TABLE IF EXISTS public.saved_report_settings CASCADE;
DROP TABLE IF EXISTS public.work_orders CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.customer_ratings CASCADE;
DROP TABLE IF EXISTS public.mechanics CASCADE;
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;
DROP TABLE IF EXISTS public.inventory_transactions CASCADE;
DROP TABLE IF EXISTS public.contract_accruals CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.vehicle_owners CASCADE;
DROP TABLE IF EXISTS public.rental_contracts CASCADE;
DROP TABLE IF EXISTS public.payment_receipts CASCADE;
DROP TABLE IF EXISTS public.vehicle_maintenance CASCADE;
DROP TABLE IF EXISTS public.maintenance_parts_used CASCADE;
DROP TABLE IF EXISTS public.maintenance_oils_used CASCADE;
DROP TABLE IF EXISTS public.smart_notifications CASCADE;
DROP TABLE IF EXISTS public.financial_warnings CASCADE;
DROP TABLE IF EXISTS public.failed_login_attempts CASCADE;
DROP TABLE IF EXISTS public.maintenance_predictions CASCADE;
DROP TABLE IF EXISTS public.cost_centers CASCADE;
DROP TABLE IF EXISTS public.cost_center_mappings CASCADE;
DROP TABLE IF EXISTS public.financial_anomalies CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;

-- حذف الأنواع المخصصة
DROP TYPE IF EXISTS public.app_role CASCADE;

-- إنشاء نوع الأدوار
CREATE TYPE public.app_role AS ENUM ('admin', 'accountant', 'employee', 'manager');

-- إنشاء جدول الملفات الشخصية
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  position TEXT,
  department TEXT,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول أدوار المستخدمين
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- إنشاء جدول الصلاحيات
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول ربط الأدوار بالصلاحيات
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- إنشاء جدول العملاء
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  name_english VARCHAR,
  phone VARCHAR NOT NULL,
  phone_secondary VARCHAR,
  email VARCHAR,
  national_id VARCHAR NOT NULL UNIQUE,
  date_of_birth DATE,
  nationality VARCHAR DEFAULT 'سعودي',
  license_number VARCHAR,
  license_expiry DATE,
  address TEXT,
  city VARCHAR,
  district VARCHAR,
  postal_code VARCHAR,
  country VARCHAR DEFAULT 'السعودية',
  job_title VARCHAR,
  company VARCHAR,
  work_phone VARCHAR,
  monthly_income NUMERIC,
  bank_name VARCHAR,
  account_number VARCHAR,
  credit_limit NUMERIC DEFAULT 0,
  risk_status VARCHAR DEFAULT 'low',
  total_rentals INTEGER DEFAULT 0,
  last_rental_date DATE,
  is_active BOOLEAN DEFAULT true,
  blacklisted BOOLEAN DEFAULT false,
  blacklist_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول ضامني العملاء
CREATE TABLE public.customer_guarantors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR NOT NULL,
  name_english VARCHAR,
  phone VARCHAR NOT NULL,
  phone_secondary VARCHAR,
  email VARCHAR,
  national_id VARCHAR NOT NULL,
  date_of_birth DATE,
  nationality VARCHAR DEFAULT 'سعودي',
  relation VARCHAR NOT NULL,
  job_title VARCHAR,
  company VARCHAR,
  work_phone VARCHAR,
  monthly_income NUMERIC,
  address TEXT,
  city VARCHAR,
  district VARCHAR,
  postal_code VARCHAR,
  country VARCHAR DEFAULT 'السعودية',
  license_number VARCHAR,
  license_expiry DATE,
  bank_name VARCHAR,
  account_number VARCHAR,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول مستندات العملاء
CREATE TABLE public.customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  document_type VARCHAR NOT NULL,
  document_name VARCHAR NOT NULL,
  file_url TEXT,
  file_name VARCHAR,
  status VARCHAR DEFAULT 'valid',
  expiry_date DATE,
  uploaded_by UUID REFERENCES auth.users(id),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول ملاك المركبات
CREATE TABLE public.vehicle_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  contact_person VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  address TEXT,
  tax_number VARCHAR,
  commission_rate NUMERIC DEFAULT 0,
  pending_commission NUMERIC DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  payment_terms TEXT,
  bank_details TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول المركبات
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.vehicle_owners(id),
  plate_number VARCHAR NOT NULL UNIQUE,
  brand VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  year INTEGER,
  color VARCHAR,
  fuel_type VARCHAR DEFAULT 'gasoline',
  transmission VARCHAR DEFAULT 'automatic',
  engine_size VARCHAR,
  vin VARCHAR UNIQUE,
  registration_expiry DATE,
  insurance_expiry DATE,
  insurance_company VARCHAR,
  insurance_policy_number VARCHAR,
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  weekly_rate NUMERIC DEFAULT 0,
  monthly_rate NUMERIC DEFAULT 0,
  mileage INTEGER DEFAULT 0,
  last_maintenance_date DATE,
  next_maintenance_due INTEGER,
  status VARCHAR DEFAULT 'available',
  location VARCHAR,
  features TEXT[],
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول صور المركبات
CREATE TABLE public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR DEFAULT 'other',
  description TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- إنشاء جدول مواقع المركبات
CREATE TABLE public.vehicle_location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  is_tracked BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول عقود الإيجار
CREATE TABLE public.rental_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  daily_rate NUMERIC NOT NULL,
  payment_method VARCHAR DEFAULT 'cash',
  payment_schedule VARCHAR DEFAULT 'full',
  status VARCHAR DEFAULT 'active',
  pickup_location VARCHAR,
  return_location VARCHAR,
  pickup_odometer INTEGER,
  return_odometer INTEGER,
  fuel_level_pickup VARCHAR DEFAULT 'full',
  fuel_level_return VARCHAR,
  additional_terms TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول سندات القبض
CREATE TABLE public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR NOT NULL UNIQUE,
  contract_id UUID REFERENCES public.rental_contracts(id),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  amount NUMERIC NOT NULL,
  payment_method VARCHAR NOT NULL,
  payment_date DATE NOT NULL,
  receipt_type VARCHAR DEFAULT 'rental_payment',
  status VARCHAR DEFAULT 'confirmed',
  reference_number VARCHAR,
  notes TEXT,
  issued_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الميكانيكيين
CREATE TABLE public.mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  employee_id VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  specializations TEXT[],
  hourly_rate NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول صيانة المركبات
CREATE TABLE public.vehicle_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  mechanic_id UUID REFERENCES public.mechanics(id),
  maintenance_type VARCHAR NOT NULL,
  description TEXT,
  reported_issue TEXT,
  scheduled_date DATE,
  completed_date DATE,
  status VARCHAR DEFAULT 'scheduled',
  odometer_in INTEGER,
  odometer_out INTEGER,
  labor_cost NUMERIC DEFAULT 0,
  parts_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  warranty_period INTEGER,
  notes TEXT,
  images TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الموردين
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  contact_person VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  tax_number VARCHAR,
  payment_terms TEXT,
  rating NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول المخزون
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  sku VARCHAR,
  barcode VARCHAR,
  part_number VARCHAR,
  category_id UUID,
  supplier_id UUID REFERENCES public.suppliers(id),
  unit_of_measure VARCHAR DEFAULT 'piece',
  unit_cost NUMERIC DEFAULT 0,
  selling_price NUMERIC,
  current_stock NUMERIC DEFAULT 0,
  minimum_stock NUMERIC DEFAULT 0,
  maximum_stock NUMERIC,
  reorder_point NUMERIC,
  location VARCHAR,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول حركات المخزون
CREATE TABLE public.stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
  transaction_type VARCHAR NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC,
  total_cost NUMERIC,
  reference_type VARCHAR,
  reference_id UUID,
  notes TEXT,
  performed_by UUID REFERENCES auth.users(id),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول قطع الغيار المستخدمة في الصيانة
CREATE TABLE public.maintenance_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID REFERENCES public.vehicle_maintenance(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
  quantity_used NUMERIC NOT NULL,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الزيوت المستخدمة في الصيانة
CREATE TABLE public.maintenance_oils_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID REFERENCES public.vehicle_maintenance(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) NOT NULL,
  quantity_used NUMERIC NOT NULL,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول ساعات العمل في الصيانة
CREATE TABLE public.maintenance_work_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_id UUID REFERENCES public.vehicle_maintenance(id) ON DELETE CASCADE NOT NULL,
  mechanic_id UUID REFERENCES public.mechanics(id) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  break_hours NUMERIC DEFAULT 0,
  total_hours NUMERIC,
  hourly_rate NUMERIC NOT NULL,
  total_cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول سندات الصرف
CREATE TABLE public.payment_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number VARCHAR NOT NULL UNIQUE,
  recipient_type VARCHAR NOT NULL,
  recipient_id UUID,
  recipient_name TEXT NOT NULL,
  recipient_phone VARCHAR,
  recipient_account VARCHAR,
  amount NUMERIC NOT NULL,
  payment_method VARCHAR NOT NULL,
  payment_date DATE NOT NULL,
  expense_category VARCHAR NOT NULL,
  expense_type VARCHAR NOT NULL,
  description TEXT NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  contract_id UUID REFERENCES public.rental_contracts(id),
  maintenance_id UUID REFERENCES public.vehicle_maintenance(id),
  currency VARCHAR DEFAULT 'SAR',
  reference_number VARCHAR,
  check_number VARCHAR,
  bank_details TEXT,
  transaction_id VARCHAR,
  status VARCHAR DEFAULT 'draft',
  notes TEXT,
  approval_notes TEXT,
  requires_higher_approval BOOLEAN DEFAULT false,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  issued_by UUID REFERENCES auth.users(id) NOT NULL,
  approval_date DATE,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الإشعارات الذكية
CREATE TABLE public.smart_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info',
  category VARCHAR DEFAULT 'system',
  priority VARCHAR DEFAULT 'medium',
  reference_type VARCHAR,
  reference_id UUID,
  reference_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  target_roles TEXT[],
  action_required BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivery_channels TEXT[] DEFAULT ARRAY['in_app'],
  status VARCHAR DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول إعدادات النظام
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول سجل الأنشطة
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  tag TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول التحذيرات المالية
CREATE TABLE public.financial_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warning_type VARCHAR NOT NULL,
  owner_id UUID REFERENCES public.vehicle_owners(id),
  voucher_id UUID REFERENCES public.payment_vouchers(id),
  amount NUMERIC NOT NULL,
  available_balance NUMERIC NOT NULL,
  deficit NUMERIC NOT NULL,
  warning_message TEXT NOT NULL,
  status VARCHAR DEFAULT 'active',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تمكين Row Level Security على الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_parts_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_oils_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_work_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_warnings ENABLE ROW LEVEL SECURITY;
