
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  vehicleId?: string;
  customerId?: string;
  ownerId?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  activeContracts: number;
  completedContracts: number;
}

export interface VehiclePerformance {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  utilizationRate: number;
  contractsCount: number;
  maintenanceCost: number;
}

export interface CustomerAnalysis {
  customerId: string;
  customerName: string;
  totalContracts: number;
  totalRevenue: number;
  avgContractValue: number;
  lastRentalDate: string | null;
  customerType: 'vip' | 'regular' | 'new';
}

export interface MaintenanceReport {
  vehicleId: string;
  plateNumber: string;
  totalMaintenanceCost: number;
  maintenanceCount: number;
  avgMaintenanceCost: number;
  lastMaintenanceDate: string | null;
  upcomingMaintenance: number;
}

export const useFinancialSummary = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['financial-summary', filters],
    queryFn: async () => {
      const { startDate, endDate } = filters;
      
      // جلب إجمالي الإيرادات من سندات القبض
      const { data: receiptsData } = await supabase
        .from('payment_receipts')
        .select('amount')
        .gte('payment_date', format(startDate, 'yyyy-MM-dd'))
        .lte('payment_date', format(endDate, 'yyyy-MM-dd'))
        .eq('status', 'confirmed');

      // جلب إجمالي المصروفات من سندات الصرف
      const { data: vouchersData } = await supabase
        .from('payment_vouchers')
        .select('amount')
        .gte('payment_date', format(startDate, 'yyyy-MM-dd'))
        .lte('payment_date', format(endDate, 'yyyy-MM-dd'))
        .in('status', ['approved', 'paid']);

      // جلب العقود النشطة والمكتملة
      const { data: contractsData } = await supabase
        .from('rental_contracts')
        .select('status, total_amount')
        .gte('start_date', format(startDate, 'yyyy-MM-dd'))
        .lte('end_date', format(endDate, 'yyyy-MM-dd'));

      const totalRevenue = receiptsData?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const totalExpenses = vouchersData?.reduce((sum, v) => sum + (v.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const activeContracts = contractsData?.filter(c => c.status === 'active').length || 0;
      const completedContracts = contractsData?.filter(c => c.status === 'completed').length || 0;

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        activeContracts,
        completedContracts
      } as FinancialSummary;
    },
  });
};

export const useVehiclePerformanceReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['vehicle-performance', filters],
    queryFn: async () => {
      const { startDate, endDate, vehicleId } = filters;
      
      let query = supabase
        .from('vehicles')
        .select(`
          id,
          plate_number,
          brand,
          model,
          rental_contracts!inner (
            id,
            total_amount,
            status,
            start_date,
            end_date
          )
        `);

      if (vehicleId) {
        query = query.eq('id', vehicleId);
      }

      const { data: vehiclesData, error } = await query;
      
      if (error) throw error;

      const performanceData: VehiclePerformance[] = [];

      for (const vehicle of vehiclesData || []) {
        // حساب الإيرادات من العقود
        const contractsInPeriod = vehicle.rental_contracts.filter(contract => 
          contract.start_date >= format(startDate, 'yyyy-MM-dd') &&
          contract.end_date <= format(endDate, 'yyyy-MM-dd')
        );
        
        const totalRevenue = contractsInPeriod.reduce((sum, c) => sum + (c.total_amount || 0), 0);
        
        // جلب تكاليف الصيانة للمركبة
        const { data: maintenanceData } = await supabase
          .from('vehicle_maintenance')
          .select('total_cost')
          .eq('vehicle_id', vehicle.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq('status', 'completed');

        const maintenanceCost = maintenanceData?.reduce((sum, m) => sum + (m.total_cost || 0), 0) || 0;
        
        // حساب معدل الاستخدام (عدد أيام التأجير / إجمالي الأيام في الفترة)
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const rentalDays = contractsInPeriod.reduce((sum, c) => {
          const contractStart = new Date(c.start_date);
          const contractEnd = new Date(c.end_date);
          return sum + Math.ceil((contractEnd.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        
        const utilizationRate = totalDays > 0 ? (rentalDays / totalDays) * 100 : 0;
        const netProfit = totalRevenue - maintenanceCost;

        performanceData.push({
          vehicleId: vehicle.id,
          plateNumber: vehicle.plate_number,
          brand: vehicle.brand,
          model: vehicle.model,
          totalRevenue,
          totalExpenses: maintenanceCost,
          netProfit,
          utilizationRate,
          contractsCount: contractsInPeriod.length,
          maintenanceCost
        });
      }

      return performanceData.sort((a, b) => b.netProfit - a.netProfit);
    },
  });
};

export const useCustomerAnalysisReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['customer-analysis', filters],
    queryFn: async () => {
      const { startDate, endDate, customerId } = filters;
      
      let query = supabase
        .from('customers')
        .select(`
          id,
          name,
          created_at,
          rental_contracts (
            id,
            total_amount,
            start_date,
            end_date,
            status
          )
        `);

      if (customerId) {
        query = query.eq('id', customerId);
      }

      const { data: customersData, error } = await query;
      
      if (error) throw error;

      const analysisData: CustomerAnalysis[] = [];

      for (const customer of customersData || []) {
        const contractsInPeriod = customer.rental_contracts.filter(contract => 
          contract.start_date >= format(startDate, 'yyyy-MM-dd') &&
          contract.end_date <= format(endDate, 'yyyy-MM-dd')
        );
        
        const totalRevenue = contractsInPeriod.reduce((sum, c) => sum + (c.total_amount || 0), 0);
        const avgContractValue = contractsInPeriod.length > 0 ? totalRevenue / contractsInPeriod.length : 0;
        
        const lastContract = customer.rental_contracts
          .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0];
        
        const customerAge = new Date().getTime() - new Date(customer.created_at).getTime();
        const isNewCustomer = customerAge < 30 * 24 * 60 * 60 * 1000; // أقل من 30 يوم
        const isVIP = totalRevenue > 50000 || customer.rental_contracts.length > 10;
        
        let customerType: 'vip' | 'regular' | 'new' = 'regular';
        if (isNewCustomer) customerType = 'new';
        else if (isVIP) customerType = 'vip';

        analysisData.push({
          customerId: customer.id,
          customerName: customer.name,
          totalContracts: contractsInPeriod.length,
          totalRevenue,
          avgContractValue,
          lastRentalDate: lastContract?.start_date || null,
          customerType
        });
      }

      return analysisData.sort((a, b) => b.totalRevenue - a.totalRevenue);
    },
  });
};

