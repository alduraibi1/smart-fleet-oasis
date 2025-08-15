import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCcw, Plus, Shield } from "lucide-react";
import {
  useCostCenters,
  useCostCenterMappings,
  useCustomersMinimal,
  useVehiclesMinimal,
  ensureCostCenter,
  EntityType,
} from "./hooks/useCostCenters";

export default function CostCentersPanel() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Data queries
  const { data: centers, isLoading: centersLoading, error: centersError, refetch: refetchCenters, isFetching: centersFetching } =
    useCostCenters();
  const { data: mappings, isLoading: mappingsLoading, error: mappingsError, refetch: refetchMappings, isFetching: mappingsFetching } =
    useCostCenterMappings();

  const { data: vehiclesOptions } = useVehiclesMinimal();
  const { data: customersOptions } = useCustomersMinimal();

  // Form state
  const [entityType, setEntityType] = useState<EntityType>("vehicle");
  const [entityId, setEntityId] = useState<string>("");
  const [centerCode, setCenterCode] = useState<string>("");
  const [centerName, setCenterName] = useState<string>("");

  const loading = centersLoading || mappingsLoading;
  const fetching = centersFetching || mappingsFetching;

  const onEnsure = async () => {
    if (!entityId) {
      toast({ title: "بيانات ناقصة", description: "يرجى اختيار الكيان أولاً", variant: "destructive" });
      return;
    }
    const code = centerCode.trim() || undefined;
    const name = centerName.trim() || undefined;

    const id = await ensureCostCenter({ entityType, entityId, centerCode: code, centerName: name });
    toast({
      title: "تم الإنشاء",
      description: `تم ضمان/إنشاء مركز التكلفة (ID: ${id ?? "—"}) للكيان المحدد`,
    });

    // Refresh lists
    await Promise.all([qc.invalidateQueries({ queryKey: ["cost-centers"] }), qc.invalidateQueries({ queryKey: ["cost-center-mappings"] })]);
    setCenterCode("");
    setCenterName("");
  };

  const entityOptions = useMemo(() => {
    if (entityType === "vehicle") return vehiclesOptions ?? [];
    if (entityType === "customer") return customersOptions ?? [];
    // For owner and contract, we keep manual entry (IDs not loaded here)
    return [];
  }, [entityType, vehiclesOptions, customersOptions]);

  return (
    <div className="space-y-6">
      {/* Quick create/ensure form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-base">إنشاء/ضمان مراكز التكلفة</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchCenters();
              refetchMappings();
            }}
            disabled={fetching}
          >
            <RefreshCcw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
            <span className="sr-only">تحديث</span>
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">نوع الكيان</label>
            <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent align="center">
                <SelectItem value="vehicle">مركبة</SelectItem>
                <SelectItem value="customer">عميل</SelectItem>
                <SelectItem value="owner">مالك</SelectItem>
                <SelectItem value="contract">عقد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-muted-foreground">اختيار الكيان</label>
            {entityType === "vehicle" || entityType === "customer" ? (
              <Select
                value={entityId}
                onValueChange={(v) => setEntityId(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`اختر ${entityType === "vehicle" ? "المركبة" : "العميل"}`} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {(entityOptions || []).map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={`أدخل معرّف ${entityType === "owner" ? "المالك" : "العقد"} (UUID)`}
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                dir="ltr"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">كود مركز التكلفة (اختياري)</label>
            <Input placeholder="مثال: VH-ABC123" value={centerCode} onChange={(e) => setCenterCode(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">اسم مركز التكلفة (اختياري)</label>
            <Input placeholder="مثال: Toyota Corolla - 1234" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
          </div>

          <div className="md:col-span-5">
            <Button className="w-full md:w-auto gap-2" onClick={onEnsure}>
              <Plus className="h-4 w-4" />
              إنشاء/ضمان
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Centers table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">مراكز التكلفة</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : centersError ? (
            <div className="py-8 text-center text-red-600">حدث خطأ أثناء جلب مراكز التكلفة</div>
          ) : !centers || centers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">لا توجد مراكز تكلفة بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">الكود</TableHead>
                    <TableHead className="whitespace-nowrap">الاسم</TableHead>
                    <TableHead className="whitespace-nowrap">النوع</TableHead>
                    <TableHead className="whitespace-nowrap">الكيان المرتبط</TableHead>
                    <TableHead className="whitespace-nowrap text-center">الحالة</TableHead>
                    <TableHead className="whitespace-nowrap">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {centers.map((cc) => (
                    <TableRow key={cc.id}>
                      <TableCell className="font-medium">{cc.center_code}</TableCell>
                      <TableCell className="max-w-[280px] truncate">{cc.center_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cc.center_type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{cc.entity_id ?? "-"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={cc.is_active ? "default" : "outline"}>
                          {cc.is_active ? "نشط" : "متوقف"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cc.created_at ? new Date(cc.created_at).toLocaleDateString("ar-SA") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mappings table (compact) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">الارتباطات (Mappings)</CardTitle>
        </CardHeader>
        <CardContent>
          {mappingsLoading ? (
            <div className="py-6 text-center text-muted-foreground">جاري التحميل...</div>
          ) : mappingsError ? (
            <div className="py-6 text-center text-red-600">حدث خطأ أثناء جلب الارتباطات</div>
          ) : !mappings || mappings.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">لا توجد ارتباطات بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">نوع الكيان</TableHead>
                    <TableHead className="whitespace-nowrap">معرّف الكيان</TableHead>
                    <TableHead className="whitespace-nowrap">مركز التكلفة</TableHead>
                    <TableHead className="whitespace-nowrap">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell><Badge variant="secondary">{m.entity_type}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{m.entity_id}</TableCell>
                      <TableCell className="text-muted-foreground">{m.cost_center_id}</TableCell>
                      <TableCell>
                        {m.created_at ? new Date(m.created_at).toLocaleDateString("ar-SA") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
