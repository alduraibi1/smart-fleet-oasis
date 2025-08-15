
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProfitabilityAlert {
  alert_type: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  current_value: number;
  threshold_value: number;
  severity: "info" | "warning" | "critical" | string;
}

export const useAlerts = () => {
  const query = useQuery({
    queryKey: ["profitability-alerts"],
    queryFn: async (): Promise<ProfitabilityAlert[]> => {
      const { data, error } = await supabase.rpc("check_profitability_thresholds" as any);
      if (error) throw error;
      return (data || []) as ProfitabilityAlert[];
    },
    staleTime: 30_000,
  });

  return query;
};
