-- تحديث حالة المستخدم وجعله مدير النظام
UPDATE profiles 
SET 
  approval_status = 'approved',
  approved_by = '4f8a2cf3-5b13-4f1b-a69d-e0e5e9ed952d',
  approved_at = now()
WHERE id = '4f8a2cf3-5b13-4f1b-a69d-e0e5e9ed952d';

-- تحديث دور المستخدم إلى مدير النظام
UPDATE user_roles 
SET role = 'admin'
WHERE user_id = '4f8a2cf3-5b13-4f1b-a69d-e0e5e9ed952d';

-- إنشاء إشعار للمستخدم بأنه أصبح مدير النظام
INSERT INTO smart_notifications (
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
  'مرحباً بك كمدير النظام',
  'تم منحك صلاحيات مدير النظام. يمكنك الآن الوصول لجميع وظائف النظام وإدارة المستخدمين.',
  'success',
  'users',
  'high',
  'user_promotion',
  '4f8a2cf3-5b13-4f1b-a69d-e0e5e9ed952d',
  '4f8a2cf3-5b13-4f1b-a69d-e0e5e9ed952d',
  ARRAY['in_app']::text[]
);