
-- إضافة قيد UNIQUE على رقم الهاتف في جدول العملاء
ALTER TABLE public.customers 
ADD CONSTRAINT customers_phone_unique UNIQUE (phone);

-- التأكد من وجود قيود UNIQUE على أرقام اللوحات و VIN (إذا لم تكن موجودة)
DO $$ 
BEGIN
  -- التحقق وإضافة قيد على plate_number إذا لم يكن موجوداً
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'vehicles_plate_number_unique'
  ) THEN
    ALTER TABLE public.vehicles 
    ADD CONSTRAINT vehicles_plate_number_unique UNIQUE (plate_number);
  END IF;

  -- التحقق وإضافة قيد على vin إذا لم يكن موجوداً
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'vehicles_vin_unique'
  ) THEN
    ALTER TABLE public.vehicles 
    ADD CONSTRAINT vehicles_vin_unique UNIQUE (vin);
  END IF;
END $$;

-- إنشاء دالة للتحقق من تكرار رقم الهاتف
CREATE OR REPLACE FUNCTION check_phone_duplicate(p_phone text, p_exclude_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers 
    WHERE phone = p_phone 
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
  );
END;
$$;

-- إنشاء دالة للتحقق من تكرار رقم اللوحة
CREATE OR REPLACE FUNCTION check_plate_duplicate(p_plate_number text, p_exclude_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vehicles 
    WHERE plate_number = p_plate_number 
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
  );
END;
$$;

-- إنشاء دالة للتحقق من تكرار VIN
CREATE OR REPLACE FUNCTION check_vin_duplicate(p_vin text, p_exclude_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vehicles 
    WHERE vin = p_vin 
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
  );
END;
$$;
