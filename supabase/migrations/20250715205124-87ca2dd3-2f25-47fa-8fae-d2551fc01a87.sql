-- إصلاح أمان وظائف قاعدة البيانات وإضافة search_path آمن
-- تحديث وظيفة has_role لجعلها أكثر أماناً
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$function$;

-- تحديث وظيفة has_permission لجعلها أكثر أماناً
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
    AND p.name = _permission_name
  )
$function$;

-- تحديث وظيفة get_user_roles لجعلها أكثر أماناً
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS app_role[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT ARRAY_AGG(role)
  FROM public.user_roles
  WHERE user_id = _user_id
$function$;

-- تحديث وظيفة handle_new_user لجعلها أكثر أماناً
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- إضافة دور موظف افتراضياً للمستخدمين الجدد
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  RETURN NEW;
END;
$function$;

-- تحديث وظيفة create_smart_notification لجعلها أكثر أماناً
CREATE OR REPLACE FUNCTION public.create_smart_notification(
  p_title text, 
  p_message text, 
  p_type character varying DEFAULT 'info'::character varying, 
  p_category character varying DEFAULT 'system'::character varying, 
  p_priority character varying DEFAULT 'medium'::character varying, 
  p_reference_type character varying DEFAULT NULL::character varying, 
  p_reference_id uuid DEFAULT NULL::uuid, 
  p_reference_data jsonb DEFAULT NULL::jsonb, 
  p_user_id uuid DEFAULT NULL::uuid, 
  p_target_roles text[] DEFAULT NULL::text[], 
  p_action_required boolean DEFAULT false, 
  p_scheduled_for timestamp with time zone DEFAULT now(), 
  p_delivery_channels text[] DEFAULT ARRAY['in_app'::text]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  -- التحقق من صحة المدخلات
  IF p_title IS NULL OR LENGTH(TRIM(p_title)) = 0 THEN
    RAISE EXCEPTION 'عنوان الإشعار مطلوب';
  END IF;
  
  IF p_message IS NULL OR LENGTH(TRIM(p_message)) = 0 THEN
    RAISE EXCEPTION 'نص الإشعار مطلوب';
  END IF;
  
  INSERT INTO smart_notifications (
    title, message, type, category, priority,
    reference_type, reference_id, reference_data,
    user_id, target_roles, action_required,
    scheduled_for, delivery_channels
  ) VALUES (
    p_title, p_message, p_type, p_category, p_priority,
    p_reference_type, p_reference_id, p_reference_data,
    p_user_id, p_target_roles, p_action_required,
    p_scheduled_for, p_delivery_channels
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- إضافة وظيفة لتنظيف البيانات الحساسة من السجلات القديمة
CREATE OR REPLACE FUNCTION public.cleanup_old_activity_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- حذف سجلات النشاط الأقدم من 6 أشهر
  DELETE FROM public.activity_logs 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- حذف إشعارات النظام القديمة (أقدم من 3 أشهر)
  DELETE FROM public.smart_notifications 
  WHERE created_at < NOW() - INTERVAL '3 months' 
  AND category = 'system' 
  AND status IN ('read', 'dismissed');
END;
$function$;

-- إضافة وظيفة للتحقق من قوة كلمة المرور
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- التحقق من الطول الأدنى
  IF LENGTH(password_text) < 8 THEN
    errors := array_append(errors, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  END IF;
  
  -- التحقق من وجود أحرف كبيرة
  IF password_text !~ '[A-Z]' THEN
    errors := array_append(errors, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
  END IF;
  
  -- التحقق من وجود أحرف صغيرة
  IF password_text !~ '[a-z]' THEN
    errors := array_append(errors, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
  END IF;
  
  -- التحقق من وجود أرقام
  IF password_text !~ '[0-9]' THEN
    errors := array_append(errors, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  END IF;
  
  -- التحقق من وجود رموز خاصة
  IF password_text !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل');
  END IF;
  
  -- تحديث النتيجة
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  END IF;
  
  RETURN result;
END;
$function$;

-- إضافة جدول لتتبع محاولات تسجيل الدخول الفاشلة
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet,
  email text,
  attempt_time timestamp with time zone DEFAULT now(),
  user_agent text,
  blocked_until timestamp with time zone
);

-- تفعيل RLS على جدول محاولات تسجيل الدخول الفاشلة
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة RLS لجدول محاولات تسجيل الدخول الفاشلة
CREATE POLICY "Only system can manage failed login attempts" ON public.failed_login_attempts
FOR ALL USING (false) WITH CHECK (false);

-- إضافة فهارس لتحسين الأداء والأمان
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip_time 
ON public.failed_login_attempts(ip_address, attempt_time);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email_time 
ON public.failed_login_attempts(email, attempt_time);

-- إضافة وظيفة لتتبع محاولات تسجيل الدخول الفاشلة
CREATE OR REPLACE FUNCTION public.track_failed_login(
  p_ip_address inet,
  p_email text,
  p_user_agent text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  recent_attempts integer;
  block_duration interval;
BEGIN
  -- إدراج محاولة فاشلة جديدة
  INSERT INTO public.failed_login_attempts (ip_address, email, user_agent)
  VALUES (p_ip_address, p_email, p_user_agent);
  
  -- عد المحاولات الفاشلة في آخر 15 دقيقة
  SELECT COUNT(*) INTO recent_attempts
  FROM public.failed_login_attempts
  WHERE ip_address = p_ip_address
  AND attempt_time > NOW() - INTERVAL '15 minutes';
  
  -- تحديد مدة الحظر بناءً على عدد المحاولات
  IF recent_attempts >= 10 THEN
    block_duration := INTERVAL '24 hours';
  ELSIF recent_attempts >= 5 THEN
    block_duration := INTERVAL '1 hour';
  ELSIF recent_attempts >= 3 THEN
    block_duration := INTERVAL '15 minutes';
  ELSE
    block_duration := NULL;
  END IF;
  
  -- تطبيق الحظر إذا لزم الأمر
  IF block_duration IS NOT NULL THEN
    UPDATE public.failed_login_attempts
    SET blocked_until = NOW() + block_duration
    WHERE ip_address = p_ip_address
    AND attempt_time > NOW() - INTERVAL '15 minutes';
    
    RETURN false; -- محظور
  END IF;
  
  RETURN true; -- غير محظور
END;
$function$;

-- إضافة وظيفة للتحقق من حالة الحظر
CREATE OR REPLACE FUNCTION public.is_ip_blocked(p_ip_address inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  is_blocked boolean := false;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM public.failed_login_attempts
    WHERE ip_address = p_ip_address
    AND blocked_until > NOW()
  ) INTO is_blocked;
  
  RETURN is_blocked;
END;
$function$;