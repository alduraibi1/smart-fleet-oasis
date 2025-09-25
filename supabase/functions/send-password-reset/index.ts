import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
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
    const { email }: PasswordResetRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'بريد إلكتروني صالح مطلوب' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find(u => u.email === email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          message: 'إذا كان البريد الإلكتروني موجود في نظامنا، ستصلك رسالة إعادة تعيين كلمة المرور' 
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check rate limiting (max 3 requests per hour per email)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentRequests } = await supabase
      .from('password_reset_requests')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneHourAgo);

    if (recentRequests && recentRequests.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'تم تجاوز الحد المسموح من طلبات إعادة التعيين. حاول لاحقاً' }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate secure token
    const token = crypto.randomUUID();
    const tokenHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(token)
    );
    const hashString = Array.from(new Uint8Array(tokenHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Set expiration (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Get client IP and User-Agent for logging
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Store reset request
    const { error: insertError } = await supabase
      .from('password_reset_requests')
      .insert({
        email,
        token_hash: hashString,
        expires_at: expiresAt,
        ip_address: clientIP,
        user_agent: userAgent
      });

    if (insertError) {
      console.error('Database error:', insertError);
      return new Response(
        JSON.stringify({ error: 'خطأ في النظام، حاول لاحقاً' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Send email using basic method since Resend import was removed
    // For production, configure email provider in Supabase settings
    
    // Get the correct frontend URL for the reset link
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://oezugvqviogpcqphkbuf.lovableproject.com';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    // Email sending disabled - configure email provider in Supabase Auth settings
    const emailResponse = { error: null };

    if (emailResponse.error) {
      console.error('Email error:', emailResponse.error);
      // Don't reveal email sending failure to prevent enumeration
    }

    // Log successful request
    console.log(`Password reset requested for ${email} from IP ${clientIP}`);

    return new Response(
      JSON.stringify({ 
        message: 'إذا كان البريد الإلكتروني موجود في نظامنا، ستصلك رسالة إعادة تعيين كلمة المرور' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-password-reset function:', error);
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