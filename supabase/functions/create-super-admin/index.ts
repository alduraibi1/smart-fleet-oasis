import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSuperAdminRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
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

    const { email, password, fullName, phone }: CreateSuperAdminRequest = await req.json();

    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: 'البريد الإلكتروني وكلمة المرور والاسم الكامل مطلوبة' }),
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

    console.log('Creating super admin user:', email);

    // Create user with admin API
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        phone: phone || '',
        user_type: 'admin'
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: 'فشل في إنشاء المستخدم: ' + createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: 'فشل في إنشاء المستخدم' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully:', authUser.user.id);

    // Update profile to approved status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        user_type: 'admin'
      })
      .eq('id', authUser.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: authUser.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'فشل في تعيين دور الإدارة: ' + roleError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all available permissions
    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('id');

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError);
    } else if (permissions) {
      // Assign all permissions to admin role
      const rolePermissions = permissions.map(p => ({
        role: 'admin',
        permission_id: p.id
      }));

      const { error: rolePermissionError } = await supabase
        .from('role_permissions')
        .upsert(rolePermissions, { onConflict: 'role,permission_id' });

      if (rolePermissionError) {
        console.error('Error assigning permissions:', rolePermissionError);
      }
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        action: 'create_super_admin',
        table_name: 'profiles',
        record_id: authUser.user.id,
        metadata: {
          email,
          full_name: fullName,
          created_by: 'system'
        },
        severity: 'high'
      });

    // Create notification
    await supabase
      .from('smart_notifications')
      .insert({
        title: 'تم إنشاء مستخدم إداري جديد',
        message: `تم إنشاء حساب إداري جديد للمستخدم: ${fullName} (${email})`,
        type: 'success',
        category: 'system',
        priority: 'high',
        reference_type: 'user_creation',
        reference_id: authUser.user.id,
        target_roles: ['admin'],
        delivery_channels: ['in_app']
      });

    console.log('Super admin created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم إنشاء المستخدم الإداري بنجاح',
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          full_name: fullName
        }
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