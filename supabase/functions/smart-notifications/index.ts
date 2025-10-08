
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Smart notifications function started")

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

    console.log('🔔 بدء فحص التنبيهات الذكية...')

    // فحص جميع التنبيهات
    const maintenanceDueCount = await checkMaintenanceDue(supabase);
    const maintenanceOverdueCount = await checkMaintenanceOverdue(supabase);
    const lowStockCount = await checkLowStock(supabase);
    const expiredItemsCount = await checkExpiredItems(supabase);
    const expiringItemsCount = await checkExpiringItems(supabase);
    const documentExpiryCount = await checkDocumentExpiry(supabase);
    const insuranceExpiryCount = await checkInsuranceExpiry(supabase);
    const vehicleInsuranceExpiryCount = await checkVehicleInsuranceExpiry(supabase);
    const vehicleInspectionExpiryCount = await checkVehicleInspectionExpiry(supabase);
    const vehicleRegistrationExpiryCount = await checkVehicleRegistrationExpiry(supabase);
    const contractExpiryCount = await checkContractExpiry(supabase);
    const idleVehiclesCount = await checkIdleVehicles(supabase);
    const customerArrearsCount = await checkCustomerArrears(supabase);

    const totalNotifications = maintenanceDueCount + maintenanceOverdueCount + lowStockCount + expiredItemsCount + expiringItemsCount + documentExpiryCount + insuranceExpiryCount + vehicleInsuranceExpiryCount + vehicleInspectionExpiryCount + vehicleRegistrationExpiryCount + contractExpiryCount + idleVehiclesCount + customerArrearsCount;

    console.log('✅ تم إنشاء', totalNotifications, 'تنبيه جديد')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `تم فحص جميع التنبيهات وإنشاء ${totalNotifications} تنبيه جديد`,
        data: {
          maintenanceDue: maintenanceDueCount,
          maintenanceOverdue: maintenanceOverdueCount,
          lowStock: lowStockCount,
          expiredItems: expiredItemsCount,
          expiringItems: expiringItemsCount,
          documentExpiry: documentExpiryCount,
          insuranceExpiry: insuranceExpiryCount,
          vehicleInsuranceExpiry: vehicleInsuranceExpiryCount,
          vehicleInspectionExpiry: vehicleInspectionExpiryCount,
          vehicleRegistrationExpiry: vehicleRegistrationExpiryCount,
          contractExpiry: contractExpiryCount,
          idleVehicles: idleVehiclesCount,
          customerArrears: customerArrearsCount,
          total: totalNotifications
        },
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
    console.error('❌ خطأ في نظام التنبيهات:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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

// فحص الصيانة المستحقة
async function checkMaintenanceDue(supabase: any): Promise<number> {
  console.log('🔧 فحص الصيانة المستحقة...')
  
  const today = new Date()
  const threeDaysLater = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000))
  
  const { data: dueMaintenance } = await supabase
    .from('maintenance_schedules')
    .select(`
      *,
      vehicles (plate_number, brand, model)
    `)
    .eq('status', 'scheduled')
    .lte('scheduled_date', threeDaysLater.toISOString().split('T')[0])
    .gte('scheduled_date', today.toISOString().split('T')[0])

  let count = 0
  if (dueMaintenance && dueMaintenance.length > 0) {
    for (const maintenance of dueMaintenance) {
      await createNotification(supabase, {
        type: 'maintenance_due',
        title: 'صيانة مستحقة',
        message: `صيانة مجدولة للمركبة ${maintenance.vehicles?.plate_number} في ${new Date(maintenance.scheduled_date).toLocaleDateString('ar-SA')}`,
        severity: 'warning',
        reference_type: 'maintenance_schedule',
        reference_id: maintenance.id,
        category: 'maintenance',
        priority: 'medium',
        delivery_channels: ['in_app', 'email'],
        target_roles: ['mechanic', 'manager', 'admin'],
        action_required: true,
        metadata: {
          vehicle_plate: maintenance.vehicles?.plate_number,
          maintenance_type: maintenance.maintenance_type,
          scheduled_date: maintenance.scheduled_date,
          days_remaining: Math.ceil((new Date(maintenance.scheduled_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        }
      })
      count++
    }
  }
  return count
}

// فحص الصيانة المتأخرة
async function checkMaintenanceOverdue(supabase: any): Promise<number> {
  console.log('⚠️ فحص الصيانة المتأخرة...')
  
  const today = new Date()
  
  const { data: overdueMaintenance } = await supabase
    .from('maintenance_schedules')
    .select(`
      *,
      vehicles (plate_number, brand, model)
    `)
    .eq('status', 'scheduled')
    .lt('scheduled_date', today.toISOString().split('T')[0])

  let count = 0
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
        category: 'maintenance',
        priority: 'urgent',
        delivery_channels: ['in_app', 'email', 'sms'],
        target_roles: ['mechanic', 'manager', 'admin'],
        action_required: true,
        metadata: {
          vehicle_plate: maintenance.vehicles?.plate_number,
          maintenance_type: maintenance.maintenance_type,
          scheduled_date: maintenance.scheduled_date,
          days_overdue: Math.ceil((today.getTime() - new Date(maintenance.scheduled_date).getTime()) / (1000 * 60 * 60 * 24))
        }
      })
      count++
    }
  }
  return count
}

// فحص المخزون المنخفض
async function checkLowStock(supabase: any): Promise<number> {
  console.log('📦 فحص المخزون المنخفض...')
  
  const { data: lowStockItems } = await supabase
    .from('inventory_items')
    .select(`
      *,
      inventory_categories (name)
    `)
    .eq('is_active', true)
    .filter('current_stock', 'lte', 'minimum_stock')

  let count = 0
  if (lowStockItems && lowStockItems.length > 0) {
    for (const item of lowStockItems) {
      const stockPercentage = item.minimum_stock > 0 ? (item.current_stock / item.minimum_stock) * 100 : 0
      const severity = stockPercentage <= 25 ? 'error' : 'warning'
      const priority = stockPercentage <= 25 ? 'urgent' : 'high'

      await createNotification(supabase, {
        type: 'low_stock',
        title: 'مخزون منخفض',
        message: `المخزون منخفض للصنف: ${item.name} (${item.current_stock} متبقي من ${item.minimum_stock})`,
        severity,
        reference_type: 'inventory_item',
        reference_id: item.id,
        category: 'inventory',
        priority,
        delivery_channels: ['in_app', 'email'],
        target_roles: ['inventory_manager', 'manager', 'admin'],
        action_required: true,
        metadata: {
          item_name: item.name,
          current_stock: item.current_stock,
          minimum_stock: item.minimum_stock,
          stock_percentage: stockPercentage,
          sku: item.sku,
          category: item.inventory_categories?.name
        }
      })
      count++
    }
  }
  return count
}

// فحص الأصناف منتهية الصلاحية
async function checkExpiredItems(supabase: any): Promise<number> {
  console.log('⏰ فحص الأصناف منتهية الصلاحية...')
  
  const today = new Date()
  
  const { data: expiredItems } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .not('expiry_date', 'is', null)
    .lt('expiry_date', today.toISOString().split('T')[0])

  let count = 0
  if (expiredItems && expiredItems.length > 0) {
    for (const item of expiredItems) {
      const daysExpired = Math.ceil((today.getTime() - new Date(item.expiry_date).getTime()) / (1000 * 60 * 60 * 24))
      
      await createNotification(supabase, {
        type: 'item_expired',
        title: 'صنف منتهي الصلاحية',
        message: `الصنف ${item.name} منتهي الصلاحية منذ ${daysExpired} يوم (${new Date(item.expiry_date).toLocaleDateString('ar-SA')})`,
        severity: 'error',
        reference_type: 'inventory_item',
        reference_id: item.id,
        category: 'inventory',
        priority: 'urgent',
        delivery_channels: ['in_app', 'email'],
        target_roles: ['inventory_manager', 'manager', 'admin'],
        action_required: true,
        metadata: {
          item_name: item.name,
          expiry_date: item.expiry_date,
          days_expired: daysExpired,
          current_stock: item.current_stock,
          sku: item.sku
        }
      })
      count++
    }
  }
  return count
}

// فحص الأصناف التي ستنتهي صلاحيتها
async function checkExpiringItems(supabase: any): Promise<number> {
  console.log('⏳ فحص الأصناف التي ستنتهي صلاحيتها...')
  
  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
  
  const { data: expiringItems } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .not('expiry_date', 'is', null)
    .lte('expiry_date', thirtyDaysLater.toISOString().split('T')[0])
    .gte('expiry_date', today.toISOString().split('T')[0])

  let count = 0
  if (expiringItems && expiringItems.length > 0) {
    for (const item of expiringItems) {
      const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const severity = daysUntilExpiry <= 7 ? 'error' : 'warning'
      const priority = daysUntilExpiry <= 7 ? 'urgent' : daysUntilExpiry <= 15 ? 'high' : 'medium'
      
      await createNotification(supabase, {
        type: 'item_expiring',
        title: 'انتهاء صلاحية قريب',
        message: `الصنف ${item.name} ستنتهي صلاحيته خلال ${daysUntilExpiry} يوم`,
        severity,
        reference_type: 'inventory_item',
        reference_id: item.id,
        category: 'inventory',
        priority,
        delivery_channels: ['in_app', 'email'],
        target_roles: ['inventory_manager', 'manager', 'admin'],
        action_required: daysUntilExpiry <= 7,
        metadata: {
          item_name: item.name,
          expiry_date: item.expiry_date,
          days_until_expiry: daysUntilExpiry,
          current_stock: item.current_stock,
          sku: item.sku
        }
      })
      count++
    }
  }
  return count
}

// فحص انتهاء صلاحية الوثائق
async function checkDocumentExpiry(supabase: any): Promise<number> {
  console.log('📄 فحص انتهاء صلاحية الوثائق...')
  
  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
  
  const { data: expiringDocs } = await supabase
    .from('customer_documents')
    .select(`
      *,
      customers (name, phone)
    `)
    .eq('status', 'valid')
    .not('expiry_date', 'is', null)
    .lte('expiry_date', thirtyDaysLater.toISOString().split('T')[0])
    .gte('expiry_date', today.toISOString().split('T')[0])

  let count = 0
  if (expiringDocs && expiringDocs.length > 0) {
    for (const doc of expiringDocs) {
      const daysUntilExpiry = Math.ceil((new Date(doc.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const severity = daysUntilExpiry <= 7 ? 'error' : 'warning'
      const priority = daysUntilExpiry <= 7 ? 'urgent' : 'high'
      
      await createNotification(supabase, {
        type: 'document_expiring',
        title: 'وثيقة ستنتهي صلاحيتها',
        message: `وثيقة ${doc.document_name} للعميل ${doc.customers?.name} ستنتهي صلاحيتها خلال ${daysUntilExpiry} يوم`,
        severity,
        reference_type: 'customer_document',
        reference_id: doc.id,
        category: 'documents',
        priority,
        delivery_channels: ['in_app', 'email'],
        target_roles: ['employee', 'manager', 'admin'],
        action_required: daysUntilExpiry <= 7,
        metadata: {
          document_name: doc.document_name,
          document_type: doc.document_type,
          customer_name: doc.customers?.name,
          customer_phone: doc.customers?.phone,
          expiry_date: doc.expiry_date,
          days_until_expiry: daysUntilExpiry
        }
      })
      count++
    }
  }
  return count
}

// فحص انتهاء صلاحية التأمين
async function checkInsuranceExpiry(supabase: any): Promise<number> {
  console.log('🛡️ فحص انتهاء صلاحية التأمين...')
  
  const today = new Date()
  const sixtyDaysLater = new Date(today.getTime() + (60 * 24 * 60 * 60 * 1000))
  
  const { data: expiringInsurance } = await supabase
    .from('vehicle_insurance')
    .select(`
      *,
      vehicles (plate_number, brand, model)
    `)
    .eq('is_active', true)
    .lte('end_date', sixtyDaysLater.toISOString().split('T')[0])
    .gte('end_date', today.toISOString().split('T')[0])

  let count = 0
  if (expiringInsurance && expiringInsurance.length > 0) {
    for (const insurance of expiringInsurance) {
      const daysUntilExpiry = Math.ceil((new Date(insurance.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const severity = daysUntilExpiry <= 14 ? 'error' : 'warning'
      const priority = daysUntilExpiry <= 7 ? 'urgent' : daysUntilExpiry <= 14 ? 'high' : 'medium'
      
      await createNotification(supabase, {
        type: 'insurance_expiring',
        title: 'انتهاء تأمين المركبة',
        message: `تأمين المركبة ${insurance.vehicles?.plate_number} سينتهي خلال ${daysUntilExpiry} يوم`,
        severity,
        reference_type: 'vehicle_insurance',
        reference_id: insurance.id,
        category: 'insurance',
        priority,
        delivery_channels: ['in_app', 'email'],
        target_roles: ['employee', 'manager', 'admin'],
        action_required: daysUntilExpiry <= 14,
        metadata: {
          vehicle_plate: insurance.vehicles?.plate_number,
          vehicle_info: `${insurance.vehicles?.brand} ${insurance.vehicles?.model}`,
          insurance_company: insurance.insurance_company,
          policy_number: insurance.policy_number,
          end_date: insurance.end_date,
          days_until_expiry: daysUntilExpiry
        }
      })
      count++
    }
  }
  return count
}

// فحص انتهاء العقود
async function checkContractExpiry(supabase: any): Promise<number> {
  console.log('📋 فحص انتهاء العقود...')
  
  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000))
  
  const { data: expiringContracts } = await supabase
    .from('rental_contracts')
    .select(`
      *,
      customers (name, phone),
      vehicles (plate_number, brand, model)
    `)
    .in('status', ['active', 'confirmed'])
    .lte('end_date', sevenDaysLater.toISOString().split('T')[0])
    .gte('end_date', today.toISOString().split('T')[0])

  let count = 0
  if (expiringContracts && expiringContracts.length > 0) {
    for (const contract of expiringContracts) {
      const daysUntilExpiry = Math.ceil((new Date(contract.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const severity = daysUntilExpiry <= 2 ? 'error' : 'warning'
      const priority = daysUntilExpiry <= 1 ? 'urgent' : 'high'
      
      await createNotification(supabase, {
        type: 'contract_expiring',
        title: 'انتهاء عقد إيجار',
        message: `عقد إيجار المركبة ${contract.vehicles?.plate_number} للعميل ${contract.customers?.name} سينتهي خلال ${daysUntilExpiry} يوم`,
        severity,
        reference_type: 'rental_contract',
        reference_id: contract.id,
        category: 'contracts',
        priority,
        delivery_channels: ['in_app', 'email'],
        target_roles: ['employee', 'manager', 'admin'],
        action_required: true,
        metadata: {
          contract_number: contract.contract_number,
          customer_name: contract.customers?.name,
          customer_phone: contract.customers?.phone,
          vehicle_plate: contract.vehicles?.plate_number,
          end_date: contract.end_date,
          days_until_expiry: daysUntilExpiry,
          total_amount: contract.total_amount
        }
      })
      count++
    }
  }
  return count
}

// فحص المركبات الخاملة
async function checkIdleVehicles(supabase: any): Promise<number> {
  console.log('🚗 فحص المركبات الخاملة...')
  
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
  
  // البحث عن المركبات المتاحة التي لم يتم تأجيرها لأكثر من 30 يوم
  const { data: idleVehicles } = await supabase
    .from('vehicles')
    .select(`
      *,
      rental_contracts!inner (end_date)
    `)
    .eq('status', 'available')
    .lt('rental_contracts.end_date', thirtyDaysAgo.toISOString().split('T')[0])

  let count = 0
  if (idleVehicles && idleVehicles.length > 0) {
    for (const vehicle of idleVehicles) {
      const daysSinceLastRental = Math.ceil((today.getTime() - new Date(vehicle.rental_contracts[0]?.end_date || vehicle.created_at).getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastRental >= 30) {
        await createNotification(supabase, {
          type: 'vehicle_idle',
          title: 'مركبة خاملة',
          message: `المركبة ${vehicle.plate_number} خاملة لمدة ${daysSinceLastRental} يوم بدون تأجير`,
          severity: daysSinceLastRental >= 60 ? 'error' : 'warning',
          reference_type: 'vehicle',
          reference_id: vehicle.id,
          category: 'operations',
          priority: daysSinceLastRental >= 60 ? 'high' : 'medium',
          delivery_channels: ['in_app'],
          target_roles: ['manager', 'admin'],
          action_required: daysSinceLastRental >= 60,
          metadata: {
            vehicle_plate: vehicle.plate_number,
            vehicle_info: `${vehicle.brand} ${vehicle.model}`,
            days_idle: daysSinceLastRental,
            daily_rate: vehicle.daily_rate,
            potential_revenue_loss: daysSinceLastRental * vehicle.daily_rate
          }
        })
        count++
      }
    }
  }
  return count
}

// فحص العملاء المتعثرين
async function checkCustomerArrears(supabase: any): Promise<number> {
  console.log('💰 فحص العملاء المتعثرين...')
  
  // استدعاء الدالة الموجودة
  const { data, error } = await supabase.rpc('check_and_notify_customer_arrears')
  
  if (error) {
    console.error('خطأ في فحص العملاء المتعثرين:', error)
    return 0
  }
  
  return data || 0
}

// Check vehicle insurance expiry
async function checkVehicleInsuranceExpiry(supabase: any): Promise<number> {
  const today = new Date()
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, plate_number, brand, model, insurance_expiry')
    .not('insurance_expiry', 'is', null)
    .lte('insurance_expiry', thirtyDays.toISOString().split('T')[0])

  let count = 0
  for (const v of vehicles || []) {
    const days = Math.ceil((new Date(v.insurance_expiry).getTime() - today.getTime()) / (1000*60*60*24))
    await createNotification(supabase, {
      type: days < 0 ? 'error' : 'warning',
      title: days < 0 ? 'تأمين منتهي' : 'انتهاء تأمين',
      message: `تأمين ${v.plate_number} ${days < 0 ? 'منتهي' : 'سينتهي خلال ' + days + ' يوم'}`,
      severity: days < 0 ? 'error' : 'warning',
      reference_type: 'vehicle',
      reference_id: v.id,
      category: 'vehicles',
      priority: days <= 7 ? 'urgent' : 'high',
      delivery_channels: ['in_app', 'email'],
      target_roles: ['admin', 'manager'],
      metadata: { plate_number: v.plate_number, days_until_expiry: days }
    })
    count++
  }
  return count
}

async function checkVehicleInspectionExpiry(supabase: any): Promise<number> {
  const today = new Date()
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, plate_number, brand, model, inspection_expiry')
    .not('inspection_expiry', 'is', null)
    .lte('inspection_expiry', thirtyDays.toISOString().split('T')[0])

  let count = 0
  for (const v of vehicles || []) {
    const days = Math.ceil((new Date(v.inspection_expiry).getTime() - today.getTime()) / (1000*60*60*24))
    await createNotification(supabase, {
      type: days < 0 ? 'error' : 'warning',
      title: days < 0 ? 'فحص منتهي' : 'انتهاء فحص',
      message: `فحص ${v.plate_number} ${days < 0 ? 'منتهي' : 'سينتهي خلال ' + days + ' يوم'}`,
      severity: days < 0 ? 'error' : 'warning',
      reference_type: 'vehicle',
      reference_id: v.id,
      category: 'vehicles',
      priority: days <= 7 ? 'urgent' : 'high',
      delivery_channels: ['in_app', 'email'],
      target_roles: ['admin', 'manager'],
      metadata: { plate_number: v.plate_number, days_until_expiry: days }
    })
    count++
  }
  return count
}

async function checkVehicleRegistrationExpiry(supabase: any): Promise<number> {
  const today = new Date()
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, plate_number, brand, model, registration_expiry')
    .not('registration_expiry', 'is', null)
    .lte('registration_expiry', thirtyDays.toISOString().split('T')[0])

  let count = 0
  for (const v of vehicles || []) {
    const days = Math.ceil((new Date(v.registration_expiry).getTime() - today.getTime()) / (1000*60*60*24))
    await createNotification(supabase, {
      type: days < 0 ? 'error' : 'warning',
      title: days < 0 ? 'استمارة منتهية' : 'انتهاء استمارة',
      message: `استمارة ${v.plate_number} ${days < 0 ? 'منتهية' : 'ستنتهي خلال ' + days + ' يوم'}`,
      severity: days < 0 ? 'error' : 'warning',
      reference_type: 'vehicle',
      reference_id: v.id,
      category: 'vehicles',
      priority: days <= 7 ? 'urgent' : 'high',
      delivery_channels: ['in_app', 'email'],
      target_roles: ['admin', 'manager'],
      metadata: { plate_number: v.plate_number, days_until_expiry: days }
    })
    count++
  }
  return count
}

// إنشاء تنبيه جديد
async function createNotification(supabase: any, notificationData: any): Promise<void> {
  // التحقق من عدم وجود تنبيه مماثل في آخر 24 ساعة
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const { data: existingNotification } = await supabase
    .from('smart_notifications')
    .select('id')
    .eq('type', notificationData.type)
    .eq('reference_type', notificationData.reference_type)
    .eq('reference_id', notificationData.reference_id)
    .gte('created_at', oneDayAgo.toISOString())
    .limit(1)

  if (existingNotification && existingNotification.length > 0) {
    console.log(`⚠️ تنبيه موجود بالفعل: ${notificationData.reference_type}/${notificationData.reference_id}`)
    return
  }

  // إنشاء التنبيه الجديد
  const { metadata, ...notificationFields } = notificationData;
  const { error } = await supabase
    .from('smart_notifications')
    .insert([{
      ...notificationFields,
      status: 'unread',
      auto_generated: true,
      reference_data: metadata || {}
    }])

  if (error) {
    console.error('❌ خطأ في إنشاء التنبيه:', error)
  } else {
    console.log(`✅ تم إنشاء تنبيه: ${notificationData.title}`)
  }
}
