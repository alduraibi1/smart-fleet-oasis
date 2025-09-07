-- تحديث جدول الملفات الشخصية ليدعم نوع المستخدم وحالة الموافقة
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- تحديث دالة التعامل مع المستخدم الجديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone,
    user_type,
    approval_status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'employee'),
    'pending'
  );
  
  -- إضافة دور افتراضي مؤقت للمستخدمين الجدد (سيتم تحديثه عند الموافقة)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  -- إنشاء إشعار للإداريين بوجود طلب تسجيل جديد
  INSERT INTO public.smart_notifications (
    title,
    message,
    type,
    category,
    priority,
    reference_type,
    reference_id,
    target_roles,
    delivery_channels
  ) VALUES (
    'طلب تسجيل جديد',
    'مستخدم جديد (' || COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || ') قام بطلب التسجيل كـ ' || COALESCE(NEW.raw_user_meta_data->>'user_type', 'employee'),
    'info',
    'users',
    'medium',
    'user_registration',
    NEW.id,
    ARRAY['admin', 'manager']::text[],
    ARRAY['in_app']::text[]
  );
  
  RETURN NEW;
END;
$$;

-- إنشاء view لعرض طلبات التسجيل المعلقة
CREATE OR REPLACE VIEW public.pending_users AS
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.user_type,
  p.approval_status,
  p.created_at,
  au.email,
  au.email_confirmed_at,
  CASE 
    WHEN p.user_type = 'employee' THEN 'موظف'
    WHEN p.user_type = 'owner' THEN 'مالك مركبة' 
    WHEN p.user_type = 'partner' THEN 'شريك'
    ELSE p.user_type
  END as user_type_display
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.approval_status = 'pending'
ORDER BY p.created_at DESC;

-- إنشاء دالة للموافقة على المستخدمين
CREATE OR REPLACE FUNCTION public.approve_user_registration(
  p_user_id UUID,
  p_approved_by UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_data RECORD;
  default_role app_role;
BEGIN
  -- الحصول على بيانات المستخدم
  SELECT * INTO user_data 
  FROM public.profiles 
  WHERE id = p_user_id AND approval_status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'المستخدم غير موجود أو تمت الموافقة عليه مسبقاً');
  END IF;
  
  -- تحديد الدور الافتراضي بناءً على نوع المستخدم
  default_role := CASE user_data.user_type
    WHEN 'owner' THEN 'employee'::app_role  -- سيتم تحديثه لاحقاً عند إضافة دور المالك
    WHEN 'partner' THEN 'manager'::app_role
    ELSE 'employee'::app_role
  END;
  
  -- تحديث حالة الموافقة
  UPDATE public.profiles 
  SET 
    approval_status = 'approved',
    approved_by = p_approved_by,
    approved_at = now()
  WHERE id = p_user_id;
  
  -- تحديث الدور
  UPDATE public.user_roles 
  SET role = default_role
  WHERE user_id = p_user_id;
  
  -- إنشاء إشعار للمستخدم بالموافقة
  INSERT INTO public.smart_notifications (
    title,
    message,
    type,
    category,
    priority,
    reference_type,
    reference_id,
    user_id,
    delivery_channels
  ) VALUES (
    'تم قبول طلب التسجيل',
    'مرحباً بك! تم قبول طلب التسجيل الخاص بك ويمكنك الآن الوصول للنظام',
    'success',
    'users',
    'high',
    'user_approval',
    p_user_id,
    p_user_id,
    ARRAY['in_app']::text[]
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'تم قبول المستخدم بنجاح');
END;
$$;

-- إنشاء دالة لرفض المستخدمين
CREATE OR REPLACE FUNCTION public.reject_user_registration(
  p_user_id UUID,
  p_rejection_reason TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- تحديث حالة الرفض
  UPDATE public.profiles 
  SET 
    approval_status = 'rejected',
    rejection_reason = p_rejection_reason
  WHERE id = p_user_id AND approval_status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'المستخدم غير موجود أو تمت معالجة طلبه مسبقاً');
  END IF;
  
  -- إنشاء إشعار للمستخدم بالرفض
  INSERT INTO public.smart_notifications (
    title,
    message,
    type,
    category,
    priority,
    reference_type,
    reference_id,
    user_id,
    delivery_channels
  ) VALUES (
    'تم رفض طلب التسجيل',
    'نأسف، تم رفض طلب التسجيل الخاص بك. السبب: ' || p_rejection_reason,
    'warning',
    'users',
    'high',
    'user_rejection',
    p_user_id,
    p_user_id,
    ARRAY['in_app']::text[]
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'تم رفض المستخدم');
END;
$$;