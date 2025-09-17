import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogSecurityEventRequest {
  action_type: string;
  resource_type?: string;
  resource_id?: string;
  success: boolean;
  failure_reason?: string;
  user_agent?: string;
  additional_data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const {
      action_type,
      resource_type,
      resource_id,
      success,
      failure_reason,
      user_agent,
      additional_data
    }: LogSecurityEventRequest = await req.json();

    if (!action_type || typeof success !== 'boolean') {
      return new Response('action_type and success are required', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '0.0.0.0';

    // Get user ID from JWT if available
    let userId: string | null = null;
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        userId = user?.id || null;
      }
    } catch (error) {
      // User not authenticated, which is fine for some security events
      console.log('No authenticated user for security event');
    }

    // Insert security audit log entry
    const { error: insertError } = await supabase
      .from('security_audit_log')
      .insert({
        user_id: userId,
        action_type,
        resource_type: resource_type || null,
        resource_id: resource_id || null,
        ip_address: clientIP,
        user_agent: user_agent || null,
        success,
        failure_reason: failure_reason || null,
        additional_data: additional_data || {}
      });

    if (insertError) {
      console.error('Failed to insert security audit log:', insertError);
      return new Response('Failed to log security event', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // For critical security events, create smart notifications
    if (!success && ['failed_login_attempt', 'unauthorized_access', 'password_change'].includes(action_type)) {
      try {
        await supabase.from('smart_notifications').insert({
          title: `تحذير أمني: ${getArabicActionName(action_type)}`,
          message: `تم اكتشاف نشاط مشبوه: ${action_type}${failure_reason ? ` - ${failure_reason}` : ''}`,
          type: 'warning',
          category: 'security',
          priority: 'high',
          target_roles: ['admin'],
          delivery_channels: ['in_app'],
          reference_type: 'security_event',
          reference_data: {
            action_type,
            ip_address: clientIP,
            user_id: userId,
            timestamp: new Date().toISOString()
          }
        });
      } catch (notificationError) {
        console.error('Failed to create security notification:', notificationError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      logged_at: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in log-security-event:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});

function getArabicActionName(actionType: string): string {
  const translations: Record<string, string> = {
    'failed_login_attempt': 'محاولة تسجيل دخول فاشلة',
    'user_signin': 'تسجيل دخول المستخدم',
    'user_signup': 'تسجيل مستخدم جديد',
    'password_change': 'تغيير كلمة المرور',
    'unauthorized_access': 'محاولة وصول غير مصرح',
    'data_access': 'الوصول للبيانات',
    'admin_action': 'إجراء إداري'
  };
  
  return translations[actionType] || actionType;
}