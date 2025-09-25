import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Starting security incident detection...');

    // Get active alert rules
    const { data: rules, error: rulesError } = await supabaseClient
      .from('security_alert_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching alert rules:', rulesError);
      throw rulesError;
    }

    console.log(`📋 Found ${rules?.length || 0} active alert rules`);

    let incidentsCreated = 0;
    let notificationsCreated = 0;

    for (const rule of rules || []) {
      console.log(`🔍 Checking rule: ${rule.rule_name}`);
      
      let incidentCount = 0;
      const timeWindowStart = new Date(Date.now() - rule.time_window_minutes * 60 * 1000).toISOString();

      // Check for different types of security incidents
      switch (rule.condition_type) {
        case 'failed_logins':
          const { count: failedLoginCount } = await supabaseClient
            .from('failed_login_attempts')
            .select('*', { count: 'exact', head: true })
            .gte('attempt_time', timeWindowStart);
          
          incidentCount = failedLoginCount || 0;
          break;

        case 'data_access':
          const { count: dataAccessCount } = await supabaseClient
            .from('audit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('action', 'SELECT')
            .gte('occurred_at', timeWindowStart);
          
          incidentCount = dataAccessCount || 0;
          break;

        case 'delete_operations':
          const { count: deleteCount } = await supabaseClient
            .from('audit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('action', 'DELETE')
            .gte('occurred_at', timeWindowStart);
          
          incidentCount = deleteCount || 0;
          break;

        case 'user_modifications':
          const { count: userModCount } = await supabaseClient
            .from('audit_logs')
            .select('*', { count: 'exact', head: true })
            .in('table_name', ['profiles', 'user_roles'])
            .in('action', ['INSERT', 'UPDATE', 'DELETE'])
            .gte('occurred_at', timeWindowStart);
          
          incidentCount = userModCount || 0;
          break;

        default:
          console.log(`⚠️ Unknown condition type: ${rule.condition_type}`);
          continue;
      }

      console.log(`📊 Rule "${rule.rule_name}": ${incidentCount} incidents (threshold: ${rule.threshold_value})`);

      // Create incident if threshold exceeded
      if (incidentCount >= rule.threshold_value) {
        console.log(`🚨 Threshold exceeded for rule: ${rule.rule_name}`);

        // Check if we already have a recent incident for this rule
        const { data: existingIncidents } = await supabaseClient
          .from('security_incidents')
          .select('id')
          .eq('incident_type', rule.condition_type)
          .eq('status', 'open')
          .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Last 30 minutes

        if (!existingIncidents || existingIncidents.length === 0) {
          // Create new incident
          const { data: incident, error: incidentError } = await supabaseClient
            .from('security_incidents')
            .insert({
              incident_type: rule.condition_type,
              severity: rule.severity_level,
              title: `تم اكتشاف نشاط مشبوه: ${rule.rule_name}`,
              description: `تم تجاوز الحد المسموح (${rule.threshold_value}) خلال ${rule.time_window_minutes} دقيقة. العدد الفعلي: ${incidentCount}`,
              metadata: {
                rule_id: rule.id,
                rule_name: rule.rule_name,
                threshold: rule.threshold_value,
                actual_count: incidentCount,
                time_window: rule.time_window_minutes,
                detection_time: new Date().toISOString()
              }
            })
            .select()
            .single();

          if (incidentError) {
            console.error('Error creating incident:', incidentError);
            continue;
          }

          incidentsCreated++;
          console.log(`✅ Created incident: ${incident.id}`);

          // Create notification
          const notificationPriority = rule.severity_level === 'high' ? 'urgent' : 
                                     rule.severity_level === 'medium' ? 'high' : 'medium';

          const { error: notificationError } = await supabaseClient
            .from('smart_notifications')
            .insert({
              title: `🚨 تحذير أمني: ${rule.rule_name}`,
              message: `تم اكتشاف نشاط مشبوه يتطلب المراجعة الفورية. العدد: ${incidentCount} (الحد الأقصى: ${rule.threshold_value})`,
              type: 'warning',
              category: 'security',
              priority: notificationPriority,
              reference_type: 'security_incident',
              reference_id: incident.id,
              target_roles: ['admin', 'manager'],
              delivery_channels: rule.notification_channels || ['in_app'],
              reference_data: {
                incident_id: incident.id,
                rule_name: rule.rule_name,
                severity: rule.severity_level,
                incident_count: incidentCount
              }
            });

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
          } else {
            notificationsCreated++;
            console.log(`📱 Created notification for incident: ${incident.id}`);
          }
        } else {
          console.log(`ℹ️ Recent incident already exists for rule: ${rule.rule_name}`);
        }
      }
    }

    const result = {
      success: true,
      rules_checked: rules?.length || 0,
      incidents_created: incidentsCreated,
      notifications_created: notificationsCreated,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Security incident detection completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Security incident detection failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})