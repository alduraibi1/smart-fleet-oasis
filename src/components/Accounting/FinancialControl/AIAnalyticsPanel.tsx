
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useFinancialAnomalies,
  useFinancialPredictions,
  useBehavioralAnalyticsRecent,
  generateVehiclePredictions,
  detectAnomalies,
  analyzeCustomerBehavior,
} from "./hooks/useAIAnalytics";
import { useVehiclesMinimal, useCustomersMinimal } from "./hooks/useCostCenters";
import { AlertTriangle, Activity, LineChart } from "lucide-react";

export default function AIAnalyticsPanel() {
  const { toast } = useToast();

  const { data: predictions, isLoading: loadingPred } = useFinancialPredictions();
  const { data: anomalies, isLoading: loadingAnoms } = useFinancialAnomalies();
  const { data: behaviors, isLoading: loadingBehav } = useBehavioralAnalyticsRecent();

  const { data: vehicles } = useVehiclesMinimal();
  const { data: customers } = useCustomersMinimal();

  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>();
  const [months, setMonths] = useState<number>(3);
  const [busy, setBusy] = useState<boolean>(false);

  const openAnomalies = useMemo(
    () => (anomalies || []).filter((a) => a.investigation_status === "open"),
    [anomalies]
  );

  const handleGenerate = async () => {
    if (!selectedVehicle) {
      toast({ title: "اختر مركبة أولاً", variant: "destructive" });
      return;
    }
    setBusy(true);
    generateVehiclePredictions(selectedVehicle, months)
      .then(() => {
        toast({ title: "تم توليد التنبؤات بنجاح" });
      })
      .catch((e) => {
        console.error(e);
        toast({ title: "فشل توليد التنبؤات", description: String(e), variant: "destructive" });
      })
      .finally(() => setBusy(false));
  };

  const handleDetect = async () => {
    setBusy(true);
    detectAnomalies()
      .then((count) => {
        toast({ title: "تم فحص الشذوذات", description: `عدد الحالات المكتشفة: ${count}` });
      })
      .catch((e) => {
        console.error(e);
        toast({ title: "فشل فحص الشذوذات", description: String(e), variant: "destructive" });
      })
      .finally(() => setBusy(false));
  };

  const handleAnalyze = async () => {
    if (!selectedCustomer) {
      toast({ title: "اختر عميلًا أولاً", variant: "destructive" });
      return;
    }
    setBusy(true);
    analyzeCustomerBehavior(selectedCustomer)
      .then(() => {
        toast({ title: "تم تحليل سلوك العميل بنجاح" });
      })
      .catch((e) => {
        console.error(e);
        toast({ title: "فشل تحليل السلوك", description: String(e), variant: "destructive" });
      })
      .finally(() => setBusy(false));
  };

  return (
    <div className="space-y-6">
      {/* ملخص علوي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="التنبؤات الأخيرة"
          value={loadingPred ? <Skeleton className="h-7 w-24" /> : predictions?.length ?? 0}
          icon={<LineChart className="h-5 w-5 text-primary" />}
        />
        <SummaryCard
          title="الشذوذات المفتوحة"
          value={loadingAnoms ? <Skeleton className="h-7 w-24" /> : openAnomalies.length}
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
        />
        <SummaryCard
          title="تحليلات سلوكية"
          value={loadingBehav ? <Skeleton className="h-7 w-24" /> : behaviors?.length ?? 0}
          icon={<Activity className="h-5 w-5 text-green-600" />}
        />
      </div>

      {/* إجراءات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات الذكاء الاصطناعي</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">توليد تنبؤات للمركبة</p>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر مركبة" />
              </SelectTrigger>
              <SelectContent>
                {(vehicles || []).map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(months)}
              onValueChange={(v) => setMonths(Number(v))}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="عدد الأشهر" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((m) => (
                  <SelectItem key={m} value={String(m)}>{m} شهر</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="mt-2" onClick={handleGenerate} disabled={busy}>
              توليد التنبؤات
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">فحص الشذوذات المالية</p>
            <Button variant="outline" onClick={handleDetect} disabled={busy}>
              فحص الآن
            </Button>
            <p className="text-xs text-muted-foreground">سيتم تحليل الإيرادات الأخيرة وإضافة الحالات الشاذة.</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">تحليل سلوك عميل</p>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر عميلًا" />
              </SelectTrigger>
              <SelectContent>
                {(customers || []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="mt-2" onClick={handleAnalyze} disabled={busy}>
              تحليل السلوك
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* سجلات مختصرة */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="anomalies">الشذوذات</TabsTrigger>
          <TabsTrigger value="behavior">السلوك</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>أحدث التنبؤات</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPred ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : (predictions || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد بيانات بعد</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(predictions || []).slice(0, 6).map((p) => (
                    <div key={p.id} className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">
                        النوع: {p.prediction_type} • الكيان: {p.entity_type}
                      </p>
                      <p className="text-lg font-semibold mt-1">
                        {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(p.predicted_value || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        التاريخ: {p.prediction_date}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies">
          <Card>
            <CardHeader>
              <CardTitle>أحدث الشذوذات</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAnoms ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : (anomalies || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد بيانات بعد</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(anomalies || []).slice(0, 6).map((a) => (
                    <div key={a.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          {a.anomaly_type} • {a.entity_type}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                          {a.investigation_status}
                        </span>
                      </div>
                      <p className="text-sm mt-2">
                        الانحراف: {(a.deviation_percentage ?? 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        المكتشَف: {a.detected_at ?? a.created_at ?? ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات سلوكية حديثة</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBehav ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : (behaviors || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-6">لا توجد بيانات بعد</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(behaviors || []).slice(0, 6).map((b) => (
                    <div key={b.id} className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">
                        النوع: {b.analysis_type} • {b.entity_type}
                      </p>
                      <p className="text-sm mt-2">
                        المخاطر: {(b.risk_score ?? 0).toFixed(1)} • الفرص: {(b.opportunity_score ?? 0).toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        الإنشاء: {b.created_at ?? ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: number | string | JSX.Element; icon?: React.ReactNode }) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div className="mt-2 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