export const useMaintenanceReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['maintenance-report', filters],
    queryFn: async () => {
      const { startDate, endDate, vehicleId } = filters;
      
      let query = supabase
        .from('vehicles')
        .select(`
          id,
          plate_number,
          vehicle_maintenance (
            id,
            total_cost,
            completed_date,
            created_at,
            status
          ),
          maintenance_schedules (
            id,
            scheduled_date,
            status
          )
        `);

      if (vehicleId) {
        query = query.eq('id', vehicleId);
      }

      const { data: vehiclesData, error } = await query;
      
      if (error) throw error;

      const maintenanceData: MaintenanceReport[] = [];

      for (const vehicle of vehiclesData || []) {
        const maintenanceInPeriod = vehicle.vehicle_maintenance.filter(m => 
          m.created_at >= startDate.toISOString() &&
          m.created_at <= endDate.toISOString() &&
          m.status === 'completed'
        );
        
        const totalMaintenanceCost = maintenanceInPeriod.reduce((sum, m) => sum + (m.total_cost || 0), 0);
        const avgMaintenanceCost = maintenanceInPeriod.length > 0 ? totalMaintenanceCost / maintenanceInPeriod.length : 0;
        
        const lastMaintenance = maintenanceInPeriod
          .sort((a, b) => new Date(b.completed_date || b.created_at).getTime() - new Date(a.completed_date || a.created_at).getTime())[0];
        
        const upcomingMaintenance = vehicle.maintenance_schedules.filter(s => 
          s.status === 'scheduled' &&
          new Date(s.scheduled_date) > new Date()
        ).length;

        maintenanceData.push({
          vehicleId: vehicle.id,
          plateNumber: vehicle.plate_number,
          totalMaintenanceCost,
          maintenanceCount: maintenanceInPeriod.length,
          avgMaintenanceCost,
          lastMaintenanceDate: lastMaintenance?.completed_date || lastMaintenance?.created_at || null,
          upcomingMaintenance
        });
      }

      return maintenanceData.sort((a, b) => b.totalMaintenanceCost - a.totalMaintenanceCost);
    },
  });
};

export const useMonthlyTrends = (months: number = 6) => {
  return useQuery({
    queryKey: ['monthly-trends', months],
    queryFn: async () => {
      const trends = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));
        
        // إيرادات الشهر
        const { data: receiptsData } = await supabase
          .from('payment_receipts')
          .select('amount')
          .gte('payment_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('payment_date', format(monthEnd, 'yyyy-MM-dd'))
          .eq('status', 'confirmed');

        // مصروفات الشهر
        const { data: vouchersData } = await supabase
          .from('payment_vouchers')
          .select('amount')
          .gte('payment_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('payment_date', format(monthEnd, 'yyyy-MM-dd'))
          .in('status', ['approved', 'paid']);

        // عدد العقود الجديدة
        const { data: contractsData } = await supabase
          .from('rental_contracts')
          .select('id')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const revenue = receiptsData?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
        const expenses = vouchersData?.reduce((sum, v) => sum + (v.amount || 0), 0) || 0;
        const profit = revenue - expenses;
        const contractsCount = contractsData?.length || 0;

        trends.push({
          month: format(monthStart, 'yyyy-MM'),
          monthName: format(monthStart, 'MMMM yyyy', { locale: { localize: { month: () => format(monthStart, 'MM/yyyy') } } }),
          revenue,
          expenses,
          profit,
          contractsCount
        });
      }
      
      return trends;
    },
  });
};
