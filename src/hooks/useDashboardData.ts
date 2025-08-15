
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

  const fetchDashboardStats = async () => {
    try {
      // جلب إحصائيات المركبات
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, status')
        .eq('is_active', true);

      // جلب العقود النشطة
      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select('id, status, total_amount, end_date')
        .in('status', ['active', 'confirmed']);

      // جلب إجمالي الإيرادات
      const { data: receipts } = await supabase
        .from('payment_receipts')
        .select('amount, payment_date')
        .eq('status', 'confirmed');

      // جلب المصروفات
      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('amount, payment_date')
        .in('status', ['approved', 'paid']);

      // جلب الصيانة المعلقة
      const { data: maintenance } = await supabase
        .from('vehicle_maintenance')
        .select('id')
        .eq('status', 'pending');

      // جلب تقييمات العملاء
      const { data: ratings } = await supabase
        .from('customer_ratings')
        .select('rating');

      // حساب الإحصائيات
      const totalVehicles = vehicles?.length || 0;
      const availableVehicles = vehicles?.filter(v => v.status === 'available').length || 0;
      const activeContracts = contracts?.length || 0;
      const totalRevenue = receipts?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const totalExpenses = vouchers?.reduce((sum, v) => sum + v.amount, 0) || 0;
      
      // الإيرادات الشهرية (آخر شهر)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = receipts?.filter(r => {
        const date = new Date(r.payment_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, r) => sum + r.amount, 0) || 0;

      // العقود المتأخرة
      const overdueContracts = contracts?.filter(c => 
        new Date(c.end_date) < new Date() && c.status === 'active'
      ).length || 0;

      // متوسط رضا العملاء
      const customerSatisfaction = ratings?.length ? 
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

      // معدل الاستخدام
      const utilizationRate = totalVehicles > 0 ? 
        (totalVehicles - availableVehicles) / totalVehicles * 100 : 0;

      // هامش الربح
      const profitMargin = totalRevenue > 0 ? 
        ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

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

  const fetchRevenueData = async () => {
    try {
      const { data: receipts } = await supabase
        .from('payment_receipts')
        .select('amount, payment_date')
        .eq('status', 'confirmed')
        .gte('payment_date', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('amount, payment_date')
        .in('status', ['approved', 'paid'])
        .gte('payment_date', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select('start_date')
        .gte('start_date', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      // تجميع البيانات حسب الشهر
      const monthlyData: Record<string, { revenue: number; expenses: number; contracts: number }> = {};
      
      receipts?.forEach(receipt => {
        const monthKey = new Date(receipt.payment_date).toLocaleString('ar-SA', { month: 'long' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, expenses: 0, contracts: 0 };
        }
        monthlyData[monthKey].revenue += receipt.amount;
      });

      vouchers?.forEach(voucher => {
        const monthKey = new Date(voucher.payment_date).toLocaleString('ar-SA', { month: 'long' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, expenses: 0, contracts: 0 };
        }
        monthlyData[monthKey].expenses += voucher.amount;
      });

      contracts?.forEach(contract => {
        const monthKey = new Date(contract.start_date).toLocaleString('ar-SA', { month: 'long' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, expenses: 0, contracts: 0 };
        }
        monthlyData[monthKey].contracts += 1;
      });

      const revenueData = Object.entries(monthlyData).map(([month, data]) => ({
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

  const fetchTopVehicles = async () => {
    try {
      const { data: vehiclesWithRevenue } = await supabase
        .from('vehicles')
        .select(`
          id,
          plate_number,
          brand,
          model,
          rental_contracts!inner(
            id,
            total_amount,
            status,
            payment_receipts(amount)
          )
        `)
        .eq('is_active', true);

      const vehiclePerformance = vehiclesWithRevenue?.map(vehicle => {
        const contracts = vehicle.rental_contracts?.length || 0;
        const revenue = vehicle.rental_contracts?.reduce((sum: number, contract: any) => {
          const receiptAmount = contract.payment_receipts?.reduce((receiptSum: number, receipt: any) => 
            receiptSum + (receipt.amount || 0), 0) || 0;
          return sum + receiptAmount;
        }, 0) || 0;

        return {
          id: vehicle.id,
          plateNumber: vehicle.plate_number,
          model: `${vehicle.brand} ${vehicle.model}`,
          revenue,
          utilization: contracts > 0 ? Math.min((contracts / 10) * 100, 100) : 0, // تقدير تقريبي
          contracts,
        };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 5) || [];

      setTopVehicles(vehiclePerformance);
    } catch (error) {
      console.error('Error fetching top vehicles:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // جلب العقود الحديثة
      const { data: recentContracts } = await supabase
        .from('rental_contracts')
        .select('id, contract_number, status, created_at, customers(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      recentContracts?.forEach(contract => {
        activities.push({
          id: contract.id,
          type: 'contract',
          title: `عقد جديد ${contract.contract_number}`,
          description: `عقد جديد مع العميل ${(contract as any).customers?.name || 'غير محدد'}`,
          timestamp: new Date(contract.created_at),
          status: contract.status,
        });
      });

      // جلب المدفوعات الحديثة
      const { data: recentPayments } = await supabase
        .from('payment_receipts')
        .select('id, receipt_number, amount, status, created_at, customer_name')
        .order('created_at', { ascending: false })
        .limit(5);

      recentPayments?.forEach(payment => {
        activities.push({
          id: payment.id,
          type: 'payment',
          title: `دفعة جديدة ${payment.receipt_number}`,
          description: `دفعة بقيمة ${payment.amount} ريال من ${payment.customer_name}`,
          timestamp: new Date(payment.created_at),
          status: payment.status,
        });
      });

      // ترتيب النشاطات حسب التاريخ
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivity(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
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

  return {
    stats,
    revenueData,
    topVehicles,
    recentActivity,
    loading,
    refetch: () => {
      fetchDashboardStats();
      fetchRevenueData();
      fetchTopVehicles();
      fetchRecentActivity();
    },
  };
};
