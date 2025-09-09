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
    const { email, newPassword, tokenHash }: ResetPasswordRequest = await req.json();

    if (!email || !newPassword || !tokenHash) {
      return new Response(
        JSON.stringify({ error: 'بيانات مطلوبة مفقودة' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token is valid and not used
    const { data: resetRequest, error: tokenError } = await supabase
      .from('password_reset_requests')
      .select('id, expires_at, used_at, email')
      .eq('token_hash', tokenHash)
      .eq('email', email)
      .single();

    if (tokenError || !resetRequest) {
      return new Response(
        JSON.stringify({ error: 'رابط غير صالح أو منتهي الصلاحية' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (resetRequest.used_at) {
      return new Response(
        JSON.stringify({ error: 'تم استخدام هذا الرابط من قبل' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (new Date(resetRequest.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'انتهت صلاحية هذا الرابط' }),
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
      console.error('Password update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'خطأ في تحديث كلمة المرور' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from('password_reset_requests')
      .update({ used_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);

    if (markUsedError) {
      console.error('Error marking token as used:', markUsedError);
    }

    // Sign out all sessions for security
    const { error: signOutError } = await supabase.auth.admin.signOut(user.id, 'global');
    if (signOutError) {
      console.error('Error signing out user sessions:', signOutError);
    }

    // Log the successful password reset
    console.log(`Password reset successful for user ${email}`);

    // Create audit log entry
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action: 'password_reset',
          table_name: 'auth.users',
          record_id: user.id,
          severity: 'info',
          metadata: {
            email,
            reset_method: 'email_link',
            ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
          }
        });
    } catch (auditError) {
      console.error('Audit log error:', auditError);
    }

    return new Response(
      JSON.stringify({ 
        message: 'تم تحديث كلمة المرور بنجاح' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in reset-password function:', error);
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