
-- 1) Enum لنوع المستخدم وإضافته للملف الشخصي
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_profile_type') THEN
    CREATE TYPE public.user_profile_type AS ENUM ('employee','owner','partner');
  END IF;
END$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type public.user_profile_type NOT NULL DEFAULT 'employee';

-- 2) التأكد من وجود دور 'owner' في enum الأدوار
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'owner'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'owner';
  END IF;
END$$;

-- 3) فهرس فريد على اسم الصلاحية لتجنّب التكرار
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'permissions_name_unique'
  ) THEN
    CREATE UNIQUE INDEX permissions_name_unique ON public.permissions (name);
  END IF;
END$$;

-- 4) حقن/استكمال قائمة الصلاحيات الأساسية
WITH perms(name, module, action, description) AS (
  VALUES
  -- dashboard
  ('dashboard.read','dashboard','read','View dashboard'),
  ('dashboard.write','dashboard','write','Modify dashboard widgets'),
  ('dashboard.delete','dashboard','delete','Remove dashboard items'),

  -- vehicles
  ('vehicles.read','vehicles','read','View vehicles'),
  ('vehicles.write','vehicles','write','Create or edit vehicles'),
  ('vehicles.delete','vehicles','delete','Delete vehicles'),

  -- contracts
  ('contracts.read','contracts','read','View contracts'),
  ('contracts.write','contracts','write','Create or edit contracts'),
  ('contracts.delete','contracts','delete','Delete contracts'),

  -- customers
  ('customers.read','customers','read','View customers'),
  ('customers.write','customers','write','Create or edit customers'),
  ('customers.delete','customers','delete','Delete customers'),

  -- maintenance
  ('maintenance.read','maintenance','read','View maintenance'),
  ('maintenance.write','maintenance','write','Create or edit maintenance'),
  ('maintenance.delete','maintenance','delete','Delete maintenance'),

  -- inventory
  ('inventory.read','inventory','read','View inventory'),
  ('inventory.write','inventory','write','Create or edit inventory'),
  ('inventory.delete','inventory','delete','Delete inventory'),

  -- accounting
  ('accounting.read','accounting','read','View accounting'),
  ('accounting.write','accounting','write','Create or edit accounting'),
  ('accounting.delete','accounting','delete','Delete accounting'),

  -- reports
  ('reports.read','reports','read','View reports'),
  ('reports.write','reports','write','Create or edit reports'),
  ('reports.delete','reports','delete','Delete reports'),

  -- system
  ('system.read','system','read','View system settings'),
  ('system.write','system','write','Modify system settings'),
  ('system.delete','system','delete','Delete system resources'),

  -- admin
  ('admin.system','admin','system','System administration'),
  ('admin.security','admin','security','Security administration'),
  ('admin.users','admin','users','User administration')
)
INSERT INTO public.permissions (name, module, action, description)
SELECT p.name, p.module, p.action, p.description
FROM perms p
WHERE NOT EXISTS (SELECT 1 FROM public.permissions x WHERE x.name = p.name);

-- 5) ربط الأدوار بالصلاحيات (إضافة فقط ما ينقص)
-- ملاحظة: جدول role_permissions يفترض أعمدته: role (app_role), permission_id (uuid)
-- admin → كل الصلاحيات
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::public.app_role, p.id
FROM public.permissions p
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'admin'::public.app_role AND rp.permission_id = p.id
);

-- manager → read للجميع + write لبعض الوحدات + reports.read
WITH manager_perms AS (
  SELECT id FROM public.permissions WHERE name IN (
    'dashboard.read',
    'vehicles.read','vehicles.write',
    'customers.read','customers.write',
    'maintenance.read','maintenance.write',
    'inventory.read',
    'reports.read'
  )
  UNION
  SELECT id FROM public.permissions WHERE module IN ('contracts','accounting','system') AND action = 'read'
)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager'::public.app_role, mp.id
FROM manager_perms mp
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'manager'::public.app_role AND rp.permission_id = mp.id
);

-- accountant → accounting.* + reports.read
WITH accountant_perms AS (
  SELECT id FROM public.permissions WHERE module = 'accounting'
  UNION
  SELECT id FROM public.permissions WHERE name = 'reports.read'
)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'accountant'::public.app_role, ap.id
FROM accountant_perms ap
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'accountant'::public.app_role AND rp.permission_id = ap.id
);

-- employee → صلاحيات أساسية
WITH employee_perms AS (
  SELECT id FROM public.permissions WHERE name IN (
    'dashboard.read','customers.read','vehicles.read','maintenance.read'
  )
)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'employee'::public.app_role, ep.id
FROM employee_perms ep
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'employee'::public.app_role AND rp.permission_id = ep.id
);

-- owner → عرض المركبات والتقارير (سيتم لاحقًا تضييق البيانات عبر RLS وربط المالك)
WITH owner_perms AS (
  SELECT id FROM public.permissions WHERE name IN ('vehicles.read','reports.read')
)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'owner'::public.app_role, op.id
FROM owner_perms op
WHERE NOT EXISTS (
  SELECT 1 FROM public.role_permissions rp 
  WHERE rp.role = 'owner'::public.app_role AND rp.permission_id = op.id
);

-- 6) تحديث دالة handle_new_user لتخزين user_type وتعيين الدور تلقائيًا + إشعار للأدمن
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_type_text text;
  user_type_val public.user_profile_type;
  assign_role public.app_role;
BEGIN
  -- التقاط نوع المستخدم من بيانات التسجيل
  user_type_text := COALESCE(NEW.raw_user_meta_data->>'user_type', 'employee');

  IF user_type_text NOT IN ('employee','owner','partner') THEN
    user_type_text := 'employee';
  END IF;

  user_type_val := user_type_text::public.user_profile_type;

  -- إضافة/تحديث الملف الشخصي
  INSERT INTO public.profiles (id, full_name, phone, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    user_type_val
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      user_type = EXCLUDED.user_type;

  -- تعيين الدور الافتراضي حسب نوع المستخدم
  assign_role := CASE user_type_text
    WHEN 'owner' THEN 'owner'::public.app_role
    ELSE 'employee'::public.app_role
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assign_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- إشعار الأدمن بتسجيل مستخدم جديد
  PERFORM public.create_smart_notification(
    p_title := 'تسجيل مستخدم جديد',
    p_message := 'تم تسجيل مستخدم جديد من نوع: ' || user_type_text,
    p_type := 'info',
    p_category := 'users',
    p_priority := 'high',
    p_reference_type := 'user',
    p_reference_id := NEW.id,
    p_reference_data := jsonb_build_object('email', NEW.email, 'user_type', user_type_text),
    p_user_id := NULL,
    p_target_roles := ARRAY['admin']::text[],
    p_action_required := false,
    p_scheduled_for := now(),
    p_delivery_channels := ARRAY['in_app']::text[]
  );

  RETURN NEW;
END;
$function$;

-- 7) تأكيد وجود المشغل على auth.users (إن لم يكن موجودًا)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END$$;

-- 8) ترقية السجلات الحالية بدون user_type إلى employee (الحقل لديه افتراضي بالفعل)
UPDATE public.profiles
SET user_type = 'employee'::public.user_profile_type
WHERE user_type IS NULL;
