
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Types for cost centers and mappings
 */
export type EntityType = "vehicle" | "customer" | "owner" | "contract";

export interface CostCenter {
  id: string;
  center_code: string;
  center_name: string;
  center_type: EntityType | string;
  entity_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CostCenterMapping {
  id: string;
  entity_type: EntityType | string;
  entity_id: string;
  cost_center_id: string;
  created_at: string;
}

/**
 * Fetch list of cost centers
 */
export const useCostCenters = () => {
  return useQuery({
    queryKey: ["cost-centers"],
    queryFn: async (): Promise<CostCenter[]> => {
      console.log("[useCostCenters] fetching cost centers...");
      const { data, error } = await supabase
        .from("cost_centers")
        .select("id, center_code, center_name, center_type, entity_id, is_active, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useCostCenters] error:", error);
        throw error;
      }
      return (data || []) as CostCenter[];
    },
    staleTime: 30_000,
  });
};

/**
 * Fetch list of mappings
 */
export const useCostCenterMappings = () => {
  return useQuery({
    queryKey: ["cost-center-mappings"],
    queryFn: async (): Promise<CostCenterMapping[]> => {
      console.log("[useCostCenters] fetching cost center mappings...");
      const { data, error } = await supabase
        .from("cost_center_mappings")
        .select("id, entity_type, entity_id, cost_center_id, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useCostCenters] mappings error:", error);
        throw error;
      }
      return (data || []) as CostCenterMapping[];
    },
    staleTime: 30_000,
  });
};

/**
 * Ensure cost center for an entity using the RPC function
 */
export const ensureCostCenter = async (params: {
  entityType: EntityType;
  entityId: string;
  centerCode?: string;
  centerName?: string;
}) => {
  const { entityType, entityId, centerCode, centerName } = params;
  console.log("[ensureCostCenter] calling RPC ensure_cost_center_for_entity with:", params);

  const { data, error } = await supabase.rpc("ensure_cost_center_for_entity" as any, {
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_center_code: centerCode ?? null,
    p_center_name: centerName ?? null,
  });

  if (error) {
    console.error("[ensureCostCenter] error:", error);
    throw error;
  }
  return data as string | null; // returns UUID
};

/**
 * Lightweight helpers to fetch selectable entities (limited)
 */
export const useVehiclesMinimal = () => {
  return useQuery({
    queryKey: ["vehicles-minimal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, plate_number, brand, model")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (
        (data || []).map((v: any) => ({
          id: v.id as string,
          label: `${v.plate_number ?? ""} - ${v.brand ?? ""} ${v.model ?? ""}`.trim(),
        })) as { id: string; label: string }[]
      );
    },
  });
};

export const useCustomersMinimal = () => {
  return useQuery({
    queryKey: ["customers-minimal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (
        (data || []).map((c: any) => ({
          id: c.id as string,
          label: `${c.name ?? ""}${c.phone ? " - " + c.phone : ""}`,
        })) as { id: string; label: string }[]
      );
    },
  });
};

