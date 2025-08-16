
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_vehicles: 0,
    available_vehicles: 0,
    rented_vehicles: 0,
    maintenance_vehicles: 0,
    total_customers: 0,
    active_contracts: 0,
    monthly_revenue: 0,
    pending_maintenance: 0,
    overdue_payments: 0,
    expiring_documents: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch vehicle statistics
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('status');

      if (vehiclesError) throw vehiclesError;

      // Fetch customer count
      const { count: customersCount, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (customersError) throw customersError;

      // Fetch active contracts
      const { count: contractsCount, error: contractsError } = await supabase
        .from('rental_contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (contractsError) throw contractsError;

      // Fetch monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: receipts, error: receiptsError } = await supabase
        .from('payment_receipts')
        .select('amount')
        .gte('payment_date', `${currentMonth}-01`)
        .eq('status', 'confirmed');

      if (receiptsError) throw receiptsError;

      // Fetch pending maintenance
      const { count: maintenanceCount, error: maintenanceError } = await supabase
        .from('vehicle_maintenance')
        .select('*', { count: 'exact', head: true })
        .in('status', ['scheduled', 'in_progress']);

      if (maintenanceError) throw maintenanceError;

      // Process vehicle statistics
      const vehicleStats = vehicles?.reduce((acc, vehicle) => {
        acc.total_vehicles++;
        switch (vehicle.status) {
          case 'available':
            acc.available_vehicles++;
            break;
          case 'rented':
            acc.rented_vehicles++;
            break;
          case 'maintenance':
            acc.maintenance_vehicles++;
            break;
        }
        return acc;
      }, {
        total_vehicles: 0,
        available_vehicles: 0,
        rented_vehicles: 0,
        maintenance_vehicles: 0,
      }) || {
        total_vehicles: 0,
        available_vehicles: 0,
        rented_vehicles: 0,
        maintenance_vehicles: 0,
      };

      // Calculate monthly revenue
      const monthlyRevenue = receipts?.reduce((sum, receipt) => sum + (receipt.amount || 0), 0) || 0;

      setStats({
        ...vehicleStats,
        total_customers: customersCount || 0,
        active_contracts: contractsCount || 0,
        monthly_revenue: monthlyRevenue,
        pending_maintenance: maintenanceCount || 0,
        overdue_payments: 0, // Will implement later
        expiring_documents: 0, // Will implement later
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "خطأ في تحميل الإحصائيات",
        description: "فشل في تحميل إحصائيات لوحة التحكم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscriptions for updates
    const vehiclesChannel = supabase
      .channel('dashboard-vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchStats)
      .subscribe();

    const customersChannel = supabase
      .channel('dashboard-customers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchStats)
      .subscribe();

    const contractsChannel = supabase
      .channel('dashboard-contracts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_contracts' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(vehiclesChannel);
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(contractsChannel);
    };
  }, []);

  return { stats, loading, refetch: fetchStats };
};
