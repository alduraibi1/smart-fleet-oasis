-- Add OTP column to password_reset_requests table for improved security
ALTER TABLE public.password_reset_requests 
ADD COLUMN IF NOT EXISTS otp_code TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.password_reset_requests.otp_code IS 'Optional 6-digit OTP code sent via email for additional security';