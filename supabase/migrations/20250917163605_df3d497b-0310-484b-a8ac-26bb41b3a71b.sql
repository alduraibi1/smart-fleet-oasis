-- Insert default password requirements if none exist
INSERT INTO password_requirements (
  min_length,
  require_uppercase,
  require_lowercase,
  require_numbers,
  require_symbols,
  max_age_days,
  prevent_reuse_count,
  is_active
) VALUES (
  8,
  true,
  true,
  true,
  true,
  90,
  5,
  true
) ON CONFLICT DO NOTHING;

-- Create security alert rules table
CREATE TABLE IF NOT EXISTS security_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL,
  condition_type VARCHAR(50) NOT NULL, -- 'failed_logins', 'unusual_activity', 'data_access', etc.
  threshold_value INTEGER NOT NULL DEFAULT 5,
  time_window_minutes INTEGER NOT NULL DEFAULT 60,
  severity_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  notification_channels TEXT[] DEFAULT ARRAY['in_app'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security alert rules
ALTER TABLE security_alert_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for security alert rules
CREATE POLICY "Admins can manage security alert rules"
  ON security_alert_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can view security alert rules"
  ON security_alert_rules FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create security incidents table
CREATE TABLE IF NOT EXISTS security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  affected_user_id UUID,
  source_ip INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  assigned_to UUID,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security incidents
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- Create policies for security incidents
CREATE POLICY "Admins and managers can manage security incidents"
  ON security_incidents FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create user sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  location_info JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON user_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_created_at ON security_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Insert default security alert rules
INSERT INTO security_alert_rules (rule_name, condition_type, threshold_value, time_window_minutes, severity_level) VALUES
('محاولات دخول فاشلة متكررة', 'failed_logins', 5, 15, 'high'),
('وصول غير عادي للبيانات', 'data_access', 10, 60, 'medium'),
('تعديلات متعددة للمستخدمين', 'user_modifications', 3, 30, 'medium'),
('عمليات حذف متكررة', 'delete_operations', 5, 60, 'high')
ON CONFLICT DO NOTHING;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < now() OR (is_active = false AND last_activity < now() - INTERVAL '7 days');
END;
$$;

-- Create function to detect security incidents
CREATE OR REPLACE FUNCTION detect_security_incident()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rule_record RECORD;
  incident_count INTEGER;
BEGIN
  FOR rule_record IN 
    SELECT * FROM security_alert_rules WHERE is_active = true
  LOOP
    incident_count := 0;
    
    -- Check for failed login attempts
    IF rule_record.condition_type = 'failed_logins' THEN
      SELECT COUNT(*) INTO incident_count
      FROM failed_login_attempts
      WHERE attempt_time > now() - (rule_record.time_window_minutes || ' minutes')::INTERVAL;
    END IF;
    
    -- Check for excessive data access
    IF rule_record.condition_type = 'data_access' THEN
      SELECT COUNT(*) INTO incident_count
      FROM audit_logs
      WHERE action = 'SELECT' 
        AND occurred_at > now() - (rule_record.time_window_minutes || ' minutes')::INTERVAL;
    END IF;
    
    -- Check for delete operations
    IF rule_record.condition_type = 'delete_operations' THEN
      SELECT COUNT(*) INTO incident_count
      FROM audit_logs
      WHERE action = 'DELETE' 
        AND occurred_at > now() - (rule_record.time_window_minutes || ' minutes')::INTERVAL;
    END IF;
    
    -- Create incident if threshold exceeded
    IF incident_count >= rule_record.threshold_value THEN
      INSERT INTO security_incidents (
        incident_type,
        severity,
        title,
        description,
        metadata
      ) VALUES (
        rule_record.condition_type,
        rule_record.severity_level,
        'تم اكتشاف نشاط مشبوه: ' || rule_record.rule_name,
        'تم تجاوز الحد المسموح (' || rule_record.threshold_value || ') خلال ' || rule_record.time_window_minutes || ' دقيقة',
        jsonb_build_object(
          'rule_id', rule_record.id,
          'threshold', rule_record.threshold_value,
          'actual_count', incident_count,
          'time_window', rule_record.time_window_minutes
        )
      );
      
      -- Create notification
      INSERT INTO smart_notifications (
        title,
        message,
        type,
        category,
        priority,
        reference_type,
        target_roles,
        delivery_channels
      ) VALUES (
        'تحذير أمني: ' || rule_record.rule_name,
        'تم اكتشاف نشاط مشبوه يتطلب المراجعة الفورية',
        'warning',
        'security',
        CASE 
          WHEN rule_record.severity_level = 'high' THEN 'urgent'
          WHEN rule_record.severity_level = 'medium' THEN 'high'
          ELSE 'medium'
        END,
        'security_incident',
        ARRAY['admin', 'manager']::text[],
        rule_record.notification_channels
      );
    END IF;
  END LOOP;
END;
$$;