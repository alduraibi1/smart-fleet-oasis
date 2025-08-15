
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to manage maintenance work hours entries.
 * Focused and simple: add a single work hours entry per call.
 */
export interface AddWorkHoursInput {
  maintenanceId: string;
  mechanicId: string;
  startTime: Date;
  endTime?: Date;
  breakHours?: number;
  hourlyRate: number;
  notes?: string;
}

export function useMaintenanceWork() {
  const { toast } = useToast();

  const addWorkHours = async (input: AddWorkHoursInput) => {
    console.log("[useMaintenanceWork] addWorkHours input:", input);

    const payload = {
      maintenance_id: input.maintenanceId,
      mechanic_id: input.mechanicId,
      start_time: input.startTime.toISOString(),
      end_time: input.endTime ? input.endTime.toISOString() : null,
      break_hours: input.breakHours ?? 0,
      hourly_rate: input.hourlyRate,
      notes: input.notes ?? null,
    };

    const { data, error } = await supabase
      .from("maintenance_work_hours")
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      console.error("[useMaintenanceWork] addWorkHours error:", error);
      toast({
        title: "فشل إضافة ساعات العمل",
        description: "تعذر حفظ ساعات العمل. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "تم حفظ ساعات العمل",
      description: "تم تسجيل ساعات العمل وتحديث تكلفة الصيانة.",
    });

    console.log("[useMaintenanceWork] addWorkHours result:", data);
    return data;
  };

  return { addWorkHours };
}
