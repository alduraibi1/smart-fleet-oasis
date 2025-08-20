
-- 1) إنشاء جدول nationalities لإدارة الجنسيات القابلة للتخصيص
CREATE TABLE IF NOT EXISTS public.nationalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,                         -- مثال: SA, RES, EG, IN ...
  name_ar TEXT NOT NULL,                             -- الاسم بالعربية
  name_en TEXT,                                      -- الاسم بالإنجليزية
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 100,             -- لترتيب الظهور
  id_prefix TEXT,                                    -- بادئة رقم الهوية/الإقامة (مثال: '1' للسعودي، '2' لغير السعودي)
  id_length INTEGER DEFAULT 10,                      -- طول رقم الهوية/الإقامة الافتراضي
  id_validation_regex TEXT,                          -- تعبير منتظم اختياري للتحقق المتقدم
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) تفعيل RLS على جدول nationalities
ALTER TABLE public.nationalities ENABLE ROW LEVEL SECURITY;

-- سياسة الاطلاع: جميع المستخدمين المصدقين يمكنهم القراءة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'nationalities' AND policyname = 'Authenticated users can view nationalities'
  ) THEN
    CREATE POLICY "Authenticated users can view nationalities"
      ON public.nationalities
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END$$;

-- سياسة الإدارة: المدراء أو المشرفون فقط يمكنهم الإضافة/التعديل/الحذف
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'nationalities' AND policyname = 'Admins or managers can manage nationalities'
  ) THEN
    CREATE POLICY "Admins or managers can manage nationalities"
      ON public.nationalities
      FOR ALL
      USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
      WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
  END IF;
END$$;

-- 3) تريغر تحديث حقل updated_at عند أي تعديل
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_nationalities_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_nationalities_set_updated_at
      BEFORE UPDATE ON public.nationalities
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 4) تعبئة بيانات افتراضية للجنسيات مع قواعد التحقق الأساسية
-- SA: سعودي يبدأ بـ 1
-- RES: غير سعودي/إقامة يبدأ بـ 2
INSERT INTO public.nationalities (code, name_ar, name_en, is_active, priority, id_prefix, id_length, id_validation_regex)
SELECT 'SA', 'سعودي', 'Saudi', TRUE, 1, '1', 10, '^[1][0-9]{9}$'
WHERE NOT EXISTS (SELECT 1 FROM public.nationalities WHERE code = 'SA');

INSERT INTO public.nationalities (code, name_ar, name_en, is_active, priority, id_prefix, id_length, id_validation_regex)
SELECT 'RES', 'غير سعودي', 'Resident/Non-Saudi', TRUE, 2, '2', 10, '^[2][0-9]{9}$'
WHERE NOT EXISTS (SELECT 1 FROM public.nationalities WHERE code = 'RES');

-- يمكن إضافة جنسيات شائعة أخرى مع نفس قاعدة الطول، ويُترك id_prefix فارغاً لتطبيق قواعد مخصصة لاحقاً
INSERT INTO public.nationalities (code, name_ar, name_en, is_active, priority, id_length)
SELECT 'EG', 'مصري', 'Egyptian', TRUE, 10, 10
WHERE NOT EXISTS (SELECT 1 FROM public.nationalities WHERE code = 'EG');

INSERT INTO public.nationalities (code, name_ar, name_en, is_active, priority, id_length)
SELECT 'IN', 'هندي', 'Indian', TRUE, 11, 10
WHERE NOT EXISTS (SELECT 1 FROM public.nationalities WHERE code = 'IN');

-- 5) إضافة حقول جهة الاتصال للطوارئ إلى جدول العملاء (customers)
-- هذه الحقول مستخدمة بالفعل في طبقة الواجهة وأنواع TypeScript، ونضيفها الآن في قاعدة البيانات لضمان التوافق
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT;

-- 6) (اختياري) إعداد افتراضي في system_settings لتفعيل استخدام جدول الجنسيات وترتيبها حسب الأولوية
-- لن ننشئ تعارضات إذا كان الإعداد موجوداً مسبقاً
INSERT INTO public.system_settings (setting_key, setting_value, is_active, description)
SELECT 
  'nationalities_config',
  jsonb_build_object(
    'use_priority', true,
    'default_code', 'SA',
    'allow_custom_add', true,
    'validation_mode', 'prefix_or_regex'  -- prefix=SA:1, RES:2، وإلا regex إن وجد
  ),
  TRUE,
  'إعدادات نظام الجنسيات القابل للتخصيص'
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings WHERE setting_key = 'nationalities_config');
