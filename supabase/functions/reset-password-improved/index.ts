import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  tokenHash: string;
  otpCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    const { email, newPassword, tokenHash, otpCode }: ResetPasswordRequest = await req.json();

    if (!email || !newPassword || !tokenHash) {
      return new Response(
        JSON.stringify({ error: 'معلومات مطلوبة ناقصة' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP and User-Agent for logging
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Verify the reset token
    const { data: resetData, error: tokenError } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('email', email)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !resetData) {
      console.error('Token verification failed:', tokenError);
      
      // Log security event for invalid token usage
      await supabase.from('security_audit_log').insert({
        action_type: 'password_reset_invalid_token',
        resource_type: 'authentication',
        ip_address: clientIP,
        user_agent: userAgent,
        success: false,
        failure_reason: 'Invalid or expired reset token',
        additional_data: {
          email: email,
          token_hash: tokenHash.substring(0, 8) + '...' // Partial hash for security
        }
      });

      return new Response(
        JSON.stringify({ error: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Verify OTP if provided
    if (resetData.otp_code && (!otpCode || otpCode !== resetData.otp_code)) {
      console.error('OTP verification failed for email:', email);
      
      // Log security event for invalid OTP
      await supabase.from('security_audit_log').insert({
        action_type: 'password_reset_invalid_otp',
        resource_type: 'authentication',
        ip_address: clientIP,
        user_agent: userAgent,
        success: false,
        failure_reason: 'Invalid OTP code',
        additional_data: {
          email: email,
          provided_otp: otpCode ? 'provided' : 'missing',
          expected_otp_exists: !!resetData.otp_code
        }
      });

      return new Response(
        JSON.stringify({ error: 'رمز التحقق غير صحيح' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find(u => u.email === email);

    if (!user) {
      console.error('User not found for email:', email);
      return new Response(
        JSON.stringify({ error: 'المستخدم غير موجود' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update failed:', updateError);
      
      // Log security event for failed password update
      await supabase.from('security_audit_log').insert({
        action_type: 'password_reset_update_failed',
        resource_type: 'authentication',
        resource_id: user.id,
        ip_address: clientIP,
        user_agent: userAgent,
        success: false,
        failure_reason: updateError.message,
        additional_data: {
          email: email,
          user_id: user.id
        }
      });

      return new Response(
        JSON.stringify({ error: 'فشل في تحديث كلمة المرور' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Mark token as used
    await supabase
      .from('password_reset_requests')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetData.id);

    // Log successful password reset
    await supabase.from('security_audit_log').insert({
      action_type: 'password_reset_success',
      resource_type: 'authentication',
      resource_id: user.id,
      ip_address: clientIP,
      user_agent: userAgent,
      success: true,
      additional_data: {
        email: email,
        user_id: user.id,
        otp_used: !!otpCode,
        reset_method: resetData.otp_code ? 'token_and_otp' : 'token_only'
      }
    });

    // Invalidate all existing sessions for security
    try {
      await supabase.auth.admin.signOut(user.id, 'global');
      console.log(`All sessions invalidated for user: ${user.id}`);
    } catch (signOutError) {
      console.warn('Failed to invalidate sessions:', signOutError);
      // Don't fail the password reset if session invalidation fails
    }

    console.log(`Password reset successful for user: ${email}`);

    return new Response(
      JSON.stringify({ 
        message: 'تم تحديث كلمة المرور بنجاح',
        sessionInvalidated: true
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in reset-password-improved function:', error);
    return new Response(
      JSON.stringify({ error: 'خطأ في النظام، حاول لاحقاً' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);