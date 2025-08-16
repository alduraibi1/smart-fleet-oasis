
-- Add missing fields to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS vin VARCHAR,
ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
ADD COLUMN IF NOT EXISTS inspection_expiry DATE,
ADD COLUMN IF NOT EXISTS default_monthly_rate NUMERIC DEFAULT 0;

-- Add tag field to activity_logs for structured filtering
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'tag') THEN
        ALTER TABLE activity_logs ADD COLUMN tag VARCHAR;
    END IF;
END $$;

-- Insert default threshold settings for document expiry warnings
INSERT INTO system_settings (setting_key, setting_value, description, is_active, created_at, updated_at)
VALUES 
  ('document_warning_days', '{"registration": 15, "insurance": 30, "inspection": 30}', 'Warning thresholds for document expiry in days', true, now(), now()),
  ('istimara_override_role', '{"roles": ["admin", "manager"]}', 'Roles that can override registration expiry blocks', true, now(), now())
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR NOT NULL,
  entity_type VARCHAR NOT NULL,
  entity_id UUID,
  tag VARCHAR,
  details JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for activity_logs
CREATE POLICY "Authenticated users can manage activity logs" 
ON activity_logs 
FOR ALL 
USING (auth.uid() IS NOT NULL);
