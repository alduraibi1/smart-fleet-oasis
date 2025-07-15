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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('بدء التحقق من التنبيهات الذكية...')

    // 1. التحقق من الصيانة المستحقة
    await checkMaintenanceDue(supabase)
    
    // 2. التحقق من نفاد المخزون
    await checkLowStock(supabase)
    
    // 3. التحقق من انتهاء صلاحية القطع
    await checkExpiredItems(supabase)
    
    // 4. التحقق من انتهاء صلاحية الوثائق
    await checkDocumentExpiry(supabase)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم التحقق من جميع التنبيهات بنجاح',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('خطأ في نظام التنبيهات:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

// التحقق من الصيانة المستحقة
async function checkMaintenanceDue(supabase: any) {
  console.log('التحقق من الصيانة المستحقة...')
  
  const today = new Date()
  const threeDaysLater = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000))
  
  // البحث عن الصيانة المجدولة خلال الأيام القادمة
  const { data: dueMaintenance } = await supabase
    .from('maintenance_schedules')
    .select(`
      *,
      vehicles (plate_number, brand, model)
    `)
    .eq('status', 'scheduled')
    .lte('scheduled_date', threeDaysLater.toISOString().split('T')[0])
    .gte('scheduled_date', today.toISOString().split('T')[0])

  if (dueMaintenance && dueMaintenance.length > 0) {
    for (const maintenance of dueMaintenance) {
      await createNotification(supabase, {
        type: 'maintenance_due',
        title: 'صيانة مستحقة',
        message: `صيانة مجدولة للمركبة ${maintenance.vehicles?.plate_number} في ${new Date(maintenance.scheduled_date).toLocaleDateString('ar-SA')}`,
        severity: 'warning',
        reference_type: 'maintenance_schedule',
        reference_id: maintenance.id,
        metadata: {
          vehicle_plate: maintenance.vehicles?.plate_number,
          maintenance_type: maintenance.maintenance_type,
          scheduled_date: maintenance.scheduled_date
        }
      })
    }
    console.log(`تم إنشاء ${dueMaintenance.length} تنبيه صيانة`)
  }

  // البحث عن الصيانة المتأخرة
  const { data: overdueMaintenance } = await supabase
    .from('maintenance_schedules')
    .select(`
      *,
      vehicles (plate_number, brand, model)
    `)
    .eq('status', 'scheduled')
    .lt('scheduled_date', today.toISOString().split('T')[0])

  if (overdueMaintenance && overdueMaintenance.length > 0) {
    for (const maintenance of overdueMaintenance) {
      // تحديث حالة الصيانة إلى متأخرة
      await supabase
        .from('maintenance_schedules')
        .update({ status: 'overdue' })
        .eq('id', maintenance.id)

      await createNotification(supabase, {
        type: 'maintenance_overdue',
        title: 'صيانة متأخرة',
        message: `صيانة متأخرة للمركبة ${maintenance.vehicles?.plate_number} كانت مجدولة في ${new Date(maintenance.scheduled_date).toLocaleDateString('ar-SA')}`,
        severity: 'error',
        reference_type: 'maintenance_schedule',
        reference_id: maintenance.id,
        metadata: {
          vehicle_plate: maintenance.vehicles?.plate_number,
          maintenance_type: maintenance.maintenance_type,
          scheduled_date: maintenance.scheduled_date
        }
      })
    }
    console.log(`تم إنشاء ${overdueMaintenance.length} تنبيه صيانة متأخرة`)
  }
}

// التحقق من نفاد المخزون
async function checkLowStock(supabase: any) {
  console.log('التحقق من نفاد المخزون...')
  
  const { data: lowStockItems } = await supabase
    .from('inventory_items')
    .select(`
      *,
      inventory_categories (name)
    `)
    .eq('is_active', true)
    .filter('current_stock', 'lte', 'minimum_stock')

  if (lowStockItems && lowStockItems.length > 0) {
    for (const item of lowStockItems) {
      await createNotification(supabase, {
        type: 'low_stock',
        title: 'مخزون منخفض',
        message: `المخزون منخفض للصنف: ${item.name} (${item.current_stock} متبقي)`,
        severity: 'warning',
        reference_type: 'inventory_item',
        reference_id: item.id,
        metadata: {
          item_name: item.name,
          current_stock: item.current_stock,
          minimum_stock: item.minimum_stock,
          category: item.inventory_categories?.name
        }
      })
    }
    console.log(`تم إنشاء ${lowStockItems.length} تنبيه مخزون منخفض`)
  }
}

