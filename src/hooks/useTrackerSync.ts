
import { supabase } from "@/integrations/supabase/client";

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
  };
  error?: string;
};

export const useTrackerSync = () => {
  const syncAuto = async (): Promise<TrackerSyncSummary> => {
    console.log("[TrackerSync] Starting auto sync...");
    const { data, error } = await supabase.functions.invoke("sync-tracker-devices", {
      body: { mode: "auto" },
    });
    if (error) {
      console.error("[TrackerSync] Auto sync error:", error);
      return { success: false, error: error.message };
    }
    console.log("[TrackerSync] Auto sync result:", data);
    return { success: true, summary: data?.summary };
  };

  const syncManual = async (devices: Array<{ plate: string; trackerId: string; latitude?: number; longitude?: number; address?: string; }>): Promise<TrackerSyncSummary> => {
    console.log("[TrackerSync] Starting manual sync with devices:", devices);
    const { data, error } = await supabase.functions.invoke("sync-tracker-devices", {
      body: { mode: "manual", devices },
    });
    if (error) {
      console.error("[TrackerSync] Manual sync error:", error);
      return { success: false, error: error.message };
    }
    console.log("[TrackerSync] Manual sync result:", data);
    return { success: true, summary: data?.summary };
  };

  return { syncAuto, syncManual };
};
