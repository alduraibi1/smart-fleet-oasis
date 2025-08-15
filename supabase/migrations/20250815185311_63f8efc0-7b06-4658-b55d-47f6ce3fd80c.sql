
-- المرحلة الثالثة: إدارة الإشعارات الذكية والتنبيهات

-- جدول الإشعارات الذكية المحسن
CREATE TABLE smart_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  category VARCHAR(50) NOT NULL DEFAULT 'system', -- 'system', 'maintenance', 'payment', 'contract', 'financial'
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  -- ربط الإشعار بكيان معين
  reference_type VARCHAR(50), -- 'vehicle', 'customer', 'contract', 'maintenance', 'payment'
  reference_id UUID,
  reference_data JSONB DEFAULT '{}', -- بيانات إضافية للمرجع
  
  -- استهداف المستخدمين
  user_id UUID, -- إشعار لمستخدم محدد
  target_roles TEXT[], -- أو لأدوار معينة ['admin', 'manager', 'employee']
  
  -- خصائص الإشعار
  action_required BOOLEAN DEFAULT false, -- يتطلب إجراء من المستخدم
  action_url TEXT, -- رابط الإجراء المطلوب
  action_label TEXT, -- نص زر الإجراء
  
  -- جدولة الإشعار
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- تاريخ انتهاء صلاحية الإشعار
  
  -- حالة الإشعار
  status VARCHAR(20) NOT NULL DEFAULT 'unread', -- 'unread', 'read', 'dismissed', 'archived'
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- قنوات التوصيل
  delivery_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms', 'push'
  sent_channels TEXT[] DEFAULT '{}', -- القنوات التي تم الإرسال عبرها
  
  -- بيانات إضافية
  metadata JSONB DEFAULT '{}',
  template_id UUID, -- مرجع لقالب الإشعار
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- فهرسة للإشعارات الذكية
CREATE INDEX idx_smart_notifications_user_status ON smart_notifications(user_id, status);
CREATE INDEX idx_smart_notifications_category_priority ON smart_notifications(category, priority);
CREATE INDEX idx_smart_notifications_scheduled ON smart_notifications(scheduled_for) WHERE status = 'unread';
CREATE INDEX idx_smart_notifications_reference ON smart_notifications(reference_type, reference_id);

-- جدول قوالب الإشعارات
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  
  -- القوالب متعددة اللغات
  templates JSONB NOT NULL DEFAULT '{"ar": {"title": "", "message": ""}, "en": {"title": "", "message": ""}}',
  
  -- المتغيرات المطلوبة في القالب
  required_variables TEXT[],
  
  -- إعدادات افتراضية
  default_priority VARCHAR(20) DEFAULT 'medium',
  default_channels TEXT[] DEFAULT ARRAY['in_app'],
  
  -- إعدادات التشغيل التلقائي
  auto_send BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول تفضيلات الإشعارات للمستخدمين
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- إعدادات عامة
  enabled BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  weekend_notifications BOOLEAN DEFAULT true,
  
  -- قنوات التوصيل
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  
  -- تفضيلات حسب الفئة
  category_preferences JSONB DEFAULT '{
    "system": {"enabled": true, "channels": ["in_app"], "priority_filter": "low"},
    "maintenance": {"enabled": true, "channels": ["email", "in_app"], "advance_days": 5, "priority_filter": "medium"},
    "payment_due": {"enabled": true, "channels": ["email", "sms", "in_app"], "advance_days": 3, "priority_filter": "low"},
    "vehicle_return": {"enabled": true, "channels": ["in_app"], "advance_hours": 24, "priority_filter": "low"},
    "contract_expiry": {"enabled": true, "channels": ["email", "in_app"], "advance_days": 7, "priority_filter": "medium"},
    "document_expiry": {"enabled": true, "channels": ["email", "in_app"], "advance_days": 14, "priority_filter": "medium"}
  }',
  
  -- إعدادات التذكير
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_intervals INTEGER[] DEFAULT ARRAY[1, 3, 7], -- أيام قبل التذكير
  
  -- ملخص الإشعارات
  digest_enabled BOOLEAN DEFAULT false,
  digest_frequency VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly'
  digest_time TIME DEFAULT '09:00',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول إعدادات الإشعارات حسب النوع
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type VARCHAR(50) NOT NULL,
  user_id UUID, -- null = إعداد عام للنظام
  enabled BOOLEAN DEFAULT true,
  advance_days INTEGER DEFAULT 7, -- كم يوم مسبقاً يتم الإرسال
  email_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول سجل توصيل الإشعارات
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES smart_notifications(id),
  delivery_method VARCHAR(20) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
  status VARCHAR(20) NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'bounced'
  recipient_info JSONB, -- معلومات المستقبل
  sent_at TIMESTAMPTZ DEFAULT now(),
  error_message TEXT -- في حالة الفشل
);

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE smart_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للإشعارات الذكية
CREATE POLICY "Users can view their own notifications" ON smart_notifications
  FOR SELECT USING (
    user_id = auth.uid() OR 
    target_roles && ARRAY(SELECT role FROM user_roles WHERE user_id = auth.uid())
  );

