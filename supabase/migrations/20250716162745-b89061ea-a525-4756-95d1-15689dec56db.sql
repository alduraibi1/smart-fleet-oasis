-- إضافة سياسات الأمان للجداول الجديدة

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_transactions ENABLE ROW LEVEL SECURITY;

-- سياسات سندات القبض
CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة سندات القبض" 
ON public.payment_receipts 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- سياسات سندات الصرف  
CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة سندات الصرف" 
ON public.payment_vouchers 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- سياسات سندات الخصم
CREATE POLICY "المستخدمون المسجلون يمكنهم إدارة سندات الخصم" 
ON public.discount_vouchers 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- سياسات المعاملات المحاسبية
CREATE POLICY "المستخدمون المسجلون يمكنهم عرض المعاملات المحاسبية" 
ON public.accounting_transactions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المسجلون يمكنهم إضافة المعاملات المحاسبية" 
ON public.accounting_transactions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- دالة لإنشاء سند قبض تلقائي عند إنشاء عقد
CREATE OR REPLACE FUNCTION create_receipt_for_contract()
RETURNS TRIGGER AS $$
BEGIN
  -- إنشاء سند قبض فقط إذا كان العقد يحتوي على مبلغ مدفوع
  IF NEW.paid_amount > 0 THEN
    INSERT INTO payment_receipts (
      receipt_number,
      contract_id,
      customer_id,
      customer_name,
      vehicle_id,
      amount,
      payment_method,
      payment_date,
      receipt_type,
      status,
      issued_by,
      notes
    ) VALUES (
      generate_receipt_number(),
      NEW.id,
      NEW.customer_id,
      (SELECT name FROM customers WHERE id = NEW.customer_id),
      NEW.vehicle_id,
      NEW.paid_amount,
      COALESCE(NEW.payment_method, 'cash'),
      NEW.start_date,
      'rental_payment',
      'confirmed',
      auth.uid(),
      'سند قبض تلقائي من العقد رقم ' || NEW.contract_number
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لإنشاء سند صرف تلقائي عند إتمام الصيانة
CREATE OR REPLACE FUNCTION create_voucher_for_maintenance()
RETURNS TRIGGER AS $$
BEGIN
  -- إنشاء سند صرف عند إتمام الصيانة وتحديد التكلفة
  IF NEW.status = 'completed' AND NEW.total_cost > 0 AND OLD.status != 'completed' THEN
    INSERT INTO payment_vouchers (
      voucher_number,
      recipient_type,
      recipient_name,
      amount,
      payment_method,
      payment_date,
      expense_category,
      expense_type,
      vehicle_id,
      maintenance_id,
      description,
      status,
      requested_by,
      issued_by
    ) VALUES (
      generate_voucher_number(),
      'supplier',
      COALESCE((SELECT name FROM mechanics WHERE id = NEW.mechanic_id), 'ورشة صيانة'),
      NEW.total_cost,
      'cash',
      CURRENT_DATE,
      'maintenance',
      'operational',
      NEW.vehicle_id,
      NEW.id,
      'صرف تكلفة صيانة - ' || NEW.maintenance_type,
      'pending_approval',
      auth.uid(),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لحساب حصة المالك وإنشاء سند صرف
CREATE OR REPLACE FUNCTION create_owner_commission_voucher()
RETURNS TRIGGER AS $$
DECLARE
  owner_rec RECORD;
  commission_amount DECIMAL(12,2);
BEGIN
  -- الحصول على معلومات المالك
  SELECT vo.*, v.owner_id 
  INTO owner_rec
  FROM vehicle_owners vo
  JOIN vehicles v ON v.owner_id = vo.id
  WHERE v.id = NEW.vehicle_id;
  
  -- حساب حصة المالك
  IF owner_rec.commission_rate > 0 THEN
    commission_amount := NEW.amount * (owner_rec.commission_rate / 100);
    
    -- إنشاء سند صرف للمالك
    INSERT INTO payment_vouchers (
      voucher_number,
      recipient_type,
      recipient_id,
      recipient_name,
      amount,
      payment_method,
      payment_date,
      expense_category,
      expense_type,
      vehicle_id,
      contract_id,
      description,
      status,
      requested_by,
      issued_by
    ) VALUES (
      generate_voucher_number(),
      'owner',
      owner_rec.id,
      owner_rec.name,
      commission_amount,
      'bank_transfer',
      CURRENT_DATE,
      'owner_commission',
      'operational',
      NEW.vehicle_id,
      NEW.contract_id,
      'حصة المالك من إيجار المركبة ' || NEW.plate_number,
      'pending_approval',
      auth.uid(),
      auth.uid()
    );
    
    -- تحديث إجمالي العمولة المستحقة للمالك
    UPDATE vehicle_owners 
    SET pending_commission = COALESCE(pending_commission, 0) + commission_amount,
        total_commission = COALESCE(total_commission, 0) + commission_amount
    WHERE id = owner_rec.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء المشغلات
CREATE TRIGGER trigger_create_receipt_for_contract
  AFTER INSERT ON rental_contracts
  FOR EACH ROW
  EXECUTE FUNCTION create_receipt_for_contract();

CREATE TRIGGER trigger_create_voucher_for_maintenance
  AFTER UPDATE ON vehicle_maintenance
  FOR EACH ROW
  EXECUTE FUNCTION create_voucher_for_maintenance();

CREATE TRIGGER trigger_create_owner_commission
  AFTER INSERT ON payment_receipts
  FOR EACH ROW
  WHEN (NEW.receipt_type = 'rental_payment')
  EXECUTE FUNCTION create_owner_commission_voucher();