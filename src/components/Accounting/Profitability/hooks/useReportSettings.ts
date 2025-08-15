
import { supabase } from "@/integrations/supabase/client";

export const useReportSettings = () => {
  const saveSettings = async (
    reportType: "vehicle" | "owner" | "customer",
    reportName: string,
    settings: Record<string, any>,
    isDefault: boolean = false
  ) => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      throw new Error("يجب تسجيل الدخول لحفظ الإعدادات");
    }

    const { data, error } = await supabase
      .from("saved_report_settings")
      .insert([
        {
          user_id: userId,
          report_type: reportType,
          report_name: reportName,
          settings,
          is_default: isDefault,
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const scheduleReport = async (
    reportType: "vehicle" | "owner" | "customer",
    reportName: string,
    settings: Record<string, any>,
    scheduleType: "weekly" | "monthly" | "daily" = "weekly",
    recipients: string[] = []
  ) => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      throw new Error("يجب تسجيل الدخول لجدولة التقارير");
    }

    const { data, error } = await supabase
      .from("scheduled_reports")
      .insert([
        {
          user_id: userId,
          report_type: reportType,
          report_name: reportName,
          settings,
          schedule_type: scheduleType,
          schedule_config: {},
          recipients,
          is_active: true,
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  return { saveSettings, scheduleReport };
};
