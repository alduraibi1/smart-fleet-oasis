
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardData } from './useDashboardData';
import { useToast } from './use-toast';

export const useRealtimeDashboard = () => {
  const { stats, revenueData, topVehicles, recentActivity, loading, refetch } = useDashboardData();
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const { toast } = useToast();

  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Real-time update received:', payload);
    
    // Show notification for important updates
    if (payload.eventType === 'INSERT') {
      const table = payload.table;
      let message = '';
      
      switch (table) {
        case 'rental_contracts':
          message = 'تم إضافة عقد جديد';
          break;
        case 'payment_receipts':
          message = 'تم استلام دفعة جديدة';
          break;
        case 'vehicles':
          message = 'تم إضافة مركبة جديدة';
          break;
        default:
          message = 'تم تحديث البيانات';
      }
      
      toast({
        title: "تحديث فوري",
        description: message,
        duration: 3000,
      });
    }

    // Refresh data
    refetch();
    setLastUpdated(new Date());
  }, [refetch, toast]);

  useEffect(() => {
    // Set up real-time subscriptions for multiple tables
    const channels = [
      {
        name: 'vehicles-changes',
        table: 'vehicles'
      },
      {
        name: 'contracts-changes', 
        table: 'rental_contracts'
      },
      {
        name: 'receipts-changes',
        table: 'payment_receipts'
      },
      {
        name: 'vouchers-changes',
        table: 'payment_vouchers'
      },
      {
        name: 'maintenance-changes',
        table: 'vehicle_maintenance'
      }
    ];

    const subscriptions = channels.map(({ name, table }) => {
      return supabase
        .channel(name)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          (payload) => {
            handleRealtimeUpdate({ ...payload, table });
          }
        )
        .subscribe((status) => {
          console.log(`${name} subscription status:`, status);
          setIsConnected(status === 'SUBSCRIBED');
        });
    });

    // Set up periodic health check
    const healthCheck = setInterval(() => {
      // Simple ping to check connection
      supabase.from('vehicles').select('id').limit(1).then(
        () => setIsConnected(true),
        () => setIsConnected(false)
      );
    }, 30000); // Check every 30 seconds

    return () => {
      subscriptions.forEach(channel => {
        supabase.removeChannel(channel);
      });
      clearInterval(healthCheck);
    };
  }, [handleRealtimeUpdate]);

  const reconnect = useCallback(() => {
    setIsConnected(true);
    refetch();
    setLastUpdated(new Date());
  }, [refetch]);

  return {
    stats,
    revenueData,
    topVehicles,
    recentActivity,
    loading,
    isConnected,
    lastUpdated,
    refetch,
    reconnect
  };
};
