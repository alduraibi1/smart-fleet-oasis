import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Car, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Gauge,
  Download,
  Search,
  Filter,
  Eye,
  BarChart3,
  PieChart
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

export function VehicleProfitabilityReport() {
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
  const vehiclesProfitability = [
    {
      vehicleId: "1",
      plateNumber: "أ ب ج 123",
      brand: "تويوتا كامري 2022",
      ownerId: "1",
      ownerName: "محمد أحمد الفهد",
      rentalRevenue: 24000,
      additionalChargesRevenue: 1500,
      totalRevenue: 25500,
      maintenanceCosts: 3200,
      fuelCosts: 800,
      insuranceCosts: 1200,
      depreciationCosts: 2000,
      ownerCommission: 15300, // 60% commission
      otherExpenses: 500,
      totalExpenses: 23000,
      grossProfit: 2500,
      netProfit: 2500,
      profitMargin: 9.8,
      roi: 28.5,
      utilization: 87,
      averageDailyRate: 350,
      totalRentalDays: 68,
      revenuePerDay: 375,
      isActive: true
    },
    {
      vehicleId: "2",
      plateNumber: "د هـ و 456",
      brand: "نيسان التيما 2021",
      ownerId: "2",
      ownerName: "عبدالله سالم القحطاني",
      rentalRevenue: 19200,
      additionalChargesRevenue: 800,
      totalRevenue: 20000,
      maintenanceCosts: 2800,
      fuelCosts: 600,
      insuranceCosts: 1000,
      depreciationCosts: 1800,
      ownerCommission: 12000, // 60% commission
      otherExpenses: 300,
      totalExpenses: 18500,
      grossProfit: 1500,
      netProfit: 1500,
      profitMargin: 7.5,
      roi: 22.1,
      utilization: 78,
      averageDailyRate: 320,
      totalRentalDays: 60,
      revenuePerDay: 333,
      isActive: true
    },
    {
      vehicleId: "3",
      plateNumber: "ز ح ط 789",
      brand: "هيونداي إلنترا 2023",
      ownerId: "1",
      ownerName: "محمد أحمد الفهد",
      rentalRevenue: 21600,
      additionalChargesRevenue: 1200,
      totalRevenue: 22800,
      maintenanceCosts: 1800,
      fuelCosts: 500,
      insuranceCosts: 1100,
      depreciationCosts: 2200,
      ownerCommission: 13680, // 60% commission
      otherExpenses: 400,
      totalExpenses: 19680,
      grossProfit: 3120,
      netProfit: 3120,
      profitMargin: 13.7,
      roi: 35.2,
      utilization: 92,
      averageDailyRate: 340,
      totalRentalDays: 65,
      revenuePerDay: 351,
      isActive: true
    },
    {
      vehicleId: "4",
      plateNumber: "ي ك ل 321",
      brand: "كيا أوبتيما 2020",
      ownerId: "3",
      ownerName: "فاطمة عبدالرحمن الغامدي",
      rentalRevenue: 16800,
      additionalChargesRevenue: 400,
      totalRevenue: 17200,
      maintenanceCosts: 3500,
      fuelCosts: 700,
      insuranceCosts: 900,
      depreciationCosts: 1600,
      ownerCommission: 10320, // 60% commission
      otherExpenses: 600,
      totalExpenses: 17620,
      grossProfit: -420,
      netProfit: -420,
      profitMargin: -2.4,
      roi: -5.8,
      utilization: 62,
      averageDailyRate: 280,
      totalRentalDays: 55,
      revenuePerDay: 313,
      isActive: true
    }
  ];

  const owners = [
    { id: "all", name: "جميع المالكين" },
    { id: "1", name: "محمد أحمد الفهد" },
    { id: "2", name: "عبدالله سالم القحطاني" },
    { id: "3", name: "فاطمة عبدالرحمن الغامدي" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredVehicles = vehiclesProfitability.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner = selectedOwner === "all" || vehicle.ownerId === selectedOwner;
    return matchesSearch && matchesOwner;
  });

  const totalRevenue = filteredVehicles.reduce((sum, v) => sum + v.totalRevenue, 0);
  const totalExpenses = filteredVehicles.reduce((sum, v) => sum + v.totalExpenses, 0);
  const totalProfit = filteredVehicles.reduce((sum, v) => sum + v.netProfit, 0);
  const averageROI = filteredVehicles.reduce((sum, v) => sum + v.roi, 0) / filteredVehicles.length;
  const averageUtilization = filteredVehicles.reduce((sum, v) => sum + v.utilization, 0) / filteredVehicles.length;

  const profitableVehicles = filteredVehicles.filter(v => v.netProfit > 0).length;
  const lossMakingVehicles = filteredVehicles.filter(v => v.netProfit < 0).length;

  // Chart data
  const revenueComparisonData = filteredVehicles.map(vehicle => ({
    name: vehicle.plateNumber,
    revenue: vehicle.totalRevenue,
    expenses: vehicle.totalExpenses,
    profit: vehicle.netProfit
  }));

  const expenseBreakdownData = [
    { name: "عمولة المالك", value: filteredVehicles.reduce((sum, v) => sum + v.ownerCommission, 0), color: "#8884d8" },
    { name: "صيانة", value: filteredVehicles.reduce((sum, v) => sum + v.maintenanceCosts, 0), color: "#82ca9d" },
    { name: "إهلاك", value: filteredVehicles.reduce((sum, v) => sum + v.depreciationCosts, 0), color: "#ffc658" },
    { name: "تأمين", value: filteredVehicles.reduce((sum, v) => sum + v.insuranceCosts, 0), color: "#ff7c7c" },
    { name: "وقود", value: filteredVehicles.reduce((sum, v) => sum + v.fuelCosts, 0), color: "#8dd1e1" },
    { name: "أخرى", value: filteredVehicles.reduce((sum, v) => sum + v.otherExpenses, 0), color: "#d084d0" }
  ];

  const utilizationData = filteredVehicles.map(vehicle => ({
    name: vehicle.plateNumber,
    utilization: vehicle.utilization,
    roi: vehicle.roi
  }));

  const getPerformanceBadge = (profitMargin: number) => {
    if (profitMargin > 15) return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
    if (profitMargin > 8) return <Badge className="bg-blue-100 text-blue-800">جيد</Badge>;
    if (profitMargin > 0) return <Badge className="bg-yellow-100 text-yellow-800">متوسط</Badge>;
    return <Badge variant="destructive">خسارة</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">تقرير ربحية المركبات</h2>
          <p className="text-muted-foreground">تحليل مفصل لأداء كل مركبة والعائد على الاستثمار</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            المرشحات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="period">الفترة الزمنية</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">الشهر الحالي</SelectItem>
                  <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                  <SelectItem value="6months">آخر 6 أشهر</SelectItem>
                  <SelectItem value="12months">آخر 12 شهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="owner">المالك</Label>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث برقم اللوحة أو نوع المركبة أو المالك..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              إجمالي المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              صافي الربح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-600" />
              متوسط العائد على الاستثمار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {averageROI.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4 text-purple-600" />
              متوسط الاستخدام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {averageUtilization.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">نظرة عامة على الأداء</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">المركبات الرابحة</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">{profitableVehicles}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({((profitableVehicles / filteredVehicles.length) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">المركبات الخاسرة</span>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{lossMakingVehicles}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({((lossMakingVehicles / filteredVehicles.length) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">إجمالي المركبات</span>
              <Badge variant="outline">{filteredVehicles.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>مقارنة الإيرادات والمصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#8884d8" name="الإيرادات" />
                <Bar dataKey="expenses" fill="#82ca9d" name="المصروفات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              توزيع المصروفات
            </CardTitle>
            <CardDescription>تفصيل المصروفات حسب الفئات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization vs ROI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              معدل الاستخدام مقابل العائد على الاستثمار
            </CardTitle>
            <CardDescription>العلاقة بين معدل الاستخدام والعائد</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="utilization" fill="#8884d8" name="معدل الاستخدام %" />
                <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#ff7c7c" strokeWidth={2} name="العائد على الاستثمار %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            تفاصيل ربحية المركبات
          </CardTitle>
          <CardDescription>
            تحليل مفصل لكل مركبة مع جميع المؤشرات المالية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">المركبة</th>
                  <th className="text-right p-3 font-medium">المالك</th>
                  <th className="text-right p-3 font-medium">الإيرادات</th>
                  <th className="text-right p-3 font-medium">المصروفات</th>
                  <th className="text-right p-3 font-medium">صافي الربح</th>
                  <th className="text-right p-3 font-medium">هامش الربح</th>
                  <th className="text-right p-3 font-medium">العائد على الاستثمار</th>
                  <th className="text-right p-3 font-medium">معدل الاستخدام</th>
                  <th className="text-right p-3 font-medium">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{vehicle.plateNumber}</div>
                        <div className="text-xs text-muted-foreground">{vehicle.brand}</div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{vehicle.ownerName}</td>
                    <td className="p-3 font-medium text-green-600">
                      {formatCurrency(vehicle.totalRevenue)}
                    </td>
                    <td className="p-3 font-medium text-red-600">
                      {formatCurrency(vehicle.totalExpenses)}
                    </td>
                    <td className={`p-3 font-bold ${vehicle.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(vehicle.netProfit)}
                    </td>
                    <td className={`p-3 font-medium ${vehicle.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {vehicle.profitMargin.toFixed(1)}%
                    </td>
                    <td className={`p-3 font-medium ${vehicle.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {vehicle.roi.toFixed(1)}%
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(vehicle.utilization, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{vehicle.utilization}%</span>
                      </div>
                    </td>
                    <td className="p-3">{getPerformanceBadge(vehicle.profitMargin)}</td>
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