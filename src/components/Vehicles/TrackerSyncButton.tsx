
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, Settings, TestTube, Eye, BarChart3 } from "lucide-react";
import { useTrackerSync } from "@/hooks/useTrackerSync";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ManualTrackerSyncDialog from "./ManualTrackerSyncDialog";
import EnhancedManualSyncDialog from "./EnhancedManualSyncDialog";
import SyncSuggestionsDialog from "./SyncSuggestionsDialog";
import TrackerSyncDashboard from "./TrackerSyncDashboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TrackerSyncButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showEnhancedManualDialog, setShowEnhancedManualDialog] = useState(false);
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  const { toast } = useToast();
  const { syncAuto } = useTrackerSync();

  const handleAutoSync = async (dryRun = false) => {
    setLoading(true);
    const res = await syncAuto(dryRun);
    setLoading(false);
    setLastSyncResult(res);

    if (!res.success) {
      toast({
        title: dryRun ? "فشل الاختبار" : "فشل المزامنة التلقائية",
        description: res.error || "تعذر تنفيذ العملية. تحقق من الإعدادات.",
        variant: "destructive",
      });
      return;
    }

    const s = res.summary!;
    let msg = "";
    
    if (dryRun) {
      const suggestionsCount = s.unmatchedSuggestions?.length || 0;
      msg = `🔍 تم اكتشاف ${s.discoveredDevices?.length || 0} جهاز\n✅ مطابقة دقيقة: ${s.matched} مركبة`;
      
      if (suggestionsCount > 0) {
        msg += `\n💡 اقتراحات للمطابقة: ${suggestionsCount}`;
      }
      
      msg += `\n⏭️ تم تخطي: ${s.skipped}`;
      
      if (s.errors.length > 0) {
        msg += `\n⚠️ تحذيرات: ${s.errors.slice(0, 2).join(", ")}`;
      }
      
      // Show suggestions dialog if we have suggestions
      if (suggestionsCount > 0) {
        setTimeout(() => setShowSuggestionsDialog(true), 500);
      }
    } else {
      msg = `✅ نجحت المزامنة!\n🎯 مطابقة: ${s.matched} مركبة\n🔄 تحديث المركبات: ${s.updatedVehicles}\n🔗 ربط الأجهزة: ${s.upsertedMappings}\n📍 تحديث المواقع: ${s.updatedLocations}`;
      
      if (s.skipped > 0) {
        msg += `\n⏭️ تخطي: ${s.skipped}`;
      }
      
      const suggestionsCount = s.unmatchedSuggestions?.length || 0;
      if (suggestionsCount > 0) {
        msg += `\n💡 ${suggestionsCount} اقتراح متاح للأجهزة غير المطابقة`;
      }
    }
    
    toast({ 
      title: dryRun ? "🧪 نتيجة اختبار الاتصال" : "🚀 مزامنة أجهزة التتبع", 
      description: msg,
      variant: s.errors.length > 0 ? "destructive" : "default",
      duration: dryRun ? 6000 : 4000
    });
  };

  const hasSuggestions = lastSyncResult?.summary?.unmatchedSuggestions?.length > 0;

  return (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            خيارات المزامنة
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setShowDashboard(true)}>
            <BarChart3 className="h-4 w-4 ml-2" />
            لوحة التحكم
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleAutoSync(false)} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            مزامنة تلقائية
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAutoSync(true)} disabled={loading}>
            <TestTube className="h-4 w-4 ml-2" />
            اختبار الاتصال
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowManualDialog(true)}>
            <Settings className="h-4 w-4 ml-2" />
            مزامنة يدوية (بسيطة)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEnhancedManualDialog(true)}>
            <Settings className="h-4 w-4 ml-2" />
            مزامنة يدوية (متقدمة)
          </DropdownMenuItem>
          
          {hasSuggestions && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowSuggestionsDialog(true)}>
                <Eye className="h-4 w-4 ml-2" />
                عرض الاقتراحات ({lastSyncResult.summary.unmatchedSuggestions.length})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={() => handleAutoSync(false)} disabled={loading} variant="default" className="gap-2">
        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "جاري المزامنة..." : "مزامنة تلقائية"}
      </Button>

      {/* Dialogs */}
      <ManualTrackerSyncDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
      />

      <EnhancedManualSyncDialog
        open={showEnhancedManualDialog}
        onOpenChange={setShowEnhancedManualDialog}
      />

      <SyncSuggestionsDialog
        open={showSuggestionsDialog}
        onOpenChange={setShowSuggestionsDialog}
        suggestions={lastSyncResult?.summary?.unmatchedSuggestions || []}
      />

      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>لوحة تحكم أجهزة التتبع</DialogTitle>
          </DialogHeader>
          <TrackerSyncDashboard />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackerSyncButton;
