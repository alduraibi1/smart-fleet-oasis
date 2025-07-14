import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, User, TrendingUp, Download, Eye, DollarSign, Percent, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface OwnerProfit {
  ownerId: string;
  ownerName: string;
  phone: string;
  vehicleCount: number;
  totalRevenue: number;
  ownerShare: number;
  companyShare: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  avgRevenuePerVehicle: number;
  vehicles: {
    plateNumber: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
}

export function OwnerProfitabilityReport() {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [sortBy, setSortBy] = useState<"profit" | "revenue" | "vehicles">("profit");
  const [ownerProfits, setOwnerProfits] = useState<OwnerProfit[]>([]);

  // Mock data for demonstration
  const mockOwnerProfits: OwnerProfit[] = [
    {
      ownerId: "1",
      ownerName: "أحمد محمد الفهد",
      phone: "0501234567",
      vehicleCount: 5,
      totalRevenue: 180000,
      ownerShare: 144000, // 80%
      companyShare: 36000, // 20%
      totalExpenses: 45000,
      netProfit: 99000,
      profitMargin: 68.8,
      avgRevenuePerVehicle: 36000,
      vehicles: [
        { plateNumber: "أ ب ج 123", revenue: 45000, expenses: 12000, profit: 33000 },
        { plateNumber: "د هـ و 456", revenue: 38000, expenses: 10000, profit: 28000 },
        { plateNumber: "ز ح ط 789", revenue: 42000, expenses: 8000, profit: 34000 },
        { plateNumber: "ي ك ل 012", revenue: 30000, expenses: 8000, profit: 22000 },
        { plateNumber: "م ن س 345", revenue: 25000, expenses: 7000, profit: 18000 }
      ]
    },
    {
      ownerId: "2",
      ownerName: "فاطمة سالم العتيبي",
      phone: "0551234567",
      vehicleCount: 3,
      totalRevenue: 120000,
      ownerShare: 96000,
      companyShare: 24000,
      totalExpenses: 28000,
      netProfit: 68000,
      profitMargin: 70.8,
      avgRevenuePerVehicle: 40000,
      vehicles: [
        { plateNumber: "ع ف ص 678", revenue: 50000, expenses: 12000, profit: 38000 },
        { plateNumber: "ق ر ش 901", revenue: 45000, expenses: 10000, profit: 35000 },
        { plateNumber: "ت ث خ 234", revenue: 25000, expenses: 6000, profit: 19000 }
      ]
    },
    {
      ownerId: "3",
      ownerName: "خالد عبدالله الغامدي",
      phone: "0561234567",
      vehicleCount: 2,
      totalRevenue: 85000,
      ownerShare: 68000,
      companyShare: 17000,
      totalExpenses: 20000,
      netProfit: 48000,
      profitMargin: 70.6,
      avgRevenuePerVehicle: 42500,
      vehicles: [
        { plateNumber: "ذ ض ظ 567", revenue: 48000, expenses: 12000, profit: 36000 },
        { plateNumber: "غ ء ة 890", revenue: 37000, expenses: 8000, profit: 29000 }
      ]
    }
  ];

  useEffect(() => {
    setOwnerProfits(mockOwnerProfits);
  }, []);

  const sortedOwners = [...ownerProfits].sort((a, b) => {
    switch (sortBy) {
      case "profit":
        return b.netProfit - a.netProfit;
      case "revenue":
        return b.totalRevenue - a.totalRevenue;
      case "vehicles":
        return b.vehicleCount - a.vehicleCount;
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalRevenue = ownerProfits.reduce((sum, o) => sum + o.totalRevenue, 0);
  const totalOwnerShare = ownerProfits.reduce((sum, o) => sum + o.ownerShare, 0);
  const totalCompanyShare = ownerProfits.reduce((sum, o) => sum + o.companyShare, 0);
  const totalVehicles = ownerProfits.reduce((sum, o) => sum + o.vehicleCount, 0);
  const averageMargin = ownerProfits.length > 0 
    ? ownerProfits.reduce((sum, o) => sum + o.profitMargin, 0) / ownerProfits.length 
    : 0;

  const chartData = sortedOwners.map(owner => ({
    name: owner.ownerName.split(' ')[0],
    revenue: owner.totalRevenue,
    ownerShare: owner.ownerShare,
    companyShare: owner.companyShare,
    profit: owner.netProfit,
    vehicles: owner.vehicleCount
  }));

  const distributionData = [
    { name: "حصة المالكين", value: totalOwnerShare, color: "#10B981" },
    { name: "حصة الشركة", value: totalCompanyShare, color: "#3B82F6" }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            تقرير ربحية المالكين
          </CardTitle>
          <CardDescription>
            تحليل مفصل لربحية كل مالك وأداء مركباته
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>من تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>إلى تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>ترتيب حسب</Label>
              <Select value={sortBy} onValueChange={(value: "profit" | "revenue" | "vehicles") => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit">صافي الربح</SelectItem>
                  <SelectItem value="revenue">إجمالي الإيرادات</SelectItem>
                  <SelectItem value="vehicles">عدد المركبات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button className="flex-1">
                <Eye className="h-4 w-4 ml-2" />
                عرض التقرير
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">حصة المالكين</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalOwnerShare)}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">حصة الشركة</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalCompanyShare)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عدد المركبات</p>
                <p className="text-2xl font-bold text-orange-600">{totalVehicles}</p>
              </div>
              <Car className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط هامش الربح</p>
                <p className="text-2xl font-bold text-red-600">{averageMargin.toFixed(1)}%</p>
              </div>
              <Percent className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مقارنة إيرادات المالكين</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ textAlign: 'right' }}
                />
                <Bar dataKey="ownerShare" fill="#10B981" name="حصة المالك" />
                <Bar dataKey="companyShare" fill="#3B82F6" name="حصة الشركة" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل ربحية المالكين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">اسم المالك</th>
                  <th className="text-right p-3 font-medium">رقم الهاتف</th>
                  <th className="text-right p-3 font-medium">عدد المركبات</th>
                  <th className="text-right p-3 font-medium">إجمالي الإيرادات</th>
                  <th className="text-right p-3 font-medium">حصة المالك</th>
                  <th className="text-right p-3 font-medium">حصة الشركة</th>
                  <th className="text-right p-3 font-medium">صافي الربح</th>
                  <th className="text-right p-3 font-medium">هامش الربح</th>
                  <th className="text-right p-3 font-medium">متوسط الإيراد/مركبة</th>
                </tr>
              </thead>
              <tbody>
                {sortedOwners.map((owner) => (
                  <tr key={owner.ownerId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{owner.ownerName}</td>
                    <td className="p-3 font-mono">{owner.phone}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">{owner.vehicleCount}</Badge>
                    </td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(owner.totalRevenue)}</td>
                    <td className="p-3 font-bold text-blue-600">{formatCurrency(owner.ownerShare)}</td>
                    <td className="p-3 font-bold text-purple-600">{formatCurrency(owner.companyShare)}</td>
                    <td className="p-3 font-bold text-orange-600">{formatCurrency(owner.netProfit)}</td>
                    <td className="p-3">
                      <Badge variant={owner.profitMargin > 60 ? "default" : owner.profitMargin > 40 ? "secondary" : "destructive"}>
                        {owner.profitMargin.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-3">{formatCurrency(owner.avgRevenuePerVehicle)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Breakdown */}
      {sortedOwners.map((owner) => (
        <Card key={owner.ownerId}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              تفاصيل مركبات {owner.ownerName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3 font-medium">رقم اللوحة</th>
                    <th className="text-right p-3 font-medium">الإيرادات</th>
                    <th className="text-right p-3 font-medium">المصروفات</th>
                    <th className="text-right p-3 font-medium">صافي الربح</th>
                    <th className="text-right p-3 font-medium">الأداء</th>
                  </tr>
                </thead>
                <tbody>
                  {owner.vehicles.map((vehicle, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-mono">{vehicle.plateNumber}</td>
                      <td className="p-3 font-bold text-green-600">{formatCurrency(vehicle.revenue)}</td>
                      <td className="p-3 font-bold text-red-600">{formatCurrency(vehicle.expenses)}</td>
                      <td className="p-3 font-bold text-blue-600">{formatCurrency(vehicle.profit)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(vehicle.profit / vehicle.revenue) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">
                            {((vehicle.profit / vehicle.revenue) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}