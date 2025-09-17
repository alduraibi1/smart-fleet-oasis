-- CRITICAL SECURITY FIX: Secure password_reset_requests table
-- This table was publicly readable/writable, exposing sensitive reset tokens and emails

BEGIN;

-- Drop the dangerous public policy that allowed anyone to access password reset data
DROP POLICY IF EXISTS "System can manage password reset requests" ON public.password_reset_requests;

-- Create secure policies for password_reset_requests table

-- 1. Only allow system functions (SECURITY DEFINER) to insert new reset requests
CREATE POLICY "System functions can insert reset requests"
ON public.password_reset_requests
FOR INSERT
TO authenticated
WITH CHECK (false); -- Block direct inserts, only allow via SECURITY DEFINER functions

-- 2. Only allow system functions to update reset requests (mark as used)
CREATE POLICY "System functions can update reset requests"
ON public.password_reset_requests
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false); -- Block direct updates, only allow via SECURITY DEFINER functions

-- 3. Only allow system functions to select reset requests for validation
CREATE POLICY "System functions can select reset requests"
ON public.password_reset_requests
FOR SELECT
TO authenticated
USING (false); -- Block direct selects, only allow via SECURITY DEFINER functions

-- 4. Only allow system functions to delete expired requests
CREATE POLICY "System functions can delete expired requests"
ON public.password_reset_requests
FOR DELETE
TO authenticated
USING (false); -- Block direct deletes, only allow via SECURITY DEFINER functions

-- 5. Allow admins to manage reset requests for administrative purposes
CREATE POLICY "Admins can manage all reset requests"
ON public.password_reset_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Grant necessary permissions to service_role for system functions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.password_reset_requests TO service_role;

-- Ensure RLS is enabled (should already be, but double-check)
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

COMMIT;