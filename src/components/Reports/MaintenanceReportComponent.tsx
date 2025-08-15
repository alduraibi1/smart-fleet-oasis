
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { useMaintenanceReport, ReportFilters } from "@/hooks/useReportsData";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MaintenanceReportComponentProps {
  filters: ReportFilters;
}

export function MaintenanceReportComponent({ filters }: MaintenanceReportComponentProps) {
  const { data: maintenanceData, isLoading, error } = useMaintenanceReport(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !maintenanceData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">حدث خطأ في تحميل تقرير الصيانة</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalMaintenanceCost = maintenanceData.reduce((sum, m) => sum + m.totalMaintenanceCost, 0);
  const totalMaintenanceCount = maintenanceData.reduce((sum, m) => sum + m.maintenanceCount, 0);
  const avgMaintenanceCost = totalMaintenanceCount > 0 ? totalMaintenanceCost / totalMaintenanceCount : 0;
  const vehiclesNeedingMaintenance = maintenanceData.filter(m => m.upcomingMaintenance > 0).length;

  const chartData = maintenanceData
    .filter(m => m.totalMaintenanceCost > 0)
    .slice(0, 10)
    .map(maintenance => ({
      name: maintenance.plateNumber,
      cost: maintenance.totalMaintenanceCost,
      count: maintenance.maintenanceCount,
      avgCost: maintenance.avgMaintenanceCost
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">تقرير الصيانة</h2>
        <Badge>
          {maintenanceData.length} مركبة
        </Badge>
      </div>

      {/* Maintenance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي تكلفة الصيانة</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalMaintenanceCost)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عدد عمليات الصيانة</p>
                <p className="text-2xl font-bold text-blue-600">{totalMaintenanceCount}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط تكلفة الصيانة</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(avgMaintenanceCost)}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مركبات تحتاج صيانة</p>
                <p className="text-2xl font-bold text-orange-600">{vehiclesNeedingMaintenance}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Cost Chart */}
      <Card>
        <CardHeader>
          <CardTitle>أعلى 10 مركبات من حيث تكلفة الصيانة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'cost' || name === 'avgCost') {
                    return formatCurrency(value);
                  }
                  return value;
                }}
                labelStyle={{ textAlign: 'right' }}
              />
              <Bar dataKey="cost" fill="hsl(var(--chart-1))" name="إجمالي التكلفة" />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" name="عدد مرات الصيانة" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Maintenance Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل صيانة المركبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم اللوحة</th>
                  <th className="text-right p-3 font-medium">إجمالي التكلفة</th>
                  <th className="text-right p-3 font-medium">عدد مرات الصيانة</th>
                  <th className="text-right p-3 font-medium">متوسط التكلفة</th>
                  <th className="text-right p-3 font-medium">آخر صيانة</th>
                  <th className="text-right p-3 font-medium">صيانة مجدولة</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceData.map((maintenance) => (
                  <tr key={maintenance.vehicleId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono">{maintenance.plateNumber}</td>
                    <td className="p-3 font-bold text-red-600">
                      {formatCurrency(maintenance.totalMaintenanceCost)}
                    </td>
                    <td className="p-3 text-center">{maintenance.maintenanceCount}</td>
                    <td className="p-3 text-blue-600">
                      {formatCurrency(maintenance.avgMaintenanceCost)}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {maintenance.lastMaintenanceDate 
                        ? new Date(maintenance.lastMaintenanceDate).toLocaleDateString('ar-SA')
                        : 'لا توجد'
                      }
                    </td>
                    <td className="p-3 text-center">
                      {maintenance.upcomingMaintenance > 0 ? (
                        <Badge className="bg-orange-100 text-orange-800">
                          {maintenance.upcomingMaintenance}
                        </Badge>
                      ) : (
                        <Badge variant="outline">لا توجد</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      {maintenance.upcomingMaintenance > 0 ? (
                        <Badge variant="destructive">تحتاج صيانة</Badge>
                      ) : maintenance.maintenanceCount > 0 ? (
                        <Badge className="bg-green-100 text-green-800">مصانة</Badge>
                      ) : (
                        <Badge variant="outline">جديدة</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Alerts */}
      {vehiclesNeedingMaintenance > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات الصيانة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              هناك {vehiclesNeedingMaintenance} مركبة تحتاج إلى صيانة مجدولة. يُنصح بمراجعة جدول الصيانة وتنفيذ الصيانة المطلوبة.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
