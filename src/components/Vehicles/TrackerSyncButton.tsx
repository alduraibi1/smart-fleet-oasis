
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, Settings } from "lucide-react";
import { useTrackerSync } from "@/hooks/useTrackerSync";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ManualTrackerSyncDialog from "./ManualTrackerSyncDialog";

const TrackerSyncButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const { toast } = useToast();
  const { syncAuto } = useTrackerSync();

  const handleAutoSync = async () => {
    setLoading(true);
    const res = await syncAuto();
    setLoading(false);

    if (!res.success) {
      toast({
        title: "فشل المزامنة التلقائية",
        description: res.error || "تعذر تنفيذ المزامنة التلقائية. يمكن تخصيص المسارات أو استخدام الإدخال اليدوي.",
        variant: "destructive",
      });
      return;
    }

    const s = res.summary!;
    const msg = `تمت مطابقة ${s.matched} مركبة، تحديث المركبات: ${s.updatedVehicles}، ربط الأجهزة: ${s.upsertedMappings}، تحديث المواقع: ${s.updatedLocations}، تخطي: ${s.skipped}`;
    toast({ 
      title: "مزامنة أجهزة التتبع", 
      description: msg 
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            خيارات المزامنة
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleAutoSync} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            مزامنة تلقائية
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowManualDialog(true)}>
            <Settings className="h-4 w-4 ml-2" />
            مزامنة يدوية
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={handleAutoSync} disabled={loading} variant="default" className="gap-2">
        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "جاري المزامنة..." : "مزامنة تلقائية"}
      </Button>

      <ManualTrackerSyncDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
      />
    </div>
  );
};

export default TrackerSyncButton;
