
import { supabase } from "@/integrations/supabase/client";

export type MatchSuggestion = {
  vehicleId: string;
  plate: string;
  score: number;
  reason: string;
};

export type UnmatchedSuggestion = {
  devicePlate: string;
  normalizedPlate: string;
  topCandidates: MatchSuggestion[];
};

export type TrackerSyncSummary = {
  success: boolean;
  summary?: {
    matched: number;
    updatedVehicles: number;
    upsertedMappings: number;
    updatedLocations: number;
    skipped: number;
    errors: string[];
    mode: "auto" | "manual";
    dryRun?: boolean;
    discoveredDevices?: Array<{ plate: string; trackerId: string; latitude?: number; longitude?: number; address?: string; }>;
    unmatchedSuggestions?: UnmatchedSuggestion[];
  };
  error?: string;
};

export const useTrackerSync = () => {
  const normalizeResponse = (data: any, error: any): TrackerSyncSummary => {
    if (error) {
      console.error("[TrackerSync] Invoke error:", error);
      return { success: false, error: error.message || "Edge function invocation failed" };
    }
    // إذا أعادت الوظيفة success=false لكن بحالة 200
    if (data && data.success === false) {
      const firstErr = data?.summary?.errors?.[0];
      console.warn("[TrackerSync] Function reported failure:", firstErr || data?.error);
      return { success: false, summary: data.summary, error: data.error || firstErr || "Sync failed" };
    }
    return { success: true, summary: data?.summary };
  };

  const syncAuto = async (dryRun = false): Promise<TrackerSyncSummary> => {
    console.log(`[TrackerSync] Starting auto sync${dryRun ? ' (dry run)' : ''}...`);
    const { data, error } = await supabase.functions.invoke("sync-tracker-devices", {
      body: { mode: "auto", dryRun },
    });
    const res = normalizeResponse(data, error);
    console.log("[TrackerSync] Auto sync result:", res);
    return res;
  };

  const syncManual = async (devices: Array<{ plate: string; trackerId: string; latitude?: number; longitude?: number; address?: string; }>): Promise<TrackerSyncSummary> => {
    console.log("[TrackerSync] Starting manual sync with devices:", devices);
    const { data, error } = await supabase.functions.invoke("sync-tracker-devices", {
      body: { mode: "manual", devices },
    });
    const res = normalizeResponse(data, error);
    console.log("[TrackerSync] Manual sync result:", res);
    return res;
  };

  return { syncAuto, syncManual };
};
