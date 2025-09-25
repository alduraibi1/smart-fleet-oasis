import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackFailedLoginRequest {
  email: string;
  reason?: string;
  user_agent?: string;
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

    const { email, reason, user_agent }: TrackFailedLoginRequest = await req.json();

    if (!email) {
      return new Response('Email is required', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Get client IP address - extract first valid IP from forwarded header
    const getClientIP = () => {
      const forwarded = req.headers.get('x-forwarded-for');
      if (forwarded) {
        // Extract first IP from comma-separated list and remove spaces
        const firstIP = forwarded.split(',')[0].trim();
        return firstIP;
      }
      return req.headers.get('x-real-ip') || '0.0.0.0';
    };
    
    const clientIP = getClientIP();

    // Insert failed login attempt
    const { error: insertError } = await supabase
      .from('failed_login_attempts')
      .insert({
        ip_address: clientIP,
        email: email.toLowerCase(),
        user_agent: user_agent || null,
      });

    if (insertError) {
      console.error('Failed to insert login attempt:', insertError);
      return new Response('Failed to log attempt', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // Check if IP should be blocked
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const { data: recentAttempts, error: countError } = await supabase
      .from('failed_login_attempts')
      .select('id')
      .eq('ip_address', clientIP)
      .gte('attempt_time', fifteenMinutesAgo.toISOString());

    if (countError) {
      console.error('Failed to count attempts:', countError);
    }

    let shouldBlock = false;
    let blockDuration = 0;

    if (recentAttempts && recentAttempts.length >= 5) {
      shouldBlock = true;
      
      // Progressive blocking: 15 mins for 5 attempts, 1 hour for 10+
      if (recentAttempts.length >= 10) {
        blockDuration = 60 * 60 * 1000; // 1 hour
      } else {
        blockDuration = 15 * 60 * 1000; // 15 minutes
      }

      const blockUntil = new Date(Date.now() + blockDuration);

      // Update all recent attempts with block time
      await supabase
        .from('failed_login_attempts')
        .update({ blocked_until: blockUntil.toISOString() })
        .eq('ip_address', clientIP)
        .gte('attempt_time', fifteenMinutesAgo.toISOString());
    }

    // Log security event
    await supabase.from('security_audit_log').insert({
      action_type: 'failed_login_attempt',
      resource_type: 'authentication',
      ip_address: clientIP,
      user_agent: user_agent || null,
      success: false,
      failure_reason: reason || 'Invalid credentials',
      additional_data: {
        email: email.toLowerCase(),
        attempts_count: recentAttempts?.length || 0,
        blocked: shouldBlock,
        block_duration_ms: shouldBlock ? blockDuration : 0
      }
    });

    return new Response(JSON.stringify({
      success: true,
      blocked: shouldBlock,
      attempts_count: recentAttempts?.length || 0,
      block_duration_minutes: shouldBlock ? Math.ceil(blockDuration / (60 * 1000)) : 0
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in track-failed-login:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});