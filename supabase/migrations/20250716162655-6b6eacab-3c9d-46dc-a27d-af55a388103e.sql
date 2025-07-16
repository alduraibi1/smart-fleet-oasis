-- المرحلة الأولى: إنشاء البنية المحاسبية المتكاملة

-- جدول سندات القبض المحسن
CREATE TABLE public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number VARCHAR NOT NULL UNIQUE,
  
  -- ربط الفاتورة والعقد
  invoice_id UUID REFERENCES invoices(id),
  invoice_number VARCHAR,
  contract_id UUID REFERENCES rental_contracts(id),
  
  -- تفاصيل العميل
  customer_id UUID REFERENCES customers(id) NOT NULL,
  customer_name TEXT NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id),
  plate_number VARCHAR,
  
  -- تفاصيل الدفع
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check', 'pos')),
  payment_date DATE NOT NULL,
  
  -- تفاصيل المرجع
  reference_number VARCHAR,
  check_number VARCHAR,
  bank_details TEXT,
  transaction_id VARCHAR,
  
  -- التصنيف والمحاسبة
  receipt_type VARCHAR NOT NULL CHECK (receipt_type IN ('rental_payment', 'security_deposit', 'additional_charges', 'penalty', 'refund', 'advance_payment')),
  account_id UUID REFERENCES chart_of_accounts(id),
  
  -- الحالة والمعالجة
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'deposited', 'cancelled', 'returned')),
  journal_entry_id UUID REFERENCES journal_entries(id),
  
  -- إدارية
  issued_by UUID,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_by UUID,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  deposited_at TIMESTAMP WITH TIME ZONE,
  printed_at TIMESTAMP WITH TIME ZONE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- تواريخ النظام
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول سندات الصرف المحسن
CREATE TABLE public.payment_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number VARCHAR NOT NULL UNIQUE,
  
  -- تفاصيل المستفيد
  recipient_type VARCHAR NOT NULL CHECK (recipient_type IN ('owner', 'supplier', 'mechanic', 'employee', 'vendor', 'service_provider', 'other')),
  recipient_id UUID,
  recipient_name TEXT NOT NULL,
  recipient_phone VARCHAR,
  recipient_account VARCHAR,
  
  -- تفاصيل الدفع
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'pos')),
  payment_date DATE NOT NULL,
  currency VARCHAR DEFAULT 'SAR',
  
  -- ربط الفاتورة
  invoice_id UUID REFERENCES invoices(id),
  invoice_number VARCHAR,
  
  -- التصنيف والمحاسبة
  expense_category VARCHAR NOT NULL CHECK (expense_category IN ('maintenance', 'fuel', 'insurance', 'owner_commission', 'salary', 'office_expenses', 'parts_purchase', 'oil_purchase', 'service_fees', 'other')),
  expense_type VARCHAR NOT NULL CHECK (expense_type IN ('operational', 'capital', 'administrative')),
  account_id UUID REFERENCES chart_of_accounts(id),
  
  -- تفاصيل المرجع
  reference_number VARCHAR,
  check_number VARCHAR,
  bank_details TEXT,
  transaction_id VARCHAR,
  
  -- السجلات المرتبطة
  vehicle_id UUID REFERENCES vehicles(id),
  contract_id UUID REFERENCES rental_contracts(id),
  maintenance_id UUID REFERENCES vehicle_maintenance(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  
  -- الحالة والمعالجة
  status VARCHAR NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'paid', 'cancelled', 'rejected')),
  journal_entry_id UUID REFERENCES journal_entries(id),
  
  -- سير العمل للموافقة
  requested_by UUID NOT NULL,
  approved_by UUID,
  approval_date DATE,
  approval_notes TEXT,
  requires_higher_approval BOOLEAN DEFAULT false,
  
  -- إدارية
  description TEXT NOT NULL,
  notes TEXT,
  issued_by UUID NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  printed_at TIMESTAMP WITH TIME ZONE,
  
  -- تواريخ النظام
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول سندات الخصم
CREATE TABLE public.discount_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number VARCHAR NOT NULL UNIQUE,
  contract_id UUID REFERENCES rental_contracts(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  customer_name TEXT NOT NULL,
  
  -- تفاصيل الخصم
  discount_amount DECIMAL(12,2) NOT NULL CHECK (discount_amount > 0),
  discount_percentage DECIMAL(5,2),
  original_amount DECIMAL(12,2) NOT NULL,
  final_amount DECIMAL(12,2) NOT NULL,
  
  -- التصنيف
  discount_type VARCHAR NOT NULL CHECK (discount_type IN ('early_payment', 'long_term_rental', 'loyalty_customer', 'promotional', 'compensation', 'other')),
  discount_reason TEXT NOT NULL,
  
  -- الموافقة والتفويض
  approved_by UUID NOT NULL,
  approval_date DATE NOT NULL,
  requires_higher_approval BOOLEAN DEFAULT false,
  
  -- الحالة والملاحظات
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'applied', 'cancelled')),
  notes TEXT,
  
  -- إدارية
  issued_by UUID NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE,
  
  -- تواريخ النظام
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول المعاملات المحاسبية
CREATE TABLE public.accounting_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL,
  transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('receipt', 'voucher', 'discount')),
  reference_id UUID NOT NULL,
  reference_number VARCHAR NOT NULL,
  
  -- تفاصيل المعاملة
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  
  -- التصنيف
  account_type VARCHAR NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  account_category VARCHAR NOT NULL,
  
  -- الكيانات المرتبطة
  vehicle_id UUID REFERENCES vehicles(id),
  customer_id UUID REFERENCES customers(id),
  owner_id UUID REFERENCES vehicle_owners(id),
  contract_id UUID REFERENCES rental_contracts(id),
  
  -- القيد المزدوج
  debit_account UUID REFERENCES chart_of_accounts(id) NOT NULL,
  credit_account UUID REFERENCES chart_of_accounts(id) NOT NULL,
  
  -- الحالة
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'cancelled')),
  
  -- إدارية
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  posted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة حقول جديدة لجدول المالكين لربطه بالنظام المحاسبي
ALTER TABLE public.vehicle_owners 
ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN total_revenue DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN total_commission DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN paid_commission DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN pending_commission DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN last_payment_date DATE,
ADD COLUMN payment_frequency VARCHAR DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'quarterly', 'annual')),
ADD COLUMN account_id UUID REFERENCES chart_of_accounts(id),
ADD COLUMN bank_account VARCHAR,
ADD COLUMN iban VARCHAR;

