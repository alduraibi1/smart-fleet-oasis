-- تحسين trigger لتسجيل نوع المقبوض (وديعة أو دفعة إيجار)
CREATE OR REPLACE FUNCTION public.create_receipt_for_contract()
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
      'deposit',  -- نوع المقبوض: وديعة ضمان
      'confirmed',
      auth.uid(),
      'سند قبض وديعة ضمان - العقد رقم ' || NEW.contract_number
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;