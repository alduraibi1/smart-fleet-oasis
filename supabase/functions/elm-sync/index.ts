import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  sync_type: 'manual' | 'scheduled' | 'api';
  file_data?: any[];
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

    const { sync_type, file_data }: SyncRequest = await req.json();
    
    console.log(`Starting Elm sync - Type: ${sync_type}`);

    // إحصائيات المزامنة
    let recordsProcessed = 0;
    let recordsAdded = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const changesSummary: any = {
      newVehicles: [],
      updatedVehicles: [],
      errors: [],
    };

    // إذا لم تكن هناك بيانات، نقوم بمحاكاة عملية مزامنة
    // في التطبيق الحقيقي، ستحتاج إلى الاتصال بـ API علم أو قراءة ملف Excel
    if (!file_data || file_data.length === 0) {
      console.log('No data provided - simulation mode');
      
      // هنا يمكنك إضافة منطق للاتصال بـ API علم
      // const elmApiData = await fetchFromElmAPI();
      
      // أو قراءة ملف من storage
      // const fileData = await readElmFileFromStorage();
    }

    // معالجة البيانات (مثال توضيحي)
    if (file_data && Array.isArray(file_data)) {
      for (const vehicleData of file_data) {
        try {
          recordsProcessed++;

          // تحقق من وجود المركبة
          const { data: existingVehicle } = await supabaseClient
            .from('vehicles')
            .select('id')
            .eq('plate_number', vehicleData.plate_number)
            .single();

          if (existingVehicle) {
            // تحديث مركبة موجودة
            const { error: updateError } = await supabaseClient
              .from('vehicles')
              .update({
                registration_type: vehicleData.registration_type,
                inspection_expiry: vehicleData.inspection_expiry,
                inspection_status: vehicleData.inspection_status,
                insurance_expiry: vehicleData.insurance_expiry,
                insurance_status: vehicleData.insurance_status,
                registration_expiry: vehicleData.registration_expiry,
                renewal_fees: vehicleData.renewal_fees,
                renewal_status: vehicleData.renewal_status,
              })
              .eq('id', existingVehicle.id);

            if (updateError) throw updateError;

            recordsUpdated++;
            changesSummary.updatedVehicles.push({
              plate_number: vehicleData.plate_number,
              changes: 'تحديث بيانات علم',
            });
          } else {
            // إضافة مركبة جديدة
            const { error: insertError } = await supabaseClient
              .from('vehicles')
              .insert({
                plate_number: vehicleData.plate_number,
                brand: vehicleData.brand,
                model: vehicleData.model,
                year: vehicleData.year,
                registration_type: vehicleData.registration_type,
                inspection_expiry: vehicleData.inspection_expiry,
                inspection_status: vehicleData.inspection_status,
                insurance_expiry: vehicleData.insurance_expiry,
                insurance_status: vehicleData.insurance_status,
                registration_expiry: vehicleData.registration_expiry,
                renewal_fees: vehicleData.renewal_fees,
                renewal_status: vehicleData.renewal_status,
                status: 'available',
                daily_rate: 0,
                mileage: 0,
                fuel_type: 'gasoline',
                transmission: 'automatic',
                seating_capacity: 5,
              });

            if (insertError) throw insertError;

            recordsAdded++;
            changesSummary.newVehicles.push({
              plate_number: vehicleData.plate_number,
              brand: vehicleData.brand,
              model: vehicleData.model,
            });
          }
        } catch (error) {
          console.error(`Error processing vehicle ${vehicleData?.plate_number}:`, error);
          recordsFailed++;
          changesSummary.errors.push({
            plate_number: vehicleData?.plate_number,
            error: error.message,
          });
        }
      }
    }

    // تحديد حالة المزامنة
    const syncStatus = recordsFailed === 0 ? 'completed' : 
                       recordsFailed < recordsProcessed ? 'partial' : 'failed';

    // حفظ سجل المزامنة
    const { error: logError } = await supabaseClient
      .from('elm_sync_logs')
      .insert({
        sync_date: new Date().toISOString(),
        sync_type,
        records_processed: recordsProcessed,
        records_added: recordsAdded,
        records_updated: recordsUpdated,
        records_failed: recordsFailed,
        sync_status: syncStatus,
        changes_summary: changesSummary,
      });

    if (logError) {
      console.error('Error saving sync log:', logError);
    }

    // تحديث إعدادات المزامنة
    const { error: configError } = await supabaseClient
      .from('elm_sync_config')
      .update({
        last_sync: new Date().toISOString(),
        next_sync: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +24 hours
      })
      .limit(1);

    if (configError) {
      console.error('Error updating sync config:', configError);
    }

    // إرسال إشعارات إذا لزم الأمر
    if (recordsAdded > 0 || recordsFailed > 0) {
      await supabaseClient
        .from('smart_notifications')
        .insert({
          title: 'مزامنة علم مكتملة',
          message: `تمت معالجة ${recordsProcessed} سجل. مضاف: ${recordsAdded}، محدث: ${recordsUpdated}${recordsFailed > 0 ? `، فشل: ${recordsFailed}` : ''}`,
          type: syncStatus === 'completed' ? 'success' : syncStatus === 'partial' ? 'warning' : 'error',
          category: 'vehicles',
          priority: recordsFailed > 0 ? 'high' : 'medium',
          reference_type: 'elm_sync',
          target_roles: ['admin', 'manager'],
          delivery_channels: ['in_app'],
        });
    }

    console.log(`Elm sync completed - Status: ${syncStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        sync_status: syncStatus,
        records_processed: recordsProcessed,
        records_added: recordsAdded,
        records_updated: recordsUpdated,
        records_failed: recordsFailed,
        changes_summary: changesSummary,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in elm-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
