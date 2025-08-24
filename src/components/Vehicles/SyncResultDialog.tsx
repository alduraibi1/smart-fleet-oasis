
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";
import type { TrackerSyncSummary } from "@/hooks/useTrackerSync";

interface SyncResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: TrackerSyncSummary | null;
}

const SyncResultDialog: React.FC<SyncResultDialogProps> = ({ open, onOpenChange, result }) => {
  const summary = result?.summary;
  const errors = summary?.errors ?? [];
  const suggestions = summary?.unmatchedSuggestions ?? [];
  const discovered = summary?.discoveredDevices ?? [];

  const copyErrors = () => {
    const text = [
      "Sync Summary:",
      `- Matched: ${summary?.matched ?? 0}`,
      `- Updated Vehicles: ${summary?.updatedVehicles ?? 0}`,
      `- Upserted Mappings: ${summary?.upsertedMappings ?? 0}`,
      `- Updated Locations: ${summary?.updatedLocations ?? 0}`,
      `- Skipped: ${summary?.skipped ?? 0}`,
      `- Discovered Devices: ${discovered.length}`,
      "",
      "Errors:",
      ...(errors.length ? errors : ["No errors"])
    ].join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>تفاصيل نتيجة المزامنة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">الوضع: {summary?.mode ?? "auto"}</Badge>
            <Badge variant="outline">مطابقات: {summary?.matched ?? 0}</Badge>
            <Badge variant="outline">تحديث مركبات: {summary?.updatedVehicles ?? 0}</Badge>
            <Badge variant="outline">تحديث مواقع: {summary?.updatedLocations ?? 0}</Badge>
            <Badge variant="outline">تجاوزت: {summary?.skipped ?? 0}</Badge>
            <Badge variant="outline">أجهزة مكتشفة: {discovered.length}</Badge>
          </div>

          {errors.length > 0 && (
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">الأخطاء</div>
                <Button variant="outline" size="sm" className="gap-2" onClick={copyErrors}>
                  <Copy className="h-4 w-4" />
                  نسخ
                </Button>
              </div>
              <ScrollArea className="h-40">
                <ul className="list-disc pr-5 space-y-1 text-red-600">
                  {errors.map((e, i) => (
                    <li key={i} className="text-sm">{e}</li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="rounded-lg border p-3">
              <div className="font-medium mb-2">اقتراحات المطابقة (غير المؤكدة)</div>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {suggestions.map((s, idx) => (
                    <div key={idx} className="rounded border p-2">
                      <div className="text-sm mb-1">
                        لوحة الجهاز: <span className="font-semibold">{s.devicePlate}</span> 
                        <span className="text-muted-foreground mr-2">({s.normalizedPlate})</span>
                      </div>
                      <ul className="text-xs space-y-1">
                        {s.topCandidates.map((c, ci) => (
                          <li key={ci} className="flex items-center justify-between">
                            <span>مرشح: {c.plate}</span>
                            <span className="text-muted-foreground">السبب: {c.reason} • الدرجة: {(c.score * 100).toFixed(0)}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {discovered.length > 0 && (
            <div className="rounded-lg border p-3">
              <div className="font-medium mb-2">عينة من الأجهزة المكتشفة</div>
              <ul className="text-sm space-y-1">
                {discovered.slice(0, 5).map((d, i) => (
                  <li key={`${d.trackerId}-${i}`} className="flex items-center justify-between">
                    <span>لوحة: {d.plate}</span>
                    <span className="text-muted-foreground">ID: {d.trackerId}</span>
                  </li>
                ))}
              </ul>
              {discovered.length > 5 && (
                <div className="text-xs text-muted-foreground mt-1">
                  والمزيد ({discovered.length - 5})...
                </div>
              )}
            </div>
          )}

          {!errors.length && !suggestions.length && discovered.length === 0 && (
            <div className="text-sm text-muted-foreground">
              لا توجد تفاصيل إضافية لعرضها.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncResultDialog;
