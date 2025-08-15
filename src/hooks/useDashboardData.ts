
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

interface RevenueData {
  month: string;
  revenue: number;
  contracts: number;
  expenses: number;
}

interface VehiclePerformance {
  id: string;
  plateNumber: string;
  model: string;
  revenue: number;
  utilization: number;
  contracts: number;
}

interface RecentActivity {
  id: string;
  type: 'contract' | 'payment' | 'maintenance' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  status: string;
}

export const useDashboardData = () => {
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
  
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topVehicles, setTopVehicles] = useState<VehiclePerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async (): Promise<void> => {
    try {
      // Fetch vehicles data
      const vehiclesResponse = await supabase
        .from('vehicles')
        .select('id, status')
        .eq('is_active', true);
      
      const vehicles = vehiclesResponse.data || [];

      // Fetch contracts data
      const contractsResponse = await supabase
        .from('rental_contracts')
        .select('id, status, total_amount, end_date')
        .in('status', ['active', 'confirmed']);
      
      const contracts = contractsResponse.data || [];

      // Fetch receipts data
      const receiptsResponse = await supabase
        .from('payment_receipts')
        .select('amount, payment_date')
        .eq('status', 'confirmed');
      
      const receipts = receiptsResponse.data || [];

      // Fetch vouchers data
      const vouchersResponse = await supabase
        .from('payment_vouchers')
        .select('amount, payment_date')
        .in('status', ['approved', 'paid']);
      
      const vouchers = vouchersResponse.data || [];

      // Fetch maintenance data
      const maintenanceResponse = await supabase
        .from('vehicle_maintenance')
        .select('id')
        .eq('status', 'pending');
      
      const maintenance = maintenanceResponse.data || [];

      // Fetch ratings data
      const ratingsResponse = await supabase
        .from('customer_ratings')
        .select('rating');
      
      const ratings = ratingsResponse.data || [];

      // Calculate stats with explicit typing
      const totalVehicles: number = vehicles.length;
      const availableVehicles: number = vehicles.filter((v: any) => v.status === 'available').length;
      const activeContracts: number = contracts.length;
      
      const totalRevenue: number = receipts.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
      const totalExpenses: number = vouchers.reduce((sum: number, v: any) => sum + (v.amount || 0), 0);
      
      // Monthly revenue calculation
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const monthlyRevenue: number = receipts
        .filter((r: any) => {
          const date = new Date(r.payment_date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

      // Overdue contracts calculation
      const now = new Date();
      const overdueContracts: number = contracts
        .filter((c: any) => new Date(c.end_date) < now && c.status === 'active')
        .length;

      // Customer satisfaction calculation
      const customerSatisfaction: number = ratings.length > 0 
        ? ratings.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / ratings.length 
        : 0;

      // Utilization rate calculation
      const utilizationRate: number = totalVehicles > 0 
        ? ((totalVehicles - availableVehicles) / totalVehicles) * 100 
        : 0;

      // Profit margin calculation
      const profitMargin: number = totalRevenue > 0 
        ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 
        : 0;

      setStats({
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
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRevenueData = async (): Promise<void> => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const dateFilter = sixMonthsAgo.toISOString();

      const receiptsResponse = await supabase
        .from('payment_receipts')
        .select('amount, payment_date')
        .eq('status', 'confirmed')
        .gte('payment_date', dateFilter);

      const vouchersResponse = await supabase
        .from('payment_vouchers')
        .select('amount, payment_date')
        .in('status', ['approved', 'paid'])
        .gte('payment_date', dateFilter);

      const contractsResponse = await supabase
        .from('rental_contracts')
        .select('start_date')
        .gte('start_date', dateFilter);

      const receipts = receiptsResponse.data || [];
      const vouchers = vouchersResponse.data || [];
      const contracts = contractsResponse.data || [];

      // Process monthly data with explicit typing
      const monthlyMap = new Map<string, { revenue: number; expenses: number; contracts: number }>();

      // Process receipts
      receipts.forEach((receipt: any) => {
        const monthKey = new Date(receipt.payment_date).toLocaleString('ar-SA', { month: 'long' });
        const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0, contracts: 0 };
        existing.revenue += receipt.amount || 0;
        monthlyMap.set(monthKey, existing);
      });

      // Process vouchers
      vouchers.forEach((voucher: any) => {
        const monthKey = new Date(voucher.payment_date).toLocaleString('ar-SA', { month: 'long' });
        const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0, contracts: 0 };
        existing.expenses += voucher.amount || 0;
        monthlyMap.set(monthKey, existing);
      });

      // Process contracts
      contracts.forEach((contract: any) => {
        const monthKey = new Date(contract.start_date).toLocaleString('ar-SA', { month: 'long' });
        const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0, contracts: 0 };
        existing.contracts += 1;
        monthlyMap.set(monthKey, existing);
      });

      const revenueData: RevenueData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        contracts: data.contracts,
        expenses: data.expenses,
      }));

      setRevenueData(revenueData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const fetchTopVehicles = async (): Promise<void> => {
    try {
      const vehiclesResponse = await supabase
        .from('vehicles')
        .select('id, plate_number, brand, model')
        .eq('is_active', true);

      const vehicles = vehiclesResponse.data || [];
      const vehiclePerformance: VehiclePerformance[] = [];

      for (const vehicle of vehicles) {
        const contractsResponse = await supabase
          .from('rental_contracts')
          .select('id, total_amount')
          .eq('vehicle_id', vehicle.id);

        const contracts = contractsResponse.data || [];
        const contractIds = contracts.map((c: any) => c.id);

        let receiptsResponse;
        if (contractIds.length > 0) {
          receiptsResponse = await supabase
            .from('payment_receipts')
            .select('amount')
            .in('contract_id', contractIds)
            .eq('status', 'confirmed');
        } else {
          receiptsResponse = { data: [] };
        }

        const receipts = receiptsResponse.data || [];
        const contractsCount = contracts.length;
        const revenue = receipts.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
        const utilization = contractsCount > 0 ? Math.min((contractsCount / 10) * 100, 100) : 0;

        vehiclePerformance.push({
          id: vehicle.id,
          plateNumber: vehicle.plate_number || '',
          model: `${vehicle.brand || ''} ${vehicle.model || ''}`.trim(),
          revenue,
          utilization,
          contracts: contractsCount,
        });
      }

      const sortedVehicles = vehiclePerformance
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopVehicles(sortedVehicles);
    } catch (error) {
      console.error('Error fetching top vehicles:', error);
    }
  };

  const fetchRecentActivity = async (): Promise<void> => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent contracts
      const contractsResponse = await supabase
        .from('rental_contracts')
        .select('id, contract_number, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const recentContracts = contractsResponse.data || [];
      recentContracts.forEach((contract: any) => {
        activities.push({
          id: contract.id,
          type: 'contract',
          title: `عقد جديد ${contract.contract_number}`,
          description: `عقد جديد تم إنشاؤه`,
          timestamp: new Date(contract.created_at),
          status: contract.status,
        });
      });

      // Fetch recent payments
      const paymentsResponse = await supabase
        .from('payment_receipts')
        .select('id, receipt_number, amount, status, created_at, customer_name')
        .order('created_at', { ascending: false })
        .limit(3);

      const recentPayments = paymentsResponse.data || [];
      recentPayments.forEach((payment: any) => {
        activities.push({
          id: payment.id,
          type: 'payment',
          title: `دفعة جديدة ${payment.receipt_number}`,
          description: `دفعة بقيمة ${payment.amount} ريال من ${payment.customer_name}`,
          timestamp: new Date(payment.created_at),
          status: payment.status,
        });
      });

      // Sort by timestamp and take first 6
      const sortedActivities = activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 6);

      setRecentActivity(sortedActivities);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async (): Promise<void> => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchRevenueData(),
        fetchTopVehicles(),
        fetchRecentActivity(),
      ]);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const refetch = (): void => {
    fetchDashboardStats();
    fetchRevenueData();
    fetchTopVehicles();
    fetchRecentActivity();
  };

  return {
    stats,
    revenueData,
    topVehicles,
    recentActivity,
    loading,
    refetch,
  };
};
