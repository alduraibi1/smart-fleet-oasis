-- Create chart of accounts table
CREATE TABLE public.chart_of_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_code VARCHAR(20) NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id UUID REFERENCES public.chart_of_accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create journal entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_number VARCHAR(50) NOT NULL UNIQUE,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50), -- 'invoice', 'voucher', 'maintenance', 'contract'
  reference_id UUID,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create journal entry lines table
CREATE TABLE public.journal_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  description TEXT,
  debit_amount DECIMAL(12,2) DEFAULT 0,
  credit_amount DECIMAL(12,2) DEFAULT 0,
  line_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  contract_id UUID, -- Reference to contracts table
  vehicle_id UUID,  -- Reference to vehicles table
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  line_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number VARCHAR(50) NOT NULL UNIQUE,
  voucher_type VARCHAR(20) NOT NULL CHECK (voucher_type IN ('payment', 'receipt', 'discount')),
  voucher_date DATE NOT NULL,
  beneficiary_name TEXT NOT NULL,
  beneficiary_type VARCHAR(20) NOT NULL CHECK (beneficiary_type IN ('customer', 'supplier', 'employee', 'other')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50), -- 'invoice', 'maintenance', 'contract', 'payroll'
  reference_id UUID,
  payment_method VARCHAR(30) CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card', 'other')),
  bank_account TEXT,
  check_number TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid', 'cancelled')),
  approval_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create digital signatures table
CREATE TABLE public.digital_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('invoice', 'voucher', 'contract')),
  document_id UUID NOT NULL,
  signer_name TEXT NOT NULL,
  signer_role TEXT NOT NULL,
  signature_data TEXT, -- Base64 encoded signature image
  signature_hash TEXT, -- Hash for verification
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - can be restricted later with user roles)
CREATE POLICY "Allow all operations on chart_of_accounts" ON public.chart_of_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on journal_entries" ON public.journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on journal_entry_lines" ON public.journal_entry_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoice_items" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on vouchers" ON public.vouchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on digital_signatures" ON public.digital_signatures FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entries_reference ON public.journal_entries(reference_type, reference_id);
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_name);
CREATE INDEX idx_vouchers_date ON public.vouchers(voucher_date);
CREATE INDEX idx_vouchers_type ON public.vouchers(voucher_type);
CREATE INDEX idx_vouchers_status ON public.vouchers(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_chart_of_accounts_updated_at
  BEFORE UPDATE ON public.chart_of_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default chart of accounts
INSERT INTO public.chart_of_accounts (account_code, account_name, account_type) VALUES
('1000', 'الأصول المتداولة', 'asset'),
('1100', 'النقدية وما في حكمها', 'asset'),
('1110', 'الصندوق', 'asset'),
('1120', 'البنك', 'asset'),
('1200', 'المدينون', 'asset'),
('1300', 'المخزون', 'asset'),
('1400', 'الأصول الثابتة', 'asset'),
('1410', 'المركبات', 'asset'),
('1420', 'المعدات', 'asset'),
('2000', 'الخصوم المتداولة', 'liability'),
('2100', 'الدائنون', 'liability'),
('2200', 'المصروفات المستحقة', 'liability'),
('3000', 'رأس المال', 'equity'),
('3100', 'رأس المال المدفوع', 'equity'),
('3200', 'الأرباح المحتجزة', 'equity'),
('4000', 'الإيرادات', 'revenue'),
('4100', 'إيرادات الإيجار', 'revenue'),
('4200', 'إيرادات الخدمات', 'revenue'),
('5000', 'المصروفات', 'expense'),
('5100', 'مصروفات الصيانة', 'expense'),
('5200', 'مصروفات التشغيل', 'expense'),
('5300', 'مصروفات إدارية', 'expense');