import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'sync_complete' | 'new_vehicles' | 'expiry_alert' | 'sync_failed';
  data: {
    syncId?: string;
    vehicleCount?: number;
    newVehicles?: Array<{ plate_number: string; brand: string; model: string }>;
    expiringVehicles?: Array<{ 
      plate_number: string; 
      brand: string; 
      model: string;
      expiry_type: string;
      expiry_date: string;
    }>;
    errorMessage?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, data }: NotificationRequest = await req.json();
    console.log('Processing notification:', type, data);

    let title = '';
    let message = '';
    let notificationType = 'info';
    let priority = 'medium';

    switch (type) {
      case 'sync_complete':
        title = 'اكتملت المزامنة بنجاح';
        message = `تمت معالجة ${data.vehicleCount || 0} مركبة بنجاح`;
        notificationType = 'success';
        priority = 'low';
        break;

      case 'new_vehicles':
        title = 'مركبات جديدة';
        message = `تم إضافة ${data.newVehicles?.length || 0} مركبة جديدة من نظام علم`;
        if (data.newVehicles && data.newVehicles.length > 0) {
          const vehiclesList = data.newVehicles.slice(0, 3).map(v => 
            `${v.plate_number} - ${v.brand} ${v.model}`
          ).join('، ');
          message += `:\n${vehiclesList}`;
          if (data.newVehicles.length > 3) {
            message += ` و${data.newVehicles.length - 3} مركبة أخرى`;
          }
        }
        notificationType = 'info';
        priority = 'medium';
        break;

      case 'expiry_alert':
        title = 'تنبيه انتهاء صلاحية';
        message = `يوجد ${data.expiringVehicles?.length || 0} مركبة ستنتهي صلاحيتها قريباً`;
        if (data.expiringVehicles && data.expiringVehicles.length > 0) {
          const alertsList = data.expiringVehicles.slice(0, 2).map(v => 
            `${v.plate_number}: ${v.expiry_type} ينتهي في ${v.expiry_date}`
          ).join('\n');
          message += `:\n${alertsList}`;
        }
        notificationType = 'warning';
        priority = 'high';
        break;

      case 'sync_failed':
        title = 'فشلت عملية المزامنة';
        message = data.errorMessage || 'حدث خطأ أثناء المزامنة مع نظام علم';
        notificationType = 'error';
        priority = 'urgent';
        break;
    }

    // إنشاء إشعار في النظام
    const { error: notificationError } = await supabaseClient
      .from('smart_notifications')
      .insert({
        title,
        message,
        type: notificationType,
        category: 'vehicles',
        priority,
        reference_type: 'elm_sync',
        reference_id: data.syncId,
        target_roles: ['admin', 'manager'],
        delivery_channels: ['in_app'],
        reference_data: data
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    console.log('Notification created successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in elm-sync-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
