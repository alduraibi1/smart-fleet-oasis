
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read: boolean;
}

export const useSmartNotifications = () => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkContractExpirations = async () => {
    try {
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);

      const { data: expiringContracts, error } = await supabase
        .from('rental_contracts')
        .select('*, customers(name), vehicles(plate_number)')
        .eq('status', 'active')
        .lte('end_date', threeDaysLater.toISOString().split('T')[0]);

      if (error) throw error;

      for (const contract of expiringContracts || []) {
        const daysLeft = Math.ceil(
          (new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
        );

        await supabase.functions.invoke('create-smart-notification', {
          body: {
            title: 'عقد قارب على الانتهاء',
            message: `العقد ${contract.contract_number} للعميل ${contract.customers?.name} سينتهي خلال ${daysLeft} أيام`,
            type: daysLeft <= 1 ? 'error' : 'warning',
            category: 'contract_expiry',
            priority: daysLeft <= 1 ? 'urgent' : 'high',
            reference_type: 'contract',
            reference_id: contract.id
          }
        });
      }
    } catch (error) {
      console.error('Error checking contract expirations:', error);
    }
  };

  const checkMaintenanceDue = async () => {
    try {
      const { data: maintenanceSchedules, error } = await supabase
        .from('maintenance_schedules')
        .select('*, vehicles(plate_number)')
        .eq('status', 'scheduled')
        .lte('scheduled_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      for (const maintenance of maintenanceSchedules || []) {
        await supabase.functions.invoke('create-smart-notification', {
          body: {
            title: 'صيانة مستحقة',
            message: `صيانة مجدولة للمركبة ${maintenance.vehicles?.plate_number} - ${maintenance.maintenance_type}`,
            type: 'warning',
            category: 'maintenance',
            priority: 'high',
            reference_type: 'maintenance',
            reference_id: maintenance.id
          }
        });
      }
    } catch (error) {
      console.error('Error checking maintenance due:', error);
    }
  };

  const checkOverduePayments = async () => {
    try {
      const { data: overdueInvoices, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      for (const invoice of overdueInvoices || []) {
        const daysOverdue = Math.ceil(
          (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 3600 * 24)
        );

        await supabase.functions.invoke('create-smart-notification', {
          body: {
            title: 'فاتورة متأخرة',
            message: `الفاتورة ${invoice.invoice_number} للعميل ${invoice.customer_name} متأخرة ${daysOverdue} يوم`,
            type: 'error',
            category: 'payment_due',
            priority: 'urgent',
            reference_type: 'invoice',
            reference_id: invoice.id
          }
        });
      }
    } catch (error) {
      console.error('Error checking overdue payments:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ status: 'read' })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const runAllChecks = async () => {
    await Promise.all([
      checkContractExpirations(),
      checkMaintenanceDue(),
      checkOverduePayments()
    ]);
    await loadNotifications();
  };

  useEffect(() => {
    loadNotifications();
    runAllChecks();

    // تشغيل الفحوصات كل 5 دقائق
    const interval = setInterval(runAllChecks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    loading,
    markAsRead,
    runAllChecks,
    checkContractExpirations,
    checkMaintenanceDue,
    checkOverduePayments
  };
};
