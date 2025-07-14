-- إنشاء جدول الإشعارات
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('contract_expiry', 'maintenance_due', 'payment_overdue', 'license_expiry', 'general')),
  severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
  reference_id UUID, -- يمكن أن يشير إلى عقد، مركبة، إلخ
  reference_type VARCHAR(50), -- contract, vehicle, maintenance, payment
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID, -- المستخدم المسؤول عن الإشعار
  auto_generated BOOLEAN DEFAULT true,
  action_required BOOLEAN DEFAULT false,
  metadata JSONB -- بيانات إضافية مرنة
);

-- إنشاء جدول إعدادات الإشعارات
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  notification_type VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  advance_days INTEGER DEFAULT 7, -- كم يوم مقدماً للتذكير
  email_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- إنشاء جدول سجل الإشعارات المرسلة
CREATE TABLE public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('app', 'email', 'push')),
  status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'read')),
  error_message TEXT,
  recipient_info JSONB
);

-- تمكين RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS للإشعارات
CREATE POLICY "Users can view their notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- إنشاء سياسات RLS لإعدادات الإشعارات
CREATE POLICY "Users can manage their notification settings" 
ON public.notification_settings 
FOR ALL 
USING (user_id = auth.uid());

-- إنشاء سياسات RLS لسجل الإشعارات
CREATE POLICY "Users can view their notification history" 
ON public.notification_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.notifications n 
  WHERE n.id = notification_history.notification_id 
  AND n.user_id = auth.uid()
));

-- إنشاء فهارس للأداء
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_scheduled_for ON public.notifications(scheduled_for);
CREATE INDEX idx_notifications_reference ON public.notifications(reference_type, reference_id);

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إدراج إعدادات افتراضية للإشعارات
INSERT INTO public.notification_settings (notification_type, enabled, advance_days, email_enabled, push_enabled) VALUES
('contract_expiry', true, 7, true, true),
('maintenance_due', true, 3, true, true),
('payment_overdue', true, 1, true, true),
('license_expiry', true, 14, true, true),
('general', true, 0, false, true);