-- إضافة 'users' إلى قيم category المسموحة في جدول smart_notifications
ALTER TABLE public.smart_notifications 
DROP CONSTRAINT IF EXISTS smart_notifications_category_check;

-- إنشاء constraint جديد يشمل 'users'
ALTER TABLE public.smart_notifications 
ADD CONSTRAINT smart_notifications_category_check 
CHECK (category IN (
  'contract_expiry', 
  'payment_due', 
  'vehicle_return', 
  'maintenance', 
  'system', 
  'customer_rating', 
  'document_expiry', 
  'users',
  'security',
  'vehicles'
));

-- تحديث دالة handle_new_user لاستخدام category صحيح
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone,
    email,
    user_type,
    approval_status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.email,
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
$function$;