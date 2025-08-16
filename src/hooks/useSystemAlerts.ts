
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemAlert } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';

export const useSystemAlerts = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      // Fetch alerts from smart_notifications table
      const { data: notifications, error } = await supabase
        .from('smart_notifications')
        .select('*')
        .eq('status', 'unread')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform notifications to alerts format
      const transformedAlerts: SystemAlert[] = (notifications || []).map(notification => ({
        id: notification.id,
        type: notification.type as SystemAlert['type'],
        title: notification.title,
        message: notification.message,
        severity: notification.severity as SystemAlert['severity'],
        entity_type: notification.reference_type as SystemAlert['entity_type'],
        entity_id: notification.reference_id || '',
        is_read: notification.status === 'read',
        created_at: notification.created_at,
      }));

      setAlerts(transformedAlerts);

    } catch (error) {
      console.error('Error fetching system alerts:', error);
      toast({
        title: "خطأ في تحميل التنبيهات",
        description: "فشل في تحميل تنبيهات النظام",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ status: 'read' })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));

    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة التنبيه",
        variant: "destructive",
      });
    }
  };

  const generateSmartAlerts = async () => {
    try {
      // Check for expiring documents
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name, license_expiry')
        .not('license_expiry', 'is', null);

      const expiringLicenses = customers?.filter(customer => {
        if (!customer.license_expiry) return false;
        const expiryDate = new Date(customer.license_expiry);
        const warningDate = new Date();
        warningDate.setDate(warningDate.getDate() + 30); // 30 days warning
        return expiryDate <= warningDate;
      });

      // Create alerts for expiring licenses
      for (const customer of expiringLicenses || []) {
        await supabase.rpc('create_smart_notification', {
          p_title: 'انتهاء صلاحية رخصة القيادة',
          p_message: `رخصة القيادة للعميل ${customer.name} ستنتهي قريباً`,
          p_type: 'document_expiry',
          p_category: 'system',
          p_priority: 'high',
          p_reference_type: 'customer',
          p_reference_id: customer.id,
        });
      }

      // Check for vehicles due for maintenance
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, plate_number, mileage')
        .eq('status', 'available');

      // Simple maintenance check - every 10,000 km
      const maintenanceDueVehicles = vehicles?.filter(vehicle => 
        vehicle.mileage && vehicle.mileage % 10000 < 500 && vehicle.mileage > 5000
      );

      for (const vehicle of maintenanceDueVehicles || []) {
        await supabase.rpc('create_smart_notification', {
          p_title: 'موعد صيانة دورية',
          p_message: `المركبة ${vehicle.plate_number} تحتاج صيانة دورية`,
          p_type: 'maintenance_due',
          p_category: 'maintenance',
          p_priority: 'medium',
          p_reference_type: 'vehicle',
          p_reference_id: vehicle.id,
        });
      }

      // Refresh alerts after generation
      await fetchAlerts();

    } catch (error) {
      console.error('Error generating smart alerts:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up real-time subscription
    const channel = supabase
      .channel('system-alerts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'smart_notifications' },
        fetchAlerts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    alerts,
    loading,
    markAsRead,
    generateSmartAlerts,
    refetch: fetchAlerts
  };
};
