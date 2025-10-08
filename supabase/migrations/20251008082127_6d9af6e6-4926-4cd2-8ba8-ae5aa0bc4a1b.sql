-- المرحلة 1: توسيع جدول system_settings لبيانات الشركة والطباعة

-- إضافة الحقول الجديدة لجدول system_settings
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS commercial_registration VARCHAR(50),
ADD COLUMN IF NOT EXISTS license_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_iban VARCHAR(50),
ADD COLUMN IF NOT EXISTS contract_terms TEXT,
ADD COLUMN IF NOT EXISTS vat_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vat_percentage NUMERIC(5,2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS company_seal_url TEXT;

-- تحديث القيم الافتراضية للبيانات الرسمية
UPDATE public.system_settings 
SET 
  commercial_registration = '4030175252',
  license_number = '38/00006704',
  contract_terms = 'لم يتم إضافة بنود العقد بعد. يمكنك إضافتها من إعدادات الشركة.'
WHERE commercial_registration IS NULL;

-- إضافة حقل vat_included لجدول rental_contracts
ALTER TABLE public.rental_contracts
ADD COLUMN IF NOT EXISTS vat_included BOOLEAN DEFAULT false;

-- إضافة حقول لتخزين مسارات PDF المُولدة
ALTER TABLE public.rental_contracts
ADD COLUMN IF NOT EXISTS contract_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS handover_form_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS return_form_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS tax_invoice_pdf_url TEXT;

-- إنشاء bucket للمستندات (سيتم تنفيذه من التطبيق)
-- company-documents bucket سيتم إنشاؤه في Storage

COMMENT ON COLUMN public.system_settings.commercial_registration IS 'السجل التجاري للشركة';
COMMENT ON COLUMN public.system_settings.license_number IS 'رقم الترخيص';
COMMENT ON COLUMN public.system_settings.bank_name IS 'اسم البنك';
COMMENT ON COLUMN public.system_settings.bank_iban IS 'رقم الحساب البنكي IBAN';
COMMENT ON COLUMN public.system_settings.contract_terms IS 'بنود وشروط العقد القابلة للتعديل';
COMMENT ON COLUMN public.system_settings.vat_enabled IS 'تفعيل الضريبة افتراضياً';
COMMENT ON COLUMN public.system_settings.vat_percentage IS 'نسبة ضريبة القيمة المضافة';
COMMENT ON COLUMN public.system_settings.company_logo_url IS 'رابط شعار الشركة في Storage';
COMMENT ON COLUMN public.system_settings.company_seal_url IS 'رابط ختم الشركة في Storage';
COMMENT ON COLUMN public.rental_contracts.vat_included IS 'هل العقد شامل للضريبة';
COMMENT ON COLUMN public.rental_contracts.contract_pdf_url IS 'رابط ملف PDF للعقد';
COMMENT ON COLUMN public.rental_contracts.handover_form_pdf_url IS 'رابط نموذج استلام المركبة PDF';
COMMENT ON COLUMN public.rental_contracts.return_form_pdf_url IS 'رابط نموذج تسليم المركبة PDF';
COMMENT ON COLUMN public.rental_contracts.tax_invoice_pdf_url IS 'رابط الفاتورة الضريبية PDF';