
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerArrearsSummary {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  total_paid: number;
  total_contracted: number;
  outstanding_balance: number;
  active_contracts: number;
  overdue_contracts: number;
  oldest_overdue_date: string | null;
  risk_status: string;
}

export const useCustomerArrears = (threshold: number = 1500) => {
  return useQuery({
    queryKey: ['customer-accounts-summary', 'arrears', threshold],
    queryFn: async (): Promise<CustomerArrearsSummary[]> => {
      const { data, error } = await supabase
        .from('customer_accounts_summary' as any)
        .select('*');

      if (error) throw error;

      const rows = (data || []) as any[];

      // فلترة العملاء الذين تجاوزوا الحد ولديهم عقود متأخرة
      const filtered = rows
        .filter((row) => (row.outstanding_balance || 0) > threshold && (row.overdue_contracts || 0) > 0)
        .sort((a, b) => (b.outstanding_balance || 0) - (a.outstanding_balance || 0));

      return filtered as CustomerArrearsSummary[];
    },
    staleTime: 60 * 1000, // دقيقة
  });
};
