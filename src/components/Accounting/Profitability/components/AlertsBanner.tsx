
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { useAlerts } from "../hooks/useAlerts";

export function AlertsBanner() {
  const { data: alerts, isLoading, error } = useAlerts();

  if (isLoading || error || !alerts || alerts.length === 0) return null;

  const critical = alerts.filter((a) => a.severity === "critical");
  const warning = alerts.filter((a) => a.severity === "warning");
  const info = alerts.filter((a) => a.severity === "info");

  const top = alerts.slice(0, 3);

  return (
    <Card className="border-destructive/30">
      <CardContent className="py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-medium">
              تنبيهات الربحية: {alerts.length} (حرج: {critical.length}، تحذير: {warning.length}، معلومات: {info.length})
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
          {top.map((a) => (
            <div key={a.entity_id} className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {a.entity_name} - الحالة: {a.severity} - القيمة الحالية: {Number(a.current_value).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
