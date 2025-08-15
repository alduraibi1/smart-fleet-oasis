
import { supabase } from "@/integrations/supabase/client";

export const useSnapshots = () => {
  const saveSnapshot = async (params: {
    entityType: "vehicle" | "owner" | "customer";
    entityId: string;
    metrics: Record<string, any>;
    periodStart: string; // yyyy-mm-dd
    periodEnd: string; // yyyy-mm-dd
  }) => {
    const { entityType, entityId, metrics, periodStart, periodEnd } = params;

    const { data, error } = await supabase.rpc("save_profitability_snapshot" as any, {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_metrics: metrics,
      p_period_start: periodStart,
      p_period_end: periodEnd,
    });

    if (error) throw error;
    return data as string | null;
  };

  return { saveSnapshot };
};
