
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CustomerArrearsSummary } from '@/hooks/useCustomerArrears';

export const useCustomerAccountSummary = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-accounts-summary', 'by-id', customerId],
    queryFn: async (): Promise<CustomerArrearsSummary | null> => {
      if (!customerId) return null;

      const { data, error } = await supabase
        .from('customer_accounts_summary' as any)
        .select('*')
        .eq('id', customerId)
        .maybeSingle();

      if (error) throw error;
      return (data as any) as CustomerArrearsSummary | null;
    },
    enabled: !!customerId,
    staleTime: 60 * 1000,
  });
};
