-- إنشاء جدول الإشعارات الذكية المحسن
CREATE TABLE IF NOT EXISTS public.smart_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'urgent', 'success')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('contract_expiry', 'payment_due', 'vehicle_return', 'maintenance', 'system', 'customer_rating', 'document_expiry')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- المعلومات المرتبطة
  reference_type VARCHAR(50), -- نوع الكائن المرتبط
  reference_id UUID, -- معرف الكائن المرتبط
  reference_data JSONB, -- بيانات إضافية مرنة
  
  -- الحالة والتفاعل
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'dismissed')),
  action_required BOOLEAN DEFAULT false,
  action_taken BOOLEAN DEFAULT false,
  action_data JSONB,
  
  -- التوقيت والجدولة
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_generated BOOLEAN DEFAULT true,
  
  -- المستخدم المستهدف
  user_id UUID,
  target_roles TEXT[], -- الأدوار المستهدفة
  target_departments TEXT[], -- الأقسام المستهدفة
  
  -- معلومات الإرسال
  delivery_channels TEXT[] DEFAULT ARRAY['in_app'], -- in_app, email, sms, push
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_status JSONB DEFAULT '{}',
  
  -- التكرار والتذكير
  recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,
  reminder_sent BOOLEAN DEFAULT false,
  
  -- التتبع والإحصائيات
  interaction_count INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- الفهارس
  CONSTRAINT fk_smart_notifications_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_smart_notifications_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- فهارس للأداء
CREATE INDEX idx_smart_notifications_user_id ON smart_notifications(user_id);
CREATE INDEX idx_smart_notifications_status ON smart_notifications(status);
CREATE INDEX idx_smart_notifications_category ON smart_notifications(category);
CREATE INDEX idx_smart_notifications_priority ON smart_notifications(priority);
CREATE INDEX idx_smart_notifications_scheduled_for ON smart_notifications(scheduled_for);
CREATE INDEX idx_smart_notifications_reference ON smart_notifications(reference_type, reference_id);
CREATE INDEX idx_smart_notifications_created_at ON smart_notifications(created_at DESC);

-- تمكين RLS
ALTER TABLE smart_notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view their own notifications or notifications for their roles"
ON smart_notifications FOR SELECT
USING (
  user_id = auth.uid() 
  OR target_roles && ARRAY(SELECT unnest(get_user_roles(auth.uid())))
  OR user_id IS NULL
);

CREATE POLICY "Users can update their own notifications"
ON smart_notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON smart_notifications FOR INSERT
WITH CHECK (true);

-- جدول إعدادات الإشعارات المحسن
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- الإعدادات العامة
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
  
  -- تفضيلات الفئات
  category_preferences JSONB DEFAULT '{
    "contract_expiry": {"enabled": true, "advance_days": 7, "channels": ["email", "in_app"], "priority_filter": "medium"},
    "payment_due": {"enabled": true, "advance_days": 3, "channels": ["email", "sms", "in_app"], "priority_filter": "low"},
    "vehicle_return": {"enabled": true, "advance_hours": 24, "channels": ["in_app"], "priority_filter": "low"},
    "maintenance": {"enabled": true, "advance_days": 5, "channels": ["email", "in_app"], "priority_filter": "medium"},
    "document_expiry": {"enabled": true, "advance_days": 14, "channels": ["email", "in_app"], "priority_filter": "medium"},
    "system": {"enabled": true, "channels": ["in_app"], "priority_filter": "low"}
  }',
  
  -- التذكيرات
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_intervals INTEGER[] DEFAULT ARRAY[1, 3, 7], -- أيام
  
  -- التجميع والتلخيص
  digest_enabled BOOLEAN DEFAULT false,
  digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (digest_frequency IN ('hourly', 'daily', 'weekly')),
  digest_time TIME DEFAULT '09:00',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT fk_notification_preferences_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- تمكين RLS لجدول التفضيلات
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences"
ON notification_preferences FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- جدول قوالب الإشعارات
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  
  -- القوالب للغات مختلفة
  templates JSONB NOT NULL DEFAULT '{
    "ar": {"title": "", "message": ""},
    "en": {"title": "", "message": ""}
  }',
  
  -- المتغيرات المطلوبة
  required_variables TEXT[],
  
  -- الإعدادات
  default_priority VARCHAR(20) DEFAULT 'medium',
  default_channels TEXT[] DEFAULT ARRAY['in_app'],
  auto_send BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  CONSTRAINT fk_notification_templates_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- تمكين RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notification templates"
ON notification_templates FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage notification templates"
ON notification_templates FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- إدراج قوالب افتراضية
INSERT INTO notification_templates (name, category, type, templates, required_variables, default_priority, default_channels) VALUES
('contract_expiry_warning', 'contract_expiry', 'warning', '{
  "ar": {
    "title": "تنبيه: عقد قريب الانتهاء",
    "message": "العقد {{contract_number}} للعميل {{customer_name}} سينتهي في {{days_remaining}} أيام ({{end_date}}). المركبة: {{vehicle_info}}"
  },
  "en": {
    "title": "Warning: Contract Expiring Soon",
    "message": "Contract {{contract_number}} for customer {{customer_name}} will expire in {{days_remaining}} days ({{end_date}}). Vehicle: {{vehicle_info}}"
  }
}', ARRAY['contract_number', 'customer_name', 'days_remaining', 'end_date', 'vehicle_info'], 'high', ARRAY['email', 'in_app']),