CREATE POLICY "System can create notifications" ON smart_notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications" ON smart_notifications
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    target_roles && ARRAY(SELECT role FROM user_roles WHERE user_id = auth.uid())
  );

-- سياسات أمان قوالب الإشعارات
CREATE POLICY "Authenticated users can view notification templates" ON notification_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage notification templates" ON notification_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- سياسات أمان تفضيلات الإشعارات
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- سياسات أمان إعدادات الإشعارات
CREATE POLICY "Users can manage their notification settings" ON notification_settings
  FOR ALL USING (user_id = auth.uid());

-- سياسات أمان سجل الإشعارات
CREATE POLICY "Users can view their notification history" ON notification_history
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM smart_notifications n 
      WHERE n.id = notification_history.notification_id 
      AND n.user_id = auth.uid()
    )
  );

-- إضافة triggers لتحديث updated_at
CREATE TRIGGER update_smart_notifications_updated_at
  BEFORE UPDATE ON smart_notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_notification_updated_at();

-- دالة إنشاء إشعار ذكي
CREATE OR REPLACE FUNCTION create_smart_notification(
  p_title TEXT,
  p_message TEXT,
  p_type VARCHAR(50) DEFAULT 'info',
  p_category VARCHAR(50) DEFAULT 'system',
  p_priority VARCHAR(50) DEFAULT 'medium',
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_data JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_target_roles TEXT[] DEFAULT NULL,
  p_action_required BOOLEAN DEFAULT false,
  p_scheduled_for TIMESTAMPTZ DEFAULT now(),
  p_delivery_channels TEXT[] DEFAULT ARRAY['in_app']
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- دالة لتنشيط الإشعارات التلقائية عند انتهاء صلاحية العقود
CREATE OR REPLACE FUNCTION notify_contract_expiry()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contract_record RECORD;
  notification_count INTEGER := 0;
BEGIN
  -- البحث عن العقود التي ستنتهي في الأيام القادمة
  FOR contract_record IN
    SELECT c.*, cust.name as customer_name, v.plate_number
    FROM rental_contracts c
    JOIN customers cust ON c.customer_id = cust.id
    JOIN vehicles v ON c.vehicle_id = v.id
    WHERE c.status = 'active'
    AND c.end_date BETWEEN CURRENT_DATE + INTERVAL '1 day' AND CURRENT_DATE + INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM smart_notifications 
      WHERE reference_type = 'contract' 
      AND reference_id = c.id 
      AND category = 'contract_expiry'
      AND created_at > CURRENT_DATE - INTERVAL '1 day'
    )
  LOOP
    -- إنشاء إشعار انتهاء العقد
    PERFORM create_smart_notification(
      'انتهاء عقد إيجار قريباً',
      'العقد رقم ' || contract_record.contract_number || ' للعميل ' || contract_record.customer_name || 
      ' سينتهي في ' || contract_record.end_date || ' للمركبة ' || contract_record.plate_number,
      'warning',
      'contract_expiry',
      'high',
      'contract',
      contract_record.id,
      jsonb_build_object(
        'contract_number', contract_record.contract_number,
        'customer_name', contract_record.customer_name,
        'vehicle_plate', contract_record.plate_number,
        'end_date', contract_record.end_date
      ),
      NULL,
      ARRAY['admin', 'manager'],
      true,
      now(),
      ARRAY['in_app', 'email']
    );
    
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$;

