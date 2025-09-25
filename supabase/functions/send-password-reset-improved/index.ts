import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@2.0.0";

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

    // Generate secure token and OTP
    const token = crypto.randomUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    
    const tokenHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(token)
    );
    const hashString = Array.from(new Uint8Array(tokenHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Set expiration (60 minutes from now - improved from 30)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

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
        user_agent: userAgent,
        otp_code: otp
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

    // Send email using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    // Get the correct frontend URL for the reset link
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://oezugvqviogpcqphkbuf.lovableproject.com';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const emailResponse = await resend.emails.send({
      from: 'الدرايبي - CarRent Pro <onboarding@resend.dev>',
      to: [email],
      subject: 'إعادة تعيين كلمة المرور - الدرايبي CarRent Pro',
      html: `
        <div style="direction: rtl; text-align: right; font-family: 'Arial', 'Tahoma', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px 20px; border-radius: 15px 15px 0 0;">
            <div style="text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">الدرايبي</h1>
              <h2 style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 16px; font-weight: normal;">CarRent Pro</h2>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-bottom: 25px; font-size: 24px;">إعادة تعيين كلمة المرور</h2>
            
            <p style="color: #4b5563; line-height: 1.8; margin-bottom: 30px; font-size: 16px;">
              السلام عليكم،<br><br>
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في نظام الدرايبي لإدارة تأجير المركبات.
            </p>
            
            <!-- OTP Section -->
            <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">رمز التحقق (OTP)</h3>
              <div style="background: white; padding: 15px 25px; border-radius: 8px; display: inline-block; border: 2px dashed #6b7280;">
                <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">استخدم هذا الرمز في صفحة إعادة التعيين</p>
            </div>
            
            <!-- Reset Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #4f46e5, #7c3aed); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 10px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);">
                إعادة تعيين كلمة المرور الآن
              </a>
            </div>
            
            <!-- Alternative Link -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-right: 4px solid #4f46e5; margin: 30px 0;">
              <p style="color: #475569; font-size: 14px; margin-bottom: 10px; font-weight: bold;">
                أو انسخ والصق هذا الرابط في متصفحك:
              </p>
              <p style="color: #4f46e5; font-size: 14px; word-break: break-all; background: white; padding: 12px; border-radius: 5px; border: 1px solid #e2e8f0; font-family: 'Courier New', monospace;">
                ${resetUrl}
              </p>
            </div>
          </div>
          
          <!-- Security Warnings -->
          <div style="background: #fef2f2; padding: 25px 30px; border: 1px solid #fecaca;">
            <h3 style="color: #dc2626; font-size: 16px; margin: 0 0 15px 0; display: flex; align-items: center;">
              <span style="font-size: 20px; margin-left: 8px;">⚠️</span>
              تحذيرات أمنية مهمة
            </h3>
            <ul style="color: #7f1d1d; font-size: 14px; margin: 0; padding-right: 20px; line-height: 1.6;">
              <li style="margin-bottom: 8px;"><strong>صالح لمدة 60 دقيقة فقط</strong> - استخدمه قبل انتهاء الصلاحية</li>
              <li style="margin-bottom: 8px;"><strong>لا تشارك هذا الرابط أو الرمز مع أحد</strong> - حتى مع موظفي الدعم</li>
              <li style="margin-bottom: 8px;"><strong>إذا لم تطلب إعادة التعيين</strong> - تجاهل هذه الرسالة وغيّر كلمة مرورك فوراً</li>
              <li><strong>تحقق من صحة الرابط</strong> - تأكد أنه يحتوي على اسم موقعنا الصحيح</li>
            </ul>
          </div>
          
          <!-- Footer -->
          <div style="background: #1f2937; padding: 25px 30px; border-radius: 0 0 15px 15px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 الدرايبي - CarRent Pro<br>
              نظام إدارة تأجير المركبات المتطور
            </p>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">
              هذه رسالة آلية، يرجى عدم الرد عليها
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Email error:', emailResponse.error);
      // Don't reveal email sending failure to prevent enumeration
    }

    // Log successful request with enhanced info
    console.log(`Password reset requested for ${email} from IP ${clientIP} with OTP ${otp}`);

    return new Response(
      JSON.stringify({ 
        message: 'إذا كان البريد الإلكتروني موجود في نظامنا، ستصلك رسالة إعادة تعيين كلمة المرور مع رمز تحقق خلال دقائق قليلة' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-password-reset-improved function:', error);
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