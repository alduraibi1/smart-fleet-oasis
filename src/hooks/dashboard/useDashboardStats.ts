
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  activeContracts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  overdueContracts: number;
  customerSatisfaction: number;
  utilizationRate: number;
  profitMargin: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    availableVehicles: 0,
    activeContracts: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingMaintenance: 0,
    overdueContracts: 0,
    customerSatisfaction: 0,
    utilizationRate: 0,
    profitMargin: 0,
  });
  
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch vehicles data
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id, status')
        .eq('is_active', true);
      
      const vehicles = vehiclesData || [];

      // Fetch contracts data
      const { data: contractsData } = await supabase
        .from('rental_contracts')
        .select('id, status, total_amount, end_date')
        .in('status', ['active', 'confirmed']);
      
      const contracts = contractsData || [];

      // Fetch receipts data
      const { data: receiptsData } = await supabase
        .from('payment_receipts')
        .select('amount, payment_date')
        .eq('status', 'confirmed');
      
      const receipts = receiptsData || [];

      // Fetch vouchers data
      const { data: vouchersData } = await supabase
        .from('payment_vouchers')
        .select('amount, payment_date')
        .in('status', ['approved', 'paid']);
      
      const vouchers = vouchersData || [];

      // Fetch maintenance data
      const { data: maintenanceData } = await supabase
        .from('vehicle_maintenance')
        .select('id')
        .eq('status', 'pending');
      
      const maintenance = maintenanceData || [];

      // Calculate basic stats
      const totalVehicles = vehicles.length;
      const availableVehicles = vehicles.filter(v => v.status === 'available').length;
      const activeContracts = contracts.length;
      
      // Calculate revenue and expenses
      const totalRevenue = receipts.reduce((sum, r) => {
        const amount = Number(r.amount) || 0;
        return sum + amount;
      }, 0);
      
      const totalExpenses = vouchers.reduce((sum, v) => {
        const amount = Number(v.amount) || 0;
        return sum + amount;
      }, 0);
      
      // Monthly revenue calculation
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const monthlyRevenue = receipts
        .filter(r => {
          const date = new Date(r.payment_date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, r) => {
          const amount = Number(r.amount) || 0;
          return sum + amount;
        }, 0);

      // Overdue contracts calculation
      const now = new Date();
      const overdueContracts = contracts.filter(c => {
        const endDate = new Date(c.end_date);
        return endDate < now && c.status === 'active';
      }).length;

      // Customer satisfaction - set to 0 as requested (no calculation from ratings)
      const customerSatisfaction = 0;

      // Utilization rate calculation
      const utilizationRate = totalVehicles > 0 
        ? ((totalVehicles - availableVehicles) / totalVehicles) * 100 
        : 0;

      // Profit margin calculation
      const profitMargin = totalRevenue > 0 
        ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 
        : 0;

      const newStats: DashboardStats = {
        totalVehicles,
        availableVehicles,
        activeContracts,
        totalRevenue,
        monthlyRevenue,
        pendingMaintenance: maintenance.length,
        overdueContracts,
        customerSatisfaction,
        utilizationRate,
        profitMargin,
      };

      setStats(newStats);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };

    loadStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
};
