import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface AlertsResponse {
  success: boolean;
  alerts_generated: number;
  high_priority_alerts: number;
  alerts: InventoryAlert[];
}

export const useSmartInventoryAlerts = () => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  // Manual refresh of alerts
  const checkAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-inventory-alerts');
      
      if (error) throw error;
      
      const response: AlertsResponse = data;
      
      if (response.success) {
        setAlerts(response.alerts);
        setLastCheck(new Date());
        
        // Show toast for high priority alerts
        if (response.high_priority_alerts > 0) {
          toast({
            title: "تنبيهات مخزون عاجلة",
            description: `يوجد ${response.high_priority_alerts} تنبيه مخزون يحتاج انتباه عاجل`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error checking inventory alerts:', error);
      toast({
        title: "خطأ",
        description: "فشل في فحص تنبيهات المخزون",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get alerts by priority
  const getAlertsByPriority = (priority: string) => {
    return alerts.filter(alert => alert.priority === priority);
  };

  // Get alerts by type
  const getAlertsByType = (type: string) => {
    return alerts.filter(alert => alert.type === type);
  };

  // Get critical alerts (urgent + high priority)
  const getCriticalAlerts = () => {
    return alerts.filter(alert => ['urgent', 'high'].includes(alert.priority));
  };

  // Get low stock alerts
  const getLowStockAlerts = () => {
    return getAlertsByType('low_stock');
  };

  // Get expiry alerts
  const getExpiryAlerts = () => {
    return alerts.filter(alert => ['expired', 'expiring_soon'].includes(alert.type));
  };

  // Get reorder alerts
  const getReorderAlerts = () => {
    return getAlertsByType('reorder_needed');
  };

  // Get alert statistics
  const getAlertStats = () => {
    return {
      total: alerts.length,
      urgent: getAlertsByPriority('urgent').length,
      high: getAlertsByPriority('high').length,
      medium: getAlertsByPriority('medium').length,
      low: getAlertsByPriority('low').length,
      lowStock: getLowStockAlerts().length,
      expiry: getExpiryAlerts().length,
      reorder: getReorderAlerts().length
    };
  };

  // Auto-check on mount
  useEffect(() => {
    checkAlerts();
  }, []);

  // Set up real-time subscription for inventory changes
  useEffect(() => {
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        () => {
          // Re-check alerts when inventory changes
          setTimeout(checkAlerts, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_transactions'
        },
        () => {
          // Re-check alerts when stock transactions occur
          setTimeout(checkAlerts, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    alerts,
    loading,
    lastCheck,
    checkAlerts,
    getAlertsByPriority,
    getAlertsByType,
    getCriticalAlerts,
    getLowStockAlerts,
    getExpiryAlerts,
    getReorderAlerts,
    getAlertStats
  };
};