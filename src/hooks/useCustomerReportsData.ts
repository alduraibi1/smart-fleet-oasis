
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyCustomerRevenue {
  month: string;
  newCustomers: number;
  returningCustomers: number;
  revenue: number;
}

export interface TopCustomer {
  name: string;
  revenue: number;
  contracts: number;
}

export interface VehicleTypePerformance {
  type: string;
  revenue: number;
  count: number;
  percentage: number;
}

export interface BehaviorPattern {
  pattern: string;
  count: number;
  percentage: number;
}

export const useCustomerReportsData = () => {
  return useQuery({
    queryKey: ['customer-reports-data'],
    queryFn: async () => {
      // جلب البيانات للأشهر الستة الماضية
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: contracts, error } = await supabase
        .from('rental_contracts')
        .select(`
          id,
          customer_id,
          total_amount,
          start_date,
          end_date,
          created_at,
          customer:customers(name, created_at),
          vehicle:vehicles(type, brand, model)
        `)
        .gte('start_date', sixMonthsAgo.toISOString());

      if (error) throw error;

      // حساب الإيرادات الشهرية
      const monthlyRevenue: MonthlyCustomerRevenue[] = [];
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
      
      for (let i = 0; i < 6; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - (5 - i));
        monthStart.setDate(1);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        const monthContracts = contracts?.filter(c => 
          new Date(c.start_date) >= monthStart && new Date(c.start_date) <= monthEnd
        ) || [];

        const newCustomers = new Set(
          monthContracts
            .filter(c => new Date(c.customer?.created_at || '') >= monthStart)
            .map(c => c.customer_id)
        ).size;

        const returningCustomers = monthContracts.length - newCustomers;
        const revenue = monthContracts.reduce((sum, c) => sum + (c.total_amount || 0), 0);

        monthlyRevenue.push({
          month: months[i] || `شهر ${i + 1}`,
          newCustomers,
          returningCustomers,
          revenue
        });
      }

      // حساب أفضل العملاء
      const customerRevenue = new Map<string, { name: string; revenue: number; contracts: number }>();
      
      contracts?.forEach(contract => {
        const customerName = contract.customer?.name || 'غير محدد';
        const existing = customerRevenue.get(customerName) || { name: customerName, revenue: 0, contracts: 0 };
        existing.revenue += contract.total_amount || 0;
        existing.contracts += 1;
        customerRevenue.set(customerName, existing);
      });

      const topCustomers: TopCustomer[] = Array.from(customerRevenue.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // حساب أداء أنواع المركبات
      const vehicleTypeRevenue = new Map<string, { revenue: number; count: number }>();
      
      contracts?.forEach(contract => {
        const vehicleType = contract.vehicle?.type || 'غير محدد';
        const existing = vehicleTypeRevenue.get(vehicleType) || { revenue: 0, count: 0 };
        existing.revenue += contract.total_amount || 0;
        existing.count += 1;
        vehicleTypeRevenue.set(vehicleType, existing);
      });

      const totalContracts = contracts?.length || 1;
      const vehicleTypes: VehicleTypePerformance[] = Array.from(vehicleTypeRevenue.entries())
        .map(([type, data]) => ({
          type,
          revenue: data.revenue,
          count: data.count,
          percentage: (data.count / totalContracts) * 100
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // حساب أنماط السلوك
      const longTermRentals = contracts?.filter(c => {
        if (c.start_date && c.end_date) {
          const days = Math.ceil((new Date(c.end_date).getTime() - new Date(c.start_date).getTime()) / (1000 * 60 * 60 * 24));
          return days > 30;
        }
        return false;
      }).length || 0;

      const shortTermRentals = contracts?.filter(c => {
        if (c.start_date && c.end_date) {
          const days = Math.ceil((new Date(c.end_date).getTime() - new Date(c.start_date).getTime()) / (1000 * 60 * 60 * 24));
          return days <= 7;
        }
        return false;
      }).length || 0;

      const mediumTermRentals = totalContracts - longTermRentals - shortTermRentals;

      const behaviorPatterns: BehaviorPattern[] = [
        {
          pattern: 'إيجار طويل المدى (أكثر من شهر)',
          count: longTermRentals,
          percentage: (longTermRentals / totalContracts) * 100
        },
        {
          pattern: 'إيجار متوسط المدى (أسبوع - شهر)',
          count: mediumTermRentals,
          percentage: (mediumTermRentals / totalContracts) * 100
        },
        {
          pattern: 'إيجار قصير المدى (أقل من أسبوع)',
          count: shortTermRentals,
          percentage: (shortTermRentals / totalContracts) * 100
        }
      ];

      return {
        monthlyRevenue,
        topCustomers,
        vehicleTypes,
        behaviorPatterns
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
