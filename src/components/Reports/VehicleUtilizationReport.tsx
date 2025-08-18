
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Car, 
  Calendar, 
  TrendingUp, 
  MapPin,
  Fuel,
  Settings,
  DollarSign,
  Clock
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

interface VehicleUtilization {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  type: string;
  totalDays: number;
  rentedDays: number;
  availableDays: number;
  maintenanceDays: number;
  utilizationRate: number;
  revenue: number;
  averageDailyRate: number;
  totalMileage: number;
  fuelCost: number;
  maintenanceCost: number;
  profitability: number;
}

export function VehicleUtilizationReport() {
  const [sortBy, setSortBy] = useState('utilization');
  const [vehicleType, setVehicleType] = useState('all');
  const [timePeriod, setTimePeriod] = useState('month');

  // بيانات وهمية لاستخدام المركبات
  const vehicleData: VehicleUtilization[] = [
    {
      vehicleId: "1",
      plateNumber: "أ ب ج 123",
      brand: "تويوتا",
      model: "كامري",
      type: "سيدان",
      totalDays: 30,
      rentedDays: 26,
      availableDays: 2,
      maintenanceDays: 2,
      utilizationRate: 86.7,
      revenue: 39000,
      averageDailyRate: 1500,
      totalMileage: 3200,
      fuelCost: 1200,
      maintenanceCost: 800,
      profitability: 37000
    },
    {
      vehicleId: "2",
      plateNumber: "د هـ و 456",
      brand: "هيونداي",
      model: "النترا",
      type: "سيدان",
      totalDays: 30,
      rentedDays: 22,
      availableDays: 6,
      maintenanceDays: 2,
      utilizationRate: 73.3,
      revenue: 28600,
      averageDailyRate: 1300,
      totalMileage: 2800,
      fuelCost: 1050,
      maintenanceCost: 600,
      profitability: 26950
    },
    {
      vehicleId: "3",
      plateNumber: "ز ح ط 789",
      brand: "نيسان",
      model: "التيما",
      type: "سيدان",
      totalDays: 30,
      rentedDays: 28,
      availableDays: 1,
      maintenanceDays: 1,
      utilizationRate: 93.3,
      revenue: 42000,
      averageDailyRate: 1500,
      totalMileage: 3600,
      fuelCost: 1350,
      maintenanceCost: 450,
      profitability: 40200
    },
    {
      vehicleId: "4",
      plateNumber: "ي ك ل 321",
      brand: "فورد",
      model: "إكسبلورر",
      type: "SUV",
      totalDays: 30,
      rentedDays: 24,
      availableDays: 3,
      maintenanceDays: 3,
      utilizationRate: 80.0,
      revenue: 48000,
      averageDailyRate: 2000,
      totalMileage: 2900,
      fuelCost: 1800,
      maintenanceCost: 1200,
      profitability: 45000
    }
  ];

  // حساب الإحصائيات العامة
  const totalVehicles = vehicleData.length;
  const avgUtilization = vehicleData.reduce((sum, v) => sum + v.utilizationRate, 0) / totalVehicles;
  const totalRevenue = vehicleData.reduce((sum, v) => sum + v.revenue, 0);
  const totalProfitability = vehicleData.reduce((sum, v) => sum + v.profitability, 0);

  // ترتيب البيانات
  const sortedVehicles = [...vehicleData].sort((a, b) => {
    switch (sortBy) {
      case 'utilization':
        return b.utilizationRate - a.utilizationRate;
      case 'revenue':
        return b.revenue - a.revenue;
      case 'profitability':
        return b.profitability - a.profitability;
      default:
        return 0;
    }
  });

  // بيانات الرسم البياني للاستخدام اليومي
  const dailyUtilization = [
    { day: 'الأحد', utilized: 85, available: 15 },
    { day: 'الاثنين', utilized: 92, available: 8 },
    { day: 'الثلاثاء', utilized: 78, available: 22 },
    { day: 'الأربعاء', utilized: 88, available: 12 },
    { day: 'الخميس', utilized: 95, available: 5 },
    { day: 'الجمعة', utilized: 72, available: 28 },
    { day: 'السبت', utilized: 89, available: 11 }
  ];

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-blue-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
    if (rate >= 75) return <Badge className="bg-blue-100 text-blue-800">جيد</Badge>;
    if (rate >= 60) return <Badge className="bg-yellow-100 text-yellow-800">متوسط</Badge>;
    return <Badge className="bg-red-100 text-red-800">ضعيف</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utilization">معدل الاستخدام</SelectItem>
              <SelectItem value="revenue">الإيرادات</SelectItem>
              <SelectItem value="profitability">الربحية</SelectItem>
            </SelectContent>
          </Select>

          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المركبات</SelectItem>
              <SelectItem value="sedan">سيدان</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="hatchback">هاتشباك</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوعي</SelectItem>
              <SelectItem value="month">شهري</SelectItem>
              <SelectItem value="quarter">ربعي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          تخصيص الفترة
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المركبات</p>
                <p className="text-2xl font-bold">{totalVehicles}</p>
              </div>
              <Car className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط الاستخدام</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(avgUtilization)}`}>
                  {avgUtilization.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalRevenue.toLocaleString()} ريال
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalProfitability.toLocaleString()} ريال
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Utilization Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            معدل الاستخدام اليومي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar dataKey="utilized" fill="#10B981" name="مستخدم" />
              <Bar dataKey="available" fill="#EF4444" name="متاح" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vehicle Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل استخدام المركبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم اللوحة</th>
                  <th className="text-right p-3 font-medium">المركبة</th>
                  <th className="text-right p-3 font-medium">النوع</th>
                  <th className="text-right p-3 font-medium">أيام الإيجار</th>
                  <th className="text-right p-3 font-medium">معدل الاستخدام</th>
                  <th className="text-right p-3 font-medium">الإيرادات</th>
                  <th className="text-right p-3 font-medium">المعدل اليومي</th>
                  <th className="text-right p-3 font-medium">الأداء</th>
                </tr>
              </thead>
              <tbody>
                {sortedVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono font-bold">{vehicle.plateNumber}</td>
                    <td className="p-3">{vehicle.brand} {vehicle.model}</td>
                    <td className="p-3">
                      <Badge variant="outline">{vehicle.type}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-center">
                        <div className="font-bold">{vehicle.rentedDays}</div>
                        <div className="text-xs text-muted-foreground">
                          من {vehicle.totalDays}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${getUtilizationColor(vehicle.utilizationRate)}`}>
                            {vehicle.utilizationRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={vehicle.utilizationRate} className="h-2" />
                      </div>
                    </td>
                    <td className="p-3 font-bold text-green-600">
                      {vehicle.revenue.toLocaleString()} ريال
                    </td>
                    <td className="p-3 font-bold">
                      {vehicle.averageDailyRate.toLocaleString()} ريال
                    </td>
                    <td className="p-3">
                      {getUtilizationBadge(vehicle.utilizationRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              تحليل التكاليف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedVehicles.slice(0, 3).map((vehicle, index) => {
                const totalCosts = vehicle.fuelCost + vehicle.maintenanceCost;
                const netProfit = vehicle.revenue - totalCosts;
                const profitMargin = (netProfit / vehicle.revenue) * 100;
                
                return (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{vehicle.plateNumber}</span>
                      <Badge variant={profitMargin > 80 ? "default" : "secondary"}>
                        هامش ربح {profitMargin.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">وقود:</span>
                        <div className="font-bold text-orange-600">
                          {vehicle.fuelCost.toLocaleString()} ريال
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">صيانة:</span>
                        <div className="font-bold text-red-600">
                          {vehicle.maintenanceCost.toLocaleString()} ريال
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">صافي:</span>
                        <div className="font-bold text-green-600">
                          {netProfit.toLocaleString()} ريال
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              إحصائيات الاستخدام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span>مركبات بأداء ممتاز (90%+)</span>
                <Badge className="bg-green-100 text-green-800">
                  {vehicleData.filter(v => v.utilizationRate >= 90).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span>مركبات بأداء جيد (75-89%)</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {vehicleData.filter(v => v.utilizationRate >= 75 && v.utilizationRate < 90).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span>مركبات بأداء متوسط (60-74%)</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {vehicleData.filter(v => v.utilizationRate >= 60 && v.utilizationRate < 75).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span>مركبات تحتاج تحسين (أقل من 60%)</span>
                <Badge className="bg-red-100 text-red-800">
                  {vehicleData.filter(v => v.utilizationRate < 60).length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
