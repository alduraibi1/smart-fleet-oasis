-- إنشاء جدول العملاء
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  name_english VARCHAR,
  phone VARCHAR NOT NULL,
  phone_secondary VARCHAR,
  email VARCHAR,
  email_secondary VARCHAR,
  national_id VARCHAR NOT NULL UNIQUE,
  nationality VARCHAR DEFAULT 'سعودي',
  date_of_birth DATE,
  gender VARCHAR DEFAULT 'male',
  marital_status VARCHAR DEFAULT 'single',
  
  -- معلومات الرخصة
  license_number VARCHAR NOT NULL,
  license_expiry DATE NOT NULL,
  license_type VARCHAR DEFAULT 'private',
  license_issue_date DATE,
  license_issue_place VARCHAR,
  international_license BOOLEAN DEFAULT false,
  international_license_number VARCHAR,
  international_license_expiry DATE,
  
  -- معلومات العنوان
  address TEXT,
  city VARCHAR,
  district VARCHAR,
  postal_code VARCHAR,
  country VARCHAR DEFAULT 'السعودية',
  address_type VARCHAR DEFAULT 'residential',
  
  -- معلومات العمل
  job_title VARCHAR,
  company VARCHAR,
  work_address TEXT,
  work_phone VARCHAR,
  monthly_income DECIMAL,
  
  -- جهة الاتصال في الطوارئ
  emergency_contact_name VARCHAR,
  emergency_contact_phone VARCHAR,
  emergency_contact_relation VARCHAR,
  
  -- التفضيلات والإعدادات
  preferred_language VARCHAR DEFAULT 'ar',
  marketing_consent BOOLEAN DEFAULT false,
  sms_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  
  -- التقييم والمعلومات الإضافية
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  customer_source VARCHAR DEFAULT 'website',
  referred_by VARCHAR,
  
  -- معلومات الائتمان
  credit_limit DECIMAL DEFAULT 0,
  payment_terms VARCHAR DEFAULT 'immediate',
  preferred_payment_method VARCHAR DEFAULT 'cash',
  bank_account_number VARCHAR,
  bank_name VARCHAR,
  
  -- معلومات التأمين
  has_insurance BOOLEAN DEFAULT false,
  insurance_company VARCHAR,
  insurance_policy_number VARCHAR,
  insurance_expiry DATE,
  
  -- معلومات الحالة
  is_active BOOLEAN DEFAULT true,
  blacklisted BOOLEAN DEFAULT false,
  blacklist_reason TEXT,
  blacklist_date DATE,
  total_rentals INTEGER DEFAULT 0,
  last_rental_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- إنشاء جدول الضامن للعملاء
CREATE TABLE public.customer_guarantors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  name_english VARCHAR,
  phone VARCHAR NOT NULL,
  phone_secondary VARCHAR,
  email VARCHAR,
  national_id VARCHAR NOT NULL,
  nationality VARCHAR DEFAULT 'سعودي',
  date_of_birth DATE,
  relation VARCHAR NOT NULL,
  job_title VARCHAR,
  company VARCHAR,
  work_phone VARCHAR,
  monthly_income DECIMAL,
  address TEXT,
  city VARCHAR,
  district VARCHAR,
  postal_code VARCHAR,
  country VARCHAR DEFAULT 'السعودية',
  license_number VARCHAR,
  license_expiry DATE,
  bank_name VARCHAR,
  account_number VARCHAR,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول وثائق العملاء
CREATE TABLE public.customer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  document_type VARCHAR NOT NULL,
  document_name VARCHAR NOT NULL,
  file_url TEXT,
  file_name VARCHAR,
  expiry_date DATE,
  status VARCHAR DEFAULT 'valid',
  notes TEXT,
  uploaded_by UUID,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول العقود (ربط العملاء بالمركبات)
CREATE TABLE public.rental_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number VARCHAR NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  
  -- تواريخ العقد
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_return_date DATE,
  
  -- تفاصيل العقد
  daily_rate DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  deposit_amount DECIMAL DEFAULT 0,
  insurance_amount DECIMAL DEFAULT 0,
  additional_charges DECIMAL DEFAULT 0,
  discount_amount DECIMAL DEFAULT 0,
  
  -- معلومات الدفع
  payment_method VARCHAR DEFAULT 'cash',
  payment_status VARCHAR DEFAULT 'pending',
  paid_amount DECIMAL DEFAULT 0,
  remaining_amount DECIMAL DEFAULT 0,
  
  -- معلومات الإضافية
  pickup_location TEXT,
  return_location TEXT,
  mileage_start INTEGER,
  mileage_end INTEGER,
  fuel_level_start VARCHAR,
  fuel_level_end VARCHAR,
  
  -- حالة العقد
  status VARCHAR DEFAULT 'active',
  notes TEXT,
  terms_conditions TEXT,
  
  -- معلومات التوقيع
  customer_signature TEXT,
  employee_signature TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- إنشاء جدول تقييم العملاء
CREATE TABLE public.customer_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES rental_contracts(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  rating_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء الفهارس
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_national_id ON customers(national_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_license_number ON customers(license_number);
CREATE INDEX idx_customers_blacklisted ON customers(blacklisted);
CREATE INDEX idx_customers_created_at ON customers(created_at);

CREATE INDEX idx_rental_contracts_customer_id ON rental_contracts(customer_id);
CREATE INDEX idx_rental_contracts_vehicle_id ON rental_contracts(vehicle_id);
CREATE INDEX idx_rental_contracts_start_date ON rental_contracts(start_date);
CREATE INDEX idx_rental_contracts_status ON rental_contracts(status);

CREATE INDEX idx_customer_documents_customer_id ON customer_documents(customer_id);
CREATE INDEX idx_customer_documents_document_type ON customer_documents(document_type);
CREATE INDEX idx_customer_documents_expiry_date ON customer_documents(expiry_date);

-- تفعيل RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_ratings ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "المستخدمون المسجلون يمكنهم عرض العملاء" ON customers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة العملاء" ON customers
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة الضامنين" ON customer_guarantors
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة وثائق العملاء" ON customer_documents
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة العقود" ON rental_contracts
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة التقييمات" ON customer_ratings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_guarantors_updated_at
  BEFORE UPDATE ON customer_guarantors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_documents_updated_at
  BEFORE UPDATE ON customer_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_contracts_updated_at
  BEFORE UPDATE ON rental_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- إنشاء trigger لتحديث إجمالي الإيجارات
CREATE OR REPLACE FUNCTION update_customer_rental_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE customers 
    SET total_rentals = total_rentals + 1,
        last_rental_date = NEW.start_date
    WHERE id = NEW.customer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE customers 
    SET total_rentals = total_rentals - 1
    WHERE id = OLD.customer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_rental_stats_trigger
  AFTER INSERT OR DELETE ON rental_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_rental_stats();