-- Create password reset requests table
CREATE TABLE public.password_reset_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Create policies - only system can manage these records
CREATE POLICY "System can manage password reset requests" 
ON public.password_reset_requests 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX idx_password_reset_token_hash ON public.password_reset_requests(token_hash);
CREATE INDEX idx_password_reset_email ON public.password_reset_requests(email);
CREATE INDEX idx_password_reset_expires_at ON public.password_reset_requests(expires_at);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_password_reset_updated_at
BEFORE UPDATE ON public.password_reset_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_profitability();

-- Function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.password_reset_requests
  WHERE expires_at < NOW() OR used_at IS NOT NULL;
END;
$$;