-- إضافة دالة لمسح المحاولات الفاشلة
CREATE OR REPLACE FUNCTION public.clear_failed_login_attempts(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- حذف جميع المحاولات الفاشلة للبريد الإلكتروني المحدد
  DELETE FROM public.failed_login_attempts 
  WHERE email = p_email;
  
  -- حذف المحاولات من نفس IP إذا كانت مرتبطة بنفس البريد
  DELETE FROM public.failed_login_attempts
  WHERE ip_address IN (
    SELECT DISTINCT ip_address 
    FROM public.failed_login_attempts 
    WHERE email = p_email
  );
  
  RETURN true;
END;
$function$;