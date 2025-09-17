-- Fix security issue: Remove the view that exposes auth.users data
-- Instead, we'll ensure email is stored in profiles table

-- First, drop the problematic view
DROP VIEW IF EXISTS public.pending_users;

-- Add email column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Update the handle_new_user function to also store email in profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Create a secure view for pending users that doesn't expose auth.users
CREATE VIEW public.pending_users_secure AS
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.email,
  p.user_type,
  p.approval_status,
  p.created_at,
  CASE
    WHEN p.user_type = 'employee' THEN 'موظف'
    WHEN p.user_type = 'owner' THEN 'مالك مركبة'
    WHEN p.user_type = 'partner' THEN 'شريك'
    ELSE p.user_type
  END AS user_type_display
FROM public.profiles p
WHERE p.approval_status = 'pending'
ORDER BY p.created_at DESC;

-- Enable RLS on the new view (inherits from profiles table RLS)
-- No need to set RLS policies as it inherits from profiles table

-- Update existing profiles with email from auth.users (one-time migration)
UPDATE public.profiles 
SET email = au.email
FROM auth.users au
WHERE profiles.id = au.id 
  AND profiles.email IS NULL;