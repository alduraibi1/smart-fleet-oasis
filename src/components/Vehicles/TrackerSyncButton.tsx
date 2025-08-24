
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw } from "lucide-react";
import { useTrackerSync } from "@/hooks/useTrackerSync";

const TrackerSyncButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { syncAuto } = useTrackerSync();

  const handleSync = async () => {
    setLoading(true);
    const res = await syncAuto();
    setLoading(false);

    if (!res.success) {
      toast({
        title: "فشل المزامنة",
        description: res.error || "تعذر تنفيذ المزامنة التلقائية. يمكن تخصيص المسارات أو استخدام الإدخال اليدوي.",
        variant: "destructive",
      });
      return;
    }

    const s = res.summary!;
    const msg = `تمت مطابقة ${s.matched} مركبة، تحديث المركبات: ${s.updatedVehicles}، ربط الأجهزة: ${s.upsertedMappings}، تحديث المواقع: ${s.updatedLocations}، تخطي: ${s.skipped}`;
    toast({ title: "مزامنة أجهزة التتبع", description: msg });
  };

  return (
    <div className="flex items-center justify-end">
      <Button onClick={handleSync} disabled={loading} variant="default" className="gap-2">
        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "جاري المزامنة..." : "مزامنة أجهزة التتبع"}
      </Button>
    </div>
  );
};

export default TrackerSyncButton;
