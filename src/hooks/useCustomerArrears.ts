
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerAccountSummary {
  customer_id: string;
  total_contracts: number;
  active_contracts: number;
  total_contract_value: number;
  total_paid: number;
  outstanding_amount: number;
  overdue_amount: number;
  last_contract_end_date: string | null;
}

export const useCustomerArrears = (threshold: number = 1500) => {
  return useQuery({
    queryKey: ['customer-accounts-summary', threshold],
    queryFn: async (): Promise<CustomerAccountSummary[]> => {
      // القراءة من الـ View customer_accounts_summary
      const { data, error } = await supabase
        .from('customer_accounts_summary' as any)
        .select('*');

      if (error) throw error;

      const rows = (data || []) as any[];
      // فلترة العملاء المتجاوزين للحد بناءً على مبلغ المتأخرات (بعد مهلة 14 يوم)
      return rows
        .filter(row => (row.overdue_amount || 0) > threshold)
        .sort((a, b) => (b.overdue_amount || 0) - (a.overdue_amount || 0)) as CustomerAccountSummary[];
    },
    staleTime: 60 * 1000, // دقيقة
  });
};