-- دالة لتنشيط إشعارات الصيانة الدورية
CREATE OR REPLACE FUNCTION notify_maintenance_due()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vehicle_record RECORD;
  notification_count INTEGER := 0;
BEGIN
  -- البحث عن المركبات التي تحتاج صيانة
  FOR vehicle_record IN
    SELECT v.*, vo.name as owner_name
    FROM vehicles v
    LEFT JOIN vehicle_owners vo ON v.owner_id = vo.id
    WHERE v.status = 'available'
    AND (
      (v.next_maintenance_date IS NOT NULL AND v.next_maintenance_date <= CURRENT_DATE + INTERVAL '3 days')
      OR
      (v.next_maintenance_km IS NOT NULL AND v.current_mileage >= v.next_maintenance_km - 100)
    )
    AND NOT EXISTS (
      SELECT 1 FROM smart_notifications 
      WHERE reference_type = 'vehicle' 
      AND reference_id = v.id 
      AND category = 'maintenance'
      AND created_at > CURRENT_DATE - INTERVAL '1 day'
    )
  LOOP
    -- إنشاء إشعار الصيانة المستحقة
    PERFORM create_smart_notification(
      'صيانة مستحقة للمركبة',
      'المركبة ' || vehicle_record.plate_number || ' (' || vehicle_record.brand || ' ' || vehicle_record.model || ') ' ||
      'تحتاج إلى صيانة دورية',
      'warning',
      'maintenance',
      'medium',
      'vehicle',
      vehicle_record.id,
      jsonb_build_object(
        'vehicle_plate', vehicle_record.plate_number,
        'vehicle_brand', vehicle_record.brand,
        'vehicle_model', vehicle_record.model,
        'owner_name', vehicle_record.owner_name,
        'next_maintenance_date', vehicle_record.next_maintenance_date,
        'current_mileage', vehicle_record.current_mileage
      ),
      NULL,
      ARRAY['admin', 'manager', 'employee'],
      true,
      now(),
      ARRAY['in_app', 'email']
    );
    
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$;

-- إدراج بعض القوالب الافتراضية
INSERT INTO notification_templates (name, category, type, templates, required_variables, default_priority, default_channels) VALUES
('contract_expiry', 'contract', 'warning', 
 '{"ar": {"title": "انتهاء عقد إيجار قريباً", "message": "العقد رقم {{contract_number}} للعميل {{customer_name}} سينتهي في {{end_date}}"}, "en": {"title": "Contract Expiring Soon", "message": "Contract {{contract_number}} for {{customer_name}} will expire on {{end_date}}"}}',
 ARRAY['contract_number', 'customer_name', 'end_date'], 'high', ARRAY['in_app', 'email']),

('maintenance_due', 'maintenance', 'warning',
 '{"ar": {"title": "صيانة مستحقة", "message": "المركبة {{vehicle_plate}} تحتاج إلى صيانة دورية"}, "en": {"title": "Maintenance Due", "message": "Vehicle {{vehicle_plate}} requires maintenance"}}',
 ARRAY['vehicle_plate'], 'medium', ARRAY['in_app', 'email']),

('payment_overdue', 'payment', 'error',
 '{"ar": {"title": "دفعة متأخرة", "message": "الدفعة بقيمة {{amount}} متأخرة منذ {{days_overdue}} يوم"}, "en": {"title": "Payment Overdue", "message": "Payment of {{amount}} is overdue by {{days_overdue}} days"}}',
 ARRAY['amount', 'days_overdue'], 'critical', ARRAY['in_app', 'email', 'sms']),

('document_expiry', 'system', 'warning',
 '{"ar": {"title": "انتهاء صلاحية وثيقة", "message": "الوثيقة {{document_type}} ستنتهي صلاحيتها في {{expiry_date}}"}, "en": {"title": "Document Expiring", "message": "Document {{document_type}} will expire on {{expiry_date}}"}}',
 ARRAY['document_type', 'expiry_date'], 'medium', ARRAY['in_app', 'email']);
