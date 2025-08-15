
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * أنواع مبسطة للعرض
 */
export interface FinancialPrediction {
  id: string;
  prediction_type: string;
  entity_type: string;
  entity_id: string | null;
  prediction_date: string;
  predicted_value: number;
  confidence_score: number | null;
  created_at: string | null;
}

export interface FinancialAnomaly {
  id: string;
  anomaly_type: string;
  entity_type: string;
  entity_id: string | null;
  anomaly_score: number;
  expected_value: number | null;
  actual_value: number | null;
  deviation_percentage: number | null;
  investigation_status: string;
  detected_at: string | null;
  created_at: string | null;
}

export interface BehavioralAnalysis {
  id: string;
  analysis_type: string;
  entity_type: string;
  entity_id: string | null;
  risk_score: number | null;
  opportunity_score: number | null;
  created_at: string | null;
}

/**
 * Queries
 */
export const useFinancialPredictions = () => {
  return useQuery({
    queryKey: ["financial-ai-predictions"],
    queryFn: async (): Promise<FinancialPrediction[]> => {
      const { data, error } = await supabase
        .from("financial_ai_predictions")
        .select("id, prediction_type, entity_type, entity_id, prediction_date, predicted_value, confidence_score, created_at")
        .order("prediction_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as FinancialPrediction[];
    },
    staleTime: 30_000,
  });
};

export const useFinancialAnomalies = () => {
  return useQuery({
    queryKey: ["financial-ai-anomalies"],
    queryFn: async (): Promise<FinancialAnomaly[]> => {
      const { data, error } = await supabase
        .from("financial_anomalies")
        .select("id, anomaly_type, entity_type, entity_id, anomaly_score, expected_value, actual_value, deviation_percentage, investigation_status, detected_at, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as FinancialAnomaly[];
    },
    staleTime: 30_000,
  });
};

export const useBehavioralAnalyticsRecent = () => {
  return useQuery({
    queryKey: ["behavioral-analytics-recent"],
    queryFn: async (): Promise<BehavioralAnalysis[]> => {
      const { data, error } = await supabase
        .from("behavioral_analytics")
        .select("id, analysis_type, entity_type, entity_id, risk_score, opportunity_score, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as BehavioralAnalysis[];
    },
    staleTime: 30_000,
  });
};

/**
 * Actions (RPC)
 */
export const generateVehiclePredictions = async (vehicleId: string, months: number = 3) => {
  const { data, error } = await supabase.rpc("generate_financial_predictions" as any, {
    p_entity_type: "vehicle",
    p_entity_id: vehicleId,
    p_prediction_months: months,
  });
  if (error) throw error;
  return data;
};

export const detectAnomalies = async () => {
  const { data, error } = await supabase.rpc("detect_financial_anomalies" as any);
  if (error) throw error;
  return data as number;
};

export const analyzeCustomerBehavior = async (customerId: string) => {
  const { data, error } = await supabase.rpc("analyze_customer_behavior" as any, {
    p_customer_id: customerId,
  });
  if (error) throw error;
  return data;
};
