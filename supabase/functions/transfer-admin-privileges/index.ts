import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferAdminRequest {
  fromUserId: string;
  toUserId: string;
  transferType: 'promote' | 'transfer' | 'revoke';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { fromUserId, toUserId, transferType }: TransferAdminRequest = await req.json();

    if (!fromUserId || !toUserId || !transferType) {
      return new Response(
        JSON.stringify({ error: 'جميع البيانات مطلوبة' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`${transferType} admin privileges from ${fromUserId} to ${toUserId}`);

    // Verify both users exist
    const { data: fromUser } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', fromUserId)
      .single();

    const { data: toUser } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', toUserId)
      .single();

    if (!fromUser || !toUser) {
      return new Response(
        JSON.stringify({ error: 'أحد المستخدمين غير موجود' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if fromUser has admin role
    const { data: fromUserRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', fromUserId)
      .eq('role', 'admin')
      .single();

    if (!fromUserRole && transferType !== 'promote') {
      return new Response(
        JSON.stringify({ error: 'المستخدم المصدر ليس إدارياً' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let operations = [];
    let message = '';

    switch (transferType) {
      case 'transfer':
        // Remove admin role from source user
        operations.push(
          supabase
            .from('user_roles')
            .delete()
            .eq('user_id', fromUserId)
            .eq('role', 'admin')
        );
        // Add admin role to target user
        operations.push(
          supabase
            .from('user_roles')
            .upsert({ user_id: toUserId, role: 'admin' })
        );
        message = `تم نقل الصلاحيات الإدارية من ${fromUser.full_name} إلى ${toUser.full_name}`;
        break;

      case 'promote':
        // Add admin role to target user (keep source user as admin)
        operations.push(
          supabase
            .from('user_roles')
            .upsert({ user_id: toUserId, role: 'admin' })
        );
        message = `تم ترقية ${toUser.full_name} إلى إداري`;
        break;

      case 'revoke':
        // Remove admin role from target user
        operations.push(
          supabase
            .from('user_roles')
            .delete()
            .eq('user_id', toUserId)
            .eq('role', 'admin')
        );
        // Assign employee role instead
        operations.push(
          supabase
            .from('user_roles')
            .upsert({ user_id: toUserId, role: 'employee' })
        );
        message = `تم إلغاء الصلاحيات الإدارية من ${toUser.full_name}`;
        break;
    }

    // Execute all operations
    const results = await Promise.all(operations);
    
    // Check for errors
    for (const result of results) {
      if (result.error) {
        console.error('Operation error:', result.error);
        return new Response(
          JSON.stringify({ error: 'فشل في تنفيذ العملية: ' + result.error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update profiles if promoting/revoking
    if (transferType === 'promote') {
      await supabase
        .from('profiles')
        .update({ 
          user_type: 'admin',
          approval_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', toUserId);
    } else if (transferType === 'revoke') {
      await supabase
        .from('profiles')
        .update({ user_type: 'employee' })
        .eq('id', toUserId);
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        action: `admin_${transferType}`,
        table_name: 'user_roles',
        record_id: toUserId,
        metadata: {
          from_user: fromUser,
          to_user: toUser,
          transfer_type: transferType,
          performed_by: fromUserId
        },
        severity: 'high'
      });

    // Create notifications
    const notifications = [];
    
    // Notify target user
    notifications.push({
      title: transferType === 'revoke' ? 'تم تغيير صلاحياتك' : 'تم منحك صلاحيات إدارية',
      message: message,
      type: transferType === 'revoke' ? 'warning' : 'success',
      category: 'users',
      priority: 'high',
      reference_type: 'role_change',
      reference_id: toUserId,
      user_id: toUserId,
      delivery_channels: ['in_app']
    });

    // Notify all admins
    notifications.push({
      title: 'تغيير في الصلاحيات الإدارية',
      message: message,
      type: 'info',
      category: 'system',
      priority: 'high',
      reference_type: 'admin_privilege_change',
      reference_id: toUserId,
      target_roles: ['admin'],
      delivery_channels: ['in_app']
    });

    await supabase
      .from('smart_notifications')
      .insert(notifications);

    console.log('Admin privileges operation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: message,
        operation: transferType
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
