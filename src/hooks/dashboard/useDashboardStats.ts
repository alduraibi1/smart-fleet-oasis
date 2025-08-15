
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
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, status')
        .eq('is_active', true);

      // Fetch contracts data
      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select('id, status, total_amount, end_date')
        .in('status', ['active', 'confirmed']);

      // Fetch receipts data
      const { data: receipts } = await supabase
        .from('payment_receipts')
        .select('amount, payment_date')
        .eq('status', 'confirmed');

      // Fetch vouchers data
      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('amount, payment_date')
        .in('status', ['approved', 'paid']);

      // Fetch maintenance data
      const { data: maintenance } = await supabase
        .from('vehicle_maintenance')
        .select('id')
        .eq('status', 'pending');

      // Fetch ratings data
      const { data: ratings } = await supabase
        .from('customer_ratings')
        .select('rating');

      // Calculate stats
      const totalVehicles = vehicles?.length || 0;
      const availableVehicles = vehicles?.filter(v => v.status === 'available').length || 0;
      const activeContracts = contracts?.length || 0;
      
      const totalRevenue = receipts?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const totalExpenses = vouchers?.reduce((sum, v) => sum + (v.amount || 0), 0) || 0;
      
      // Monthly revenue calculation
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const monthlyRevenue = receipts?.filter(r => {
        const date = new Date(r.payment_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      // Overdue contracts calculation
      const now = new Date();
      const overdueContracts = contracts?.filter(c => 
        new Date(c.end_date) < now && c.status === 'active'
      ).length || 0;

      // Customer satisfaction calculation
      const customerSatisfaction = ratings?.length > 0 
        ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length 
        : 0;

      // Utilization rate calculation
      const utilizationRate = totalVehicles > 0 
        ? ((totalVehicles - availableVehicles) / totalVehicles) * 100 
        : 0;

      // Profit margin calculation
      const profitMargin = totalRevenue > 0 
        ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 
        : 0;

      setStats({
        totalVehicles,
        availableVehicles,
        activeContracts,
        totalRevenue,
        monthlyRevenue,
        pendingMaintenance: maintenance?.length || 0,
        overdueContracts,
        customerSatisfaction,
        utilizationRate,
        profitMargin,
      });

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
