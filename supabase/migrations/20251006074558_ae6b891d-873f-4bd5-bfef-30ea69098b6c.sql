-- إضافة أعمدة جديدة لجدول vehicle_owners
ALTER TABLE public.vehicle_owners
ADD COLUMN IF NOT EXISTS owner_type VARCHAR(20) DEFAULT 'individual' CHECK (owner_type IN ('individual', 'company')),
ADD COLUMN IF NOT EXISTS commercial_registration VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50);

-- إضافة فهرس للسجل التجاري
CREATE INDEX IF NOT EXISTS idx_vehicle_owners_commercial_registration ON public.vehicle_owners(commercial_registration) WHERE commercial_registration IS NOT NULL;

-- إضافة فهرس للرقم الضريبي
CREATE INDEX IF NOT EXISTS idx_vehicle_owners_tax_number ON public.vehicle_owners(tax_number) WHERE tax_number IS NOT NULL;

-- دالة للتحقق من تكرار السجل التجاري
CREATE OR REPLACE FUNCTION public.check_commercial_registration_duplicate(
  p_commercial_registration TEXT,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vehicle_owners 
    WHERE commercial_registration = p_commercial_registration
    AND owner_type = 'company'
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
  );
END;
$$;

-- دالة للتحقق من تكرار الرقم الضريبي
CREATE OR REPLACE FUNCTION public.check_tax_number_duplicate(
  p_tax_number TEXT,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vehicle_owners 
    WHERE tax_number = p_tax_number
    AND owner_type = 'company'
    AND (p_exclude_id IS NULL OR id != p_exclude_id)
  );
END;
$$;