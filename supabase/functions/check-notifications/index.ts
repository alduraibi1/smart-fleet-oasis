import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationData {
  title: string;
  message: string;
  type: string;
  severity: string;
  reference_id?: string;
  reference_type?: string;
  action_required: boolean;
  metadata?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 بدء فحص الإشعارات المطلوبة...');

    const notifications: NotificationData[] = [];
    const today = new Date();

    // 1. فحص العقود قاربة الانتهاء (نحتاج جدول العقود أولاً - سنستخدم بيانات وهمية)
    console.log('📋 فحص العقود قاربة الانتهاء...');
    // سنضيف هذا عندما نكون لدينا جدول contracts
    
    // 2. فحص مواعيد الصيانة المطلوبة (نحتاج جدول الصيانة أولاً)
    console.log('🔧 فحص مواعيد الصيانة المطلوبة...');
    // سنضيف هذا عندما نكون لدينا جدول maintenance_schedules

    // 3. فحص المدفوعات المتأخرة من الفواتير
    console.log('💰 فحص المدفوعات المتأخرة...');
    const { data: overdueInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'pending')
      .lt('due_date', today.toISOString().split('T')[0]);

    if (invoicesError) {
      console.error('خطأ في فحص الفواتير:', invoicesError);
    } else if (overdueInvoices && overdueInvoices.length > 0) {
      for (const invoice of overdueInvoices) {
        const daysPastDue = Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
        
        // التحقق من عدم وجود إشعار مماثل بالفعل
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'payment_overdue')
          .eq('reference_id', invoice.id)
          .eq('status', 'unread')
          .single();

        if (!existingNotification) {
          notifications.push({
            title: `فاتورة متأخرة السداد`,
            message: `الفاتورة رقم ${invoice.invoice_number} للعميل ${invoice.customer_name} متأخرة ${daysPastDue} يوم. المبلغ المستحق: ${invoice.total_amount} ريال`,
            type: 'payment_overdue',
            severity: daysPastDue > 30 ? 'critical' : daysPastDue > 14 ? 'high' : 'medium',
            reference_id: invoice.id,
            reference_type: 'invoice',
            action_required: true,
            metadata: {
              invoice_number: invoice.invoice_number,
              customer_name: invoice.customer_name,
              amount: invoice.total_amount,
              days_past_due: daysPastDue,
              due_date: invoice.due_date
            }
          });
        }
      }
    }

    // 4. إنشاء إشعارات تجريبية للعقود والصيانة
    console.log('📅 إنشاء إشعارات تجريبية...');
    
    // إشعار تجريبي لعقد قارب على الانتهاء
    const contractExpiryDate = new Date();
    contractExpiryDate.setDate(contractExpiryDate.getDate() + 5);
    
    notifications.push({
      title: 'عقد قارب على الانتهاء',
      message: `عقد الإيجار للمركبة تويوتا كامري 2024 سينتهي خلال 5 أيام في تاريخ ${contractExpiryDate.toLocaleDateString('ar-SA')}`,
      type: 'contract_expiry',
      severity: 'high',
      reference_id: 'demo-contract-1',
      reference_type: 'contract',
      action_required: true,
      metadata: {
        vehicle_name: 'تويوتا كامري 2024',
        contract_end_date: contractExpiryDate.toISOString(),
        customer_name: 'أحمد محمد العلي',
        days_remaining: 5
      }
    });

    // إشعار تجريبي للصيانة
    const maintenanceDate = new Date();
    maintenanceDate.setDate(maintenanceDate.getDate() + 2);
    
    notifications.push({
      title: 'موعد صيانة مجدول',
      message: `صيانة دورية مجدولة للمركبة هيونداي إلنترا خلال يومين في تاريخ ${maintenanceDate.toLocaleDateString('ar-SA')}`,
      type: 'maintenance_due',
      severity: 'medium',
      reference_id: 'demo-vehicle-2',
      reference_type: 'vehicle',
      action_required: true,
      metadata: {
        vehicle_name: 'هيونداي إلنترا 2023',
        maintenance_type: 'صيانة دورية',
        scheduled_date: maintenanceDate.toISOString(),
        maintenance_details: 'تغيير زيت، فحص الفرامل، فحص الإطارات'
      }
    });

    // إشعار تجريبي لانتهاء الرخصة
    const licenseExpiryDate = new Date();
    licenseExpiryDate.setDate(licenseExpiryDate.getDate() + 10);
    
    notifications.push({
      title: 'رخصة قاربة على الانتهاء',
      message: `رخصة القيادة للمركبة نيسان التيما ستنتهي خلال 10 أيام في تاريخ ${licenseExpiryDate.toLocaleDateString('ar-SA')}`,
      type: 'license_expiry',
      severity: 'high',
      reference_id: 'demo-vehicle-3',
      reference_type: 'vehicle',
      action_required: true,
      metadata: {
        vehicle_name: 'نيسان التيما 2024',
        license_type: 'رخصة القيادة',
        expiry_date: licenseExpiryDate.toISOString(),
        license_number: 'DL-123456789'
      }
    });

    // إدراج الإشعارات الجديدة
    if (notifications.length > 0) {
      console.log(`📢 إنشاء ${notifications.length} إشعار جديد...`);
      
      const { data: insertedNotifications, error: insertError } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (insertError) {
        console.error('خطأ في إنشاء الإشعارات:', insertError);
        throw insertError;
      }

      console.log(`✅ تم إنشاء ${insertedNotifications?.length || 0} إشعار بنجاح`);

      // تسجيل الإشعارات في السجل
      if (insertedNotifications) {
        const historyRecords = insertedNotifications.map(notification => ({
          notification_id: notification.id,
          delivery_method: 'app',
          status: 'sent'
        }));

        await supabase
          .from('notification_history')
          .insert(historyRecords);
      }
    } else {
      console.log('ℹ️  لا توجد إشعارات جديدة للإنشاء');
    }

    // إحصائيات الإشعارات
    const { data: stats } = await supabase
      .from('notifications')
      .select('type, status, severity')
      .order('created_at', { ascending: false });

    const summary = {
      total_notifications: notifications.length,
      created_notifications: notifications.length,
      stats: stats ? {
        total: stats.length,
        unread: stats.filter(n => n.status === 'unread').length,
        by_type: stats.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        by_severity: stats.reduce((acc, n) => {
          acc[n.severity] = (acc[n.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      } : null
    };

    console.log('📊 ملخص فحص الإشعارات:', summary);

    return new Response(JSON.stringify({
      success: true,
      message: `تم فحص وإنشاء ${notifications.length} إشعار`,
      data: summary
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ خطأ في فحص الإشعارات:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);