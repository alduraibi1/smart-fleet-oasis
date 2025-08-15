
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, TrendingUp, Wrench, DollarSign } from "lucide-react";
import { useVehiclePerformanceReport, ReportFilters } from "@/hooks/useReportsData";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VehiclePerformanceReportProps {
  filters: ReportFilters;
}

export function VehiclePerformanceReport({ filters }: VehiclePerformanceReportProps) {
  const { data: vehicles, isLoading, error } = useVehiclePerformanceReport(filters);

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

  if (error || !vehicles) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">حدث خطأ في تحميل تقرير أداء المركبات</p>
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

  const chartData = vehicles.slice(0, 10).map(vehicle => ({
    name: vehicle.plateNumber,
    revenue: vehicle.totalRevenue,
    expenses: vehicle.totalExpenses,
    profit: vehicle.netProfit
  }));

  const totalFleetRevenue = vehicles.reduce((sum, v) => sum + v.totalRevenue, 0);
  const totalFleetExpenses = vehicles.reduce((sum, v) => sum + v.totalExpenses, 0);
  const avgUtilization = vehicles.length > 0 
    ? vehicles.reduce((sum, v) => sum + v.utilizationRate, 0) / vehicles.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">تقرير أداء المركبات</h2>
        <Badge>
          {vehicles.length} مركبة
        </Badge>
      </div>

      {/* Fleet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي إيرادات الأسطول</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalFleetRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي مصروفات الأسطول</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalFleetExpenses)}</p>
              </div>
              <Wrench className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي ربح الأسطول</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalFleetRevenue - totalFleetExpenses)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط معدل الاستخدام</p>
                <p className="text-2xl font-bold text-purple-600">{avgUtilization.toFixed(1)}%</p>
              </div>
              <Car className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>مقارنة أداء أفضل 10 مركبات</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ textAlign: 'right' }}
              />
              <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="الإيرادات" />
              <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="المصروفات" />
              <Bar dataKey="profit" fill="hsl(var(--chart-3))" name="صافي الربح" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Vehicle Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل أداء المركبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم اللوحة</th>
                  <th className="text-right p-3 font-medium">المركبة</th>
                  <th className="text-right p-3 font-medium">الإيرادات</th>
                  <th className="text-right p-3 font-medium">المصروفات</th>
                  <th className="text-right p-3 font-medium">صافي الربح</th>
                  <th className="text-right p-3 font-medium">معدل الاستخدام</th>
                  <th className="text-right p-3 font-medium">عدد العقود</th>
                  <th className="text-right p-3 font-medium">تكلفة الصيانة</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono">{vehicle.plateNumber}</td>
                    <td className="p-3">{vehicle.brand} {vehicle.model}</td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(vehicle.totalRevenue)}</td>
                    <td className="p-3 font-bold text-red-600">{formatCurrency(vehicle.totalExpenses)}</td>
                    <td className="p-3 font-bold text-blue-600">{formatCurrency(vehicle.netProfit)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${Math.min(vehicle.utilizationRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{vehicle.utilizationRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">{vehicle.contractsCount}</td>
                    <td className="p-3 text-orange-600">{formatCurrency(vehicle.maintenanceCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
