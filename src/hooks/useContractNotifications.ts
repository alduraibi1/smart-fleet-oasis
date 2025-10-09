import { supabase } from "@/integrations/supabase/client";
import { enhancedToast } from "@/components/ui/enhanced-toast";

export const useContractNotifications = () => {
  const sendContractNotification = async (
    contractId: string,
    notificationType: "created" | "expiring" | "expired" | "returned",
    customerEmail?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-contract-notification", {
        body: {
          contractId,
          notificationType,
          customerEmail,
        },
      });

      if (error) throw error;

      if (data?.success) {
        enhancedToast.success("تم إرسال الإشعار بنجاح");
      }

      return data;
    } catch (error: any) {
      console.error("Error sending contract notification:", error);
      enhancedToast.error("فشل إرسال الإشعار", {
        description: error.message,
      });
      throw error;
    }
  };

  return {
    sendContractNotification,
  };
};