('payment_due_reminder', 'payment_due', 'warning', '{
  "ar": {
    "title": "تذكير: دفعة مستحقة",
    "message": "يوجد دفعة مستحقة بقيمة {{amount}} ر.س للعقد {{contract_number}}. تاريخ الاستحقاق: {{due_date}}"
  },
  "en": {
    "title": "Reminder: Payment Due",
    "message": "Payment of {{amount}} SAR is due for contract {{contract_number}}. Due date: {{due_date}}"
  }
}', ARRAY['amount', 'contract_number', 'due_date'], 'high', ARRAY['email', 'sms', 'in_app']),

('vehicle_return_reminder', 'vehicle_return', 'info', '{
  "ar": {
    "title": "تذكير: إرجاع مركبة مجدول",
    "message": "المركبة {{vehicle_info}} مجدولة للإرجاع في {{return_date}} للعقد {{contract_number}}"
  },
  "en": {
    "title": "Reminder: Scheduled Vehicle Return",
    "message": "Vehicle {{vehicle_info}} is scheduled for return on {{return_date}} for contract {{contract_number}}"
  }
}', ARRAY['vehicle_info', 'return_date', 'contract_number'], 'medium', ARRAY['in_app']),

('maintenance_due', 'maintenance', 'warning', '{
  "ar": {
    "title": "تنبيه: صيانة مطلوبة",
    "message": "المركبة {{vehicle_info}} تحتاج صيانة {{maintenance_type}} خلال {{days_remaining}} أيام"
  },
  "en": {
    "title": "Alert: Maintenance Required",
    "message": "Vehicle {{vehicle_info}} requires {{maintenance_type}} maintenance within {{days_remaining}} days"
  }
}', ARRAY['vehicle_info', 'maintenance_type', 'days_remaining'], 'medium', ARRAY['email', 'in_app']);

-- دالة لإنشاء الإشعارات تلقائياً
CREATE OR REPLACE FUNCTION create_smart_notification(
  p_title TEXT,
  p_message TEXT,
  p_type VARCHAR(20) DEFAULT 'info',
  p_category VARCHAR(50) DEFAULT 'system',
  p_priority VARCHAR(20) DEFAULT 'medium',
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_data JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_target_roles TEXT[] DEFAULT NULL,
  p_action_required BOOLEAN DEFAULT false,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  p_delivery_channels TEXT[] DEFAULT ARRAY['in_app']
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
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

-- دالة لمعالجة الإشعارات المجدولة
CREATE OR REPLACE FUNCTION process_scheduled_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- تحديث حالة الإشعارات المرسلة
  UPDATE smart_notifications 
  SET 
    sent_at = now(),
    delivery_status = jsonb_set(
      COALESCE(delivery_status, '{}'),
      '{processed_at}',
      to_jsonb(now())
    )
  WHERE 
    scheduled_for <= now() 
    AND sent_at IS NULL 
    AND status = 'unread';
    
  -- إنشاء إشعارات تلقائية للعقود المنتهية قريباً
  INSERT INTO smart_notifications (
    title, message, type, category, priority,
    reference_type, reference_id, reference_data,
    user_id, action_required, delivery_channels
  )
  SELECT 
    'تنبيه: عقد قريب الانتهاء',
    'العقد ' || rc.contract_number || ' للعميل ' || c.name || ' سينتهي خلال ' || 
    EXTRACT(day FROM rc.end_date - CURRENT_DATE) || ' أيام',
    'warning',
    'contract_expiry',
    'high',
    'contract',
    rc.id,
    jsonb_build_object(
      'contract_number', rc.contract_number,
      'customer_name', c.name,
      'end_date', rc.end_date,
      'days_remaining', EXTRACT(day FROM rc.end_date - CURRENT_DATE)
    ),
    NULL, -- إرسال لجميع المستخدمين
    true,
    ARRAY['email', 'in_app']
  FROM rental_contracts rc
  JOIN customers c ON rc.customer_id = c.id
  WHERE rc.status = 'active'
    AND rc.end_date BETWEEN CURRENT_DATE + INTERVAL '1 day' AND CURRENT_DATE + INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM smart_notifications sn 
      WHERE sn.reference_type = 'contract' 
        AND sn.reference_id = rc.id 
        AND sn.category = 'contract_expiry'
        AND sn.created_at > CURRENT_DATE - INTERVAL '1 day'
    );
END;
$$;

-- تريجر لتحديث updated_at
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_smart_notifications_updated_at
  BEFORE UPDATE ON smart_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER trigger_update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();