
-- Add new columns to rental_contracts table for early termination management
ALTER TABLE rental_contracts 
ADD COLUMN minimum_rental_period INTEGER DEFAULT 90,
ADD COLUMN early_termination_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN termination_policy VARCHAR(50) DEFAULT 'standard',
ADD COLUMN can_terminate_early BOOLEAN DEFAULT true;

-- Create early_termination_requests table
CREATE TABLE early_termination_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES rental_contracts(id),
  customer_id UUID NOT NULL,
  requested_termination_date DATE NOT NULL,
  termination_reason TEXT,
  calculated_charges NUMERIC(10,2) NOT NULL,
  early_termination_fee NUMERIC(10,2) DEFAULT 0,
  total_amount_due NUMERIC(10,2) NOT NULL,
  payment_option VARCHAR(20) NOT NULL CHECK (payment_option IN ('immediate', 'manager_approval')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  manager_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on early_termination_requests
ALTER TABLE early_termination_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for early termination requests
CREATE POLICY "Authenticated users can manage early termination requests" 
ON early_termination_requests 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add notification templates for early termination
INSERT INTO notification_templates (name, category, type, templates, required_variables, default_priority, default_channels)
VALUES 
(
  'early_termination_request',
  'contract',
  'early_termination',
  '{"ar": {"title": "طلب إلغاء عقد مبكر", "message": "تم تقديم طلب إلغاء مبكر للعقد رقم {contract_number} من العميل {customer_name}"}, "en": {"title": "Early Contract Termination Request", "message": "Early termination request submitted for contract {contract_number} by {customer_name}"}}'::jsonb,
  ARRAY['contract_number', 'customer_name'],
  'high',
  ARRAY['in_app', 'email']
),
(
  'contract_expiry_warning',
  'contract',
  'expiry_warning',
  '{"ar": {"title": "تحذير انتهاء عقد", "message": "العقد رقم {contract_number} سينتهي في {days_remaining} أيام"}, "en": {"title": "Contract Expiry Warning", "message": "Contract {contract_number} will expire in {days_remaining} days"}}'::jsonb,
  ARRAY['contract_number', 'days_remaining'],
  'medium',
  ARRAY['in_app', 'email']
),
(
  'overdue_payment_reminder',
  'payment',
  'overdue_reminder',
  '{"ar": {"title": "تذكير دفعة متأخرة", "message": "لديك دفعة متأخرة بمبلغ {amount} ريال للعقد رقم {contract_number}"}, "en": {"title": "Overdue Payment Reminder", "message": "You have an overdue payment of {amount} SAR for contract {contract_number}"}}'::jsonb,
  ARRAY['amount', 'contract_number'],
  'high',
  ARRAY['in_app', 'email', 'sms']
);

-- Create trigger to update updated_at column
CREATE TRIGGER update_early_termination_requests_updated_at
  BEFORE UPDATE ON early_termination_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
