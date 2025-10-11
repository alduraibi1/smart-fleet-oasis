-- المرحلة 2: إنشاء جدول outstanding_invoices لتتبع المبالغ المستحقة على العملاء
CREATE TABLE IF NOT EXISTS outstanding_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES rental_contracts(id) ON DELETE SET NULL,
  invoice_type VARCHAR(50) NOT NULL CHECK (invoice_type IN ('damages', 'late_fees', 'additional_charges')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived', 'disputed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  paid_amount NUMERIC DEFAULT 0 CHECK (paid_amount >= 0),
  created_by UUID REFERENCES auth.users(id)
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_outstanding_invoices_customer ON outstanding_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_outstanding_invoices_contract ON outstanding_invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_outstanding_invoices_status ON outstanding_invoices(status);
CREATE INDEX IF NOT EXISTS idx_outstanding_invoices_due_date ON outstanding_invoices(due_date);

-- تفعيل RLS
ALTER TABLE outstanding_invoices ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "المستخدمون المسجلون يمكنهم عرض الفواتير المستحقة"
  ON outstanding_invoices FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إضافة فواتير مستحقة"
  ON outstanding_invoices FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم تحديث الفواتير المستحقة"
  ON outstanding_invoices FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_outstanding_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_outstanding_invoices_timestamp
  BEFORE UPDATE ON outstanding_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_outstanding_invoices_updated_at();

COMMENT ON TABLE outstanding_invoices IS 'جدول لتتبع الفواتير والمبالغ المستحقة على العملاء';