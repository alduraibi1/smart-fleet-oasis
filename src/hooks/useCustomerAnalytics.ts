
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerAnalyticsData {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  totalContracts: number;
  totalRevenue: number;
  averageContractValue: number;
  averageRentalDuration: number;
  lastRentalDate: string | null;
  customerSince: string;
  paymentReliability: number;
  preferredVehicleType: string;
  loyaltyScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'vip';
}

export const useCustomerAnalytics = () => {
  return useQuery({
    queryKey: ['customer-analytics'],
    queryFn: async (): Promise<CustomerAnalyticsData[]> => {
      // جلب بيانات العملاء مع العقود والمدفوعات
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          email,
          phone,
          created_at,
          rating,
          total_rentals,
          last_rental_date,
          is_active,
          blacklisted
        `);

      if (customersError) throw customersError;

      const customerAnalytics: CustomerAnalyticsData[] = [];

      for (const customer of customers || []) {
        // جلب عقود العميل
        const { data: contracts } = await supabase
          .from('rental_contracts')
          .select(`
            id,
            total_amount,
            start_date,
            end_date,
            status,
            vehicle:vehicles(brand, model, fuel_type)
          `)
          .eq('customer_id', customer.id);

        // جلب مدفوعات العميل
        const { data: payments } = await supabase
          .from('payment_receipts')
          .select('amount, status')
          .eq('customer_name', customer.name);

        const totalContracts = contracts?.length || 0;
        const totalRevenue = contracts?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;
        const averageContractValue = totalContracts > 0 ? totalRevenue / totalContracts : 0;
        
        // حساب متوسط مدة الإيجار
        const averageRentalDuration = contracts?.reduce((sum, c) => {
          if (c.start_date && c.end_date) {
            const days = Math.ceil((new Date(c.end_date).getTime() - new Date(c.start_date).getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }
          return sum;
        }, 0) / Math.max(totalContracts, 1) || 0;

        // حساب موثوقية الدفع
        const totalPayments = payments?.length || 0;
        const confirmedPayments = payments?.filter(p => p.status === 'confirmed').length || 0;
        const paymentReliability = totalPayments > 0 ? (confirmedPayments / totalPayments) * 100 : 100;

        // تحديد نوع المركبة المفضل (باستخدام fuel_type بدل type)
        const vehicleTypes = contracts?.map(c => (c as any).vehicle?.fuel_type || 'غير محدد') || [];
        const preferredVehicleType = vehicleTypes.length
          ? vehicleTypes.reduce((a, b, i, arr) =>
              arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
            )
          : 'غير محدد';

        // حساب درجة الولاء
        const loyaltyScore = Math.min(
          ((customer as any).rating * 10) + 
          (totalContracts * 5) + 
          (paymentReliability * 0.5), 
          100
        );

        // تحديد مستوى المخاطر
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if ((customer as any).blacklisted || paymentReliability < 70) {
          riskLevel = 'high';
        } else if (paymentReliability < 90 || totalContracts < 3) {
          riskLevel = 'medium';
        }

        // تحديد حالة العميل
        let status: 'active' | 'inactive' | 'vip' = 'inactive';
        if ((customer as any).is_active) {
          if (loyaltyScore >= 80 && totalRevenue >= 50000) {
            status = 'vip';
          } else {
            status = 'active';
          }
        }

        customerAnalytics.push({
          customerId: (customer as any).id,
          name: (customer as any).name || '',
          email: (customer as any).email || '',
          phone: (customer as any).phone || '',
          totalContracts,
          totalRevenue,
          averageContractValue,
          averageRentalDuration,
          lastRentalDate: (customer as any).last_rental_date,
          customerSince: (customer as any).created_at,
          paymentReliability,
          preferredVehicleType,
          loyaltyScore,
          riskLevel,
          status
        });
      }

      return customerAnalytics.sort((a, b) => b.totalRevenue - a.totalRevenue);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