-- إضافة حقول جديدة لجدول الفواتير لربطها بالنظام
ALTER TABLE public.invoices 
ADD COLUMN invoice_type VARCHAR DEFAULT 'rental' CHECK (invoice_type IN ('rental', 'maintenance', 'purchase', 'additional_charges')),
ADD COLUMN period_start DATE,
ADD COLUMN period_end DATE,
ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 15.00,
ADD COLUMN payment_terms TEXT DEFAULT 'الدفع عند الاستلام',
ADD COLUMN currency VARCHAR DEFAULT 'SAR',
ADD COLUMN approved_by UUID,
ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_payment_receipts_customer_id ON payment_receipts(customer_id);
CREATE INDEX idx_payment_receipts_contract_id ON payment_receipts(contract_id);
CREATE INDEX idx_payment_receipts_vehicle_id ON payment_receipts(vehicle_id);
CREATE INDEX idx_payment_receipts_date ON payment_receipts(payment_date);
CREATE INDEX idx_payment_receipts_status ON payment_receipts(status);

CREATE INDEX idx_payment_vouchers_recipient_id ON payment_vouchers(recipient_id);
CREATE INDEX idx_payment_vouchers_vehicle_id ON payment_vouchers(vehicle_id);
CREATE INDEX idx_payment_vouchers_contract_id ON payment_vouchers(contract_id);
CREATE INDEX idx_payment_vouchers_date ON payment_vouchers(payment_date);
CREATE INDEX idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX idx_payment_vouchers_category ON payment_vouchers(expense_category);

CREATE INDEX idx_discount_vouchers_customer_id ON discount_vouchers(customer_id);
CREATE INDEX idx_discount_vouchers_contract_id ON discount_vouchers(contract_id);
CREATE INDEX idx_discount_vouchers_date ON discount_vouchers(approval_date);

CREATE INDEX idx_accounting_transactions_reference ON accounting_transactions(reference_id, transaction_type);
CREATE INDEX idx_accounting_transactions_vehicle ON accounting_transactions(vehicle_id);
CREATE INDEX idx_accounting_transactions_customer ON accounting_transactions(customer_id);
CREATE INDEX idx_accounting_transactions_date ON accounting_transactions(transaction_date);

-- إنشاء دالة لتحديث تواريخ التحديث
CREATE OR REPLACE FUNCTION update_accounting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء المشغلات لتحديث التواريخ
CREATE TRIGGER update_payment_receipts_updated_at
  BEFORE UPDATE ON payment_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_accounting_updated_at();

CREATE TRIGGER update_payment_vouchers_updated_at
  BEFORE UPDATE ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_accounting_updated_at();

CREATE TRIGGER update_discount_vouchers_updated_at
  BEFORE UPDATE ON discount_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_accounting_updated_at();

CREATE TRIGGER update_accounting_transactions_updated_at
  BEFORE UPDATE ON accounting_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_accounting_updated_at();

-- إنشاء دالة لتوليد أرقام سندات القبض
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_num
  FROM payment_receipts 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  RETURN 'REC-' || year_part || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة لتوليد أرقام سندات الصرف
CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_num
  FROM payment_vouchers 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  RETURN 'VOC-' || year_part || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة لتوليد أرقام سندات الخصم
CREATE OR REPLACE FUNCTION generate_discount_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT LPAD((COUNT(*) + 1)::TEXT, 6, '0') INTO sequence_num
  FROM discount_vouchers 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  RETURN 'DIS-' || year_part || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;