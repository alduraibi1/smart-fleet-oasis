import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InventoryAlert {
  type: 'low_stock' | 'expired' | 'expiring_soon' | 'reorder_needed';
  item_id: string;
  item_name: string;
  current_stock: number;
  minimum_stock?: number;
  expiry_date?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  consumption_rate?: number;
  predicted_days_until_empty?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting smart inventory alerts check...');

    const alerts: InventoryAlert[] = [];

    // 1. Check for low stock items
    const { data: lowStockItems, error: lowStockError } = await supabase
      .from('inventory_items')
      .select(`
        id, name, current_stock, minimum_stock, 
        inventory_categories(name)
      `)
      .lte('current_stock', supabase.rpc('current_stock'))
      .eq('is_active', true);

    if (lowStockError) {
      console.error('Error fetching low stock items:', lowStockError);
    } else {
      for (const item of lowStockItems || []) {
        if (item.current_stock <= item.minimum_stock) {
          const priority = item.current_stock === 0 ? 'urgent' : 
                          item.current_stock <= item.minimum_stock * 0.2 ? 'high' : 'medium';
          
          alerts.push({
            type: 'low_stock',
            item_id: item.id,
            item_name: item.name,
            current_stock: item.current_stock,
            minimum_stock: item.minimum_stock,
            category: item.inventory_categories?.name,
            priority,
            message: item.current_stock === 0 ? 
              `نفد مخزون ${item.name} بالكامل` :
              `مخزون ${item.name} منخفض (${item.current_stock} متبقي من ${item.minimum_stock} حد أدنى)`
          });
        }
      }
    }

    // 2. Check for expired items
    const today = new Date().toISOString().split('T')[0];
    const { data: expiredItems, error: expiredError } = await supabase
      .from('inventory_items')
      .select(`
        id, name, current_stock, expiry_date,
        inventory_categories(name)
      `)
      .lt('expiry_date', today)
      .eq('is_active', true)
      .gt('current_stock', 0);

    if (expiredError) {
      console.error('Error fetching expired items:', expiredError);
    } else {
      for (const item of expiredItems || []) {
        alerts.push({
          type: 'expired',
          item_id: item.id,
          item_name: item.name,
          current_stock: item.current_stock,
          expiry_date: item.expiry_date,
          category: item.inventory_categories?.name,
          priority: 'urgent',
          message: `انتهت صلاحية ${item.name} في ${new Date(item.expiry_date).toLocaleDateString('ar-SA')}`
        });
      }
    }

    // 3. Check for items expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const futureDate = thirtyDaysFromNow.toISOString().split('T')[0];

    const { data: expiringSoonItems, error: expiringSoonError } = await supabase
      .from('inventory_items')
      .select(`
        id, name, current_stock, expiry_date,
        inventory_categories(name)
      `)
      .gte('expiry_date', today)
      .lt('expiry_date', futureDate)
      .eq('is_active', true)
      .gt('current_stock', 0);

    if (expiringSoonError) {
      console.error('Error fetching expiring soon items:', expiringSoonError);
    } else {
      for (const item of expiringSoonItems || []) {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const priority = daysUntilExpiry <= 7 ? 'high' : 
                        daysUntilExpiry <= 15 ? 'medium' : 'low';
        
        alerts.push({
          type: 'expiring_soon',
          item_id: item.id,
          item_name: item.name,
          current_stock: item.current_stock,
          expiry_date: item.expiry_date,
          category: item.inventory_categories?.name,
          priority,
          message: `ستنتهي صلاحية ${item.name} خلال ${daysUntilExpiry} يوم`
        });
      }
    }

    // 4. Calculate consumption rates and predict reorder needs
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('stock_transactions')
      .select(`
        item_id, quantity, transaction_date,
        inventory_items(id, name, current_stock, minimum_stock, reorder_point, inventory_categories(name))
      `)
      .eq('transaction_type', 'out')
      .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('transaction_date', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    } else {
      // Group transactions by item and calculate consumption rate
      const itemConsumption: { [key: string]: { item: any, totalConsumed: number, days: number } } = {};
      
      for (const transaction of recentTransactions || []) {
        if (!transaction.inventory_items) continue;
        
        const itemId = transaction.item_id;
        if (!itemConsumption[itemId]) {
          itemConsumption[itemId] = {
            item: transaction.inventory_items,
            totalConsumed: 0,
            days: 90
          };
        }
        itemConsumption[itemId].totalConsumed += transaction.quantity;
      }

      // Predict reorder needs based on consumption
      for (const [itemId, consumption] of Object.entries(itemConsumption)) {
        const dailyRate = consumption.totalConsumed / consumption.days;
        const daysUntilEmpty = consumption.item.current_stock / (dailyRate || 1);
        const reorderPoint = consumption.item.reorder_point || consumption.item.minimum_stock;
        
        if (dailyRate > 0 && (daysUntilEmpty <= 30 || consumption.item.current_stock <= reorderPoint)) {
          const priority = daysUntilEmpty <= 7 ? 'urgent' :
                          daysUntilEmpty <= 14 ? 'high' : 'medium';
          
          alerts.push({
            type: 'reorder_needed',
            item_id: itemId,
            item_name: consumption.item.name,
            current_stock: consumption.item.current_stock,
            minimum_stock: consumption.item.minimum_stock,
            category: consumption.item.inventory_categories?.name,
            priority,
            consumption_rate: dailyRate,
            predicted_days_until_empty: Math.ceil(daysUntilEmpty),
            message: `يحتاج ${consumption.item.name} لإعادة طلب - سينتهي خلال ${Math.ceil(daysUntilEmpty)} يوم بناءً على معدل الاستهلاك`
          });
        }
      }
    }

    // 5. Create smart notifications for high priority alerts
    for (const alert of alerts.filter(a => ['urgent', 'high'].includes(a.priority))) {
      try {
        await supabase.from('smart_notifications').insert({
          title: getAlertTitle(alert.type),
          message: alert.message,
          type: getNotificationType(alert.type),
          category: 'inventory',
          priority: alert.priority,
          reference_type: 'inventory_item',
          reference_id: alert.item_id,
          reference_data: {
            alert_type: alert.type,
            current_stock: alert.current_stock,
            minimum_stock: alert.minimum_stock,
            expiry_date: alert.expiry_date,
            consumption_rate: alert.consumption_rate,
            predicted_days_until_empty: alert.predicted_days_until_empty
          },
          delivery_channels: ['in_app', 'email'],
          target_roles: ['admin', 'manager', 'accountant']
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }

    console.log(`Generated ${alerts.length} inventory alerts`);
    console.log(`High priority alerts: ${alerts.filter(a => ['urgent', 'high'].includes(a.priority)).length}`);

    return new Response(
      JSON.stringify({
        success: true,
        alerts_generated: alerts.length,
        high_priority_alerts: alerts.filter(a => ['urgent', 'high'].includes(a.priority)).length,
        alerts: alerts
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in smart inventory alerts:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getAlertTitle(type: string): string {
  const titles = {
    'low_stock': 'تنبيه مخزون منخفض',
    'expired': 'تنبيه منتج منتهي الصلاحية',
    'expiring_soon': 'تنبيه قرب انتهاء الصلاحية',
    'reorder_needed': 'تنبيه إعادة طلب مطلوبة'
  };
  return titles[type] || 'تنبيه مخزون';
}

function getNotificationType(alertType: string): string {
  const types = {
    'low_stock': 'warning',
    'expired': 'error',
    'expiring_soon': 'warning',
    'reorder_needed': 'info'
  };
  return types[alertType] || 'info';
}