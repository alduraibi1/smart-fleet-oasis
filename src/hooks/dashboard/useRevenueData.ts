
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RevenueData {
  month: string;
  revenue: number;
  contracts: number;
  expenses: number;
}

export const useRevenueData = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenueData = async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const dateFilter = sixMonthsAgo.toISOString();

      const { data: receipts } = await supabase
        .from('payment_receipts')
        .select('amount, payment_date')
        .eq('status', 'confirmed')
        .gte('payment_date', dateFilter);

      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('amount, payment_date')
        .in('status', ['approved', 'paid'])
        .gte('payment_date', dateFilter);

      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select('start_date')
        .gte('start_date', dateFilter);

      // Process monthly data
      const monthlyMap = new Map<string, { revenue: number; expenses: number; contracts: number }>();

      // Process receipts
      receipts?.forEach(receipt => {
        const monthKey = new Date(receipt.payment_date).toLocaleString('ar-SA', { month: 'long' });
        const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0, contracts: 0 };
        existing.revenue += receipt.amount || 0;
        monthlyMap.set(monthKey, existing);
      });

      // Process vouchers
      vouchers?.forEach(voucher => {
        const monthKey = new Date(voucher.payment_date).toLocaleString('ar-SA', { month: 'long' });
        const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0, contracts: 0 };
        existing.expenses += voucher.amount || 0;
        monthlyMap.set(monthKey, existing);
      });

      // Process contracts
      contracts?.forEach(contract => {
        const monthKey = new Date(contract.start_date).toLocaleString('ar-SA', { month: 'long' });
        const existing = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0, contracts: 0 };
        existing.contracts += 1;
        monthlyMap.set(monthKey, existing);
      });

      const processedData: RevenueData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        contracts: data.contracts,
        expenses: data.expenses,
      }));

      setRevenueData(processedData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRevenueData();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    revenueData,
    loading,
    refetch: fetchRevenueData,
  };
};