// التحقق من انتهاء صلاحية القطع
async function checkExpiredItems(supabase: any) {
  console.log('التحقق من انتهاء صلاحية القطع...')
  
  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
  
  // القطع التي ستنتهي صلاحيتها خلال 30 يوم
  const { data: expiringItems } = await supabase
    .from('inventory_items')
    .select(`
      *,
      inventory_categories (name)
    `)
    .eq('is_active', true)
    .not('expiry_date', 'is', null)
    .lte('expiry_date', thirtyDaysLater.toISOString().split('T')[0])
    .gte('expiry_date', today.toISOString().split('T')[0])

  if (expiringItems && expiringItems.length > 0) {
    for (const item of expiringItems) {
      const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      await createNotification(supabase, {
        type: 'item_expiring',
        title: 'انتهاء صلاحية قريب',
        message: `الصنف ${item.name} ستنتهي صلاحيته خلال ${daysUntilExpiry} يوم`,
        severity: daysUntilExpiry <= 7 ? 'error' : 'warning',
        reference_type: 'inventory_item',
        reference_id: item.id,
        metadata: {
          item_name: item.name,
          expiry_date: item.expiry_date,
          days_until_expiry: daysUntilExpiry,
          current_stock: item.current_stock
        }
      })
    }
    console.log(`تم إنشاء ${expiringItems.length} تنبيه انتهاء صلاحية`)
  }

  // القطع منتهية الصلاحية
  const { data: expiredItems } = await supabase
    .from('inventory_items')
    .select(`
      *,
      inventory_categories (name)
    `)
    .eq('is_active', true)
    .not('expiry_date', 'is', null)
    .lt('expiry_date', today.toISOString().split('T')[0])

  if (expiredItems && expiredItems.length > 0) {
    for (const item of expiredItems) {
      await createNotification(supabase, {
        type: 'item_expired',
        title: 'صنف منتهي الصلاحية',
        message: `الصنف ${item.name} منتهي الصلاحية منذ ${new Date(item.expiry_date).toLocaleDateString('ar-SA')}`,
        severity: 'error',
        reference_type: 'inventory_item',
        reference_id: item.id,
        metadata: {
          item_name: item.name,
          expiry_date: item.expiry_date,
          current_stock: item.current_stock
        }
      })
    }
    console.log(`تم إنشاء ${expiredItems.length} تنبيه انتهاء صلاحية`)
  }
}

// التحقق من انتهاء صلاحية الوثائق
async function checkDocumentExpiry(supabase: any) {
  console.log('التحقق من انتهاء صلاحية الوثائق...')
  
  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
  
  const { data: expiringDocs } = await supabase
    .from('vehicle_documents')
    .select(`
      *,
      vehicles (plate_number, brand, model)
    `)
    .eq('status', 'valid')
    .not('expiry_date', 'is', null)
    .lte('expiry_date', thirtyDaysLater.toISOString().split('T')[0])
    .gte('expiry_date', today.toISOString().split('T')[0])

  if (expiringDocs && expiringDocs.length > 0) {
    for (const doc of expiringDocs) {
      const daysUntilExpiry = Math.ceil((new Date(doc.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      await createNotification(supabase, {
        type: 'document_expiring',
        title: 'وثيقة ستنتهي صلاحيتها',
        message: `وثيقة ${doc.name} للمركبة ${doc.vehicles?.plate_number} ستنتهي صلاحيتها خلال ${daysUntilExpiry} يوم`,
        severity: daysUntilExpiry <= 7 ? 'error' : 'warning',
        reference_type: 'vehicle_document',
        reference_id: doc.id,
        metadata: {
          document_name: doc.name,
          vehicle_plate: doc.vehicles?.plate_number,
          expiry_date: doc.expiry_date,
          days_until_expiry: daysUntilExpiry
        }
      })
    }
    console.log(`تم إنشاء ${expiringDocs.length} تنبيه انتهاء صلاحية وثائق`)
  }
}

// إنشاء تنبيه جديد
async function createNotification(supabase: any, notificationData: any) {
  // التحقق من عدم وجود تنبيه مماثل في آخر 24 ساعة
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const { data: existingNotification } = await supabase
    .from('notifications')
    .select('id')
    .eq('type', notificationData.type)
    .eq('reference_id', notificationData.reference_id)
    .gte('created_at', oneDayAgo.toISOString())
    .limit(1)

  if (existingNotification && existingNotification.length > 0) {
    console.log(`تنبيه موجود بالفعل للمرجع: ${notificationData.reference_id}`)
    return
  }

  // إنشاء التنبيه
  const { error } = await supabase
    .from('notifications')
    .insert([{
      ...notificationData,
      status: 'unread',
      auto_generated: true,
      action_required: notificationData.severity === 'error'
    }])

  if (error) {
    console.error('خطأ في إنشاء التنبيه:', error)
  } else {
    console.log(`تم إنشاء تنبيه: ${notificationData.title}`)
  }
}