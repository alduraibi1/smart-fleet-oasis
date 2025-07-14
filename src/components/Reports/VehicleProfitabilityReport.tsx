import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, Car, TrendingUp, TrendingDown, Download, Eye, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface VehicleProfit {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  utilizationRate: number;
  revenueBreakdown: {
    rental: number;
    maintenance: number;
    insurance: number;
    other: number;
  };
}

export function VehicleProfitabilityReport() {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"profit" | "revenue" | "margin">("profit");
  const [vehicleProfits, setVehicleProfits] = useState<VehicleProfit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockVehicleProfits: VehicleProfit[] = [
    {
      vehicleId: "1",
      plateNumber: "أ ب ج 123",
      brand: "تويوتا",
      model: "كامري",
      totalRevenue: 45000,
      totalExpenses: 12000,
      netProfit: 33000,
      profitMargin: 73.3,
      utilizationRate: 85,
      revenueBreakdown: {
        rental: 40000,
        maintenance: 3000,
        insurance: 1500,
        other: 500
      }
    },
    {
      vehicleId: "2", 
      plateNumber: "د هـ و 456",
      brand: "هيونداي",
      model: "النترا",
      totalRevenue: 38000,
      totalExpenses: 15000,
      netProfit: 23000,
      profitMargin: 60.5,
      utilizationRate: 78,
      revenueBreakdown: {
        rental: 35000,
        maintenance: 2000,
        insurance: 800,
        other: 200
      }
    },
    {
      vehicleId: "3",
      plateNumber: "ز ح ط 789",
      brand: "نيسان",
      model: "التيما",
      totalRevenue: 42000,
      totalExpenses: 18000,
      netProfit: 24000,
      profitMargin: 57.1,
      utilizationRate: 90,
      revenueBreakdown: {
        rental: 38000,
        maintenance: 2500,
        insurance: 1200,
        other: 300
      }
    }
  ];

  useEffect(() => {
    setVehicleProfits(mockVehicleProfits);
  }, []);

  const sortedVehicles = [...vehicleProfits].sort((a, b) => {
    switch (sortBy) {
      case "profit":
        return b.netProfit - a.netProfit;
      case "revenue":
        return b.totalRevenue - a.totalRevenue;
      case "margin":
        return b.profitMargin - a.profitMargin;
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

  const totalRevenue = vehicleProfits.reduce((sum, v) => sum + v.totalRevenue, 0);
  const totalExpenses = vehicleProfits.reduce((sum, v) => sum + v.totalExpenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const averageMargin = vehicleProfits.length > 0 
    ? vehicleProfits.reduce((sum, v) => sum + v.profitMargin, 0) / vehicleProfits.length 
    : 0;

  const chartData = sortedVehicles.map(vehicle => ({
    name: vehicle.plateNumber,
    revenue: vehicle.totalRevenue,
    expenses: vehicle.totalExpenses,
    profit: vehicle.netProfit,
    margin: vehicle.profitMargin
  }));

  const pieChartData = [
    { name: "إيرادات إيجار", value: vehicleProfits.reduce((sum, v) => sum + v.revenueBreakdown.rental, 0), color: "#10B981" },
    { name: "صيانة", value: vehicleProfits.reduce((sum, v) => sum + v.revenueBreakdown.maintenance, 0), color: "#F59E0B" },
    { name: "تأمين", value: vehicleProfits.reduce((sum, v) => sum + v.revenueBreakdown.insurance, 0), color: "#EF4444" },
    { name: "أخرى", value: vehicleProfits.reduce((sum, v) => sum + v.revenueBreakdown.other, 0), color: "#8B5CF6" }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            تقرير ربحية المركبات
          </CardTitle>
          <CardDescription>
            تحليل مفصل لربحية كل مركبة في الأسطول
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <Label>المركبة</Label>
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المركبات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المركبات</SelectItem>
                  <SelectItem value="sedan">سيدان</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="hatchback">هاتشباك</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>ترتيب حسب</Label>
              <Select value={sortBy} onValueChange={(value: "profit" | "revenue" | "margin") => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit">صافي الربح</SelectItem>
                  <SelectItem value="revenue">إجمالي الإيرادات</SelectItem>
                  <SelectItem value="margin">هامش الربح</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط هامش الربح</p>
                <p className="text-2xl font-bold text-purple-600">{averageMargin.toFixed(1)}%</p>
              </div>
              <Percent className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مقارنة الإيرادات والمصروفات</CardTitle>
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
                <Bar dataKey="revenue" fill="#10B981" name="الإيرادات" />
                <Bar dataKey="expenses" fill="#EF4444" name="المصروفات" />
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
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
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
          <CardTitle>تفاصيل ربحية المركبات</CardTitle>
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
                  <th className="text-right p-3 font-medium">هامش الربح</th>
                  <th className="text-right p-3 font-medium">معدل الاستخدام</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {sortedVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono">{vehicle.plateNumber}</td>
                    <td className="p-3">{vehicle.brand} {vehicle.model}</td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(vehicle.totalRevenue)}</td>
                    <td className="p-3 font-bold text-red-600">{formatCurrency(vehicle.totalExpenses)}</td>
                    <td className="p-3 font-bold text-blue-600">{formatCurrency(vehicle.netProfit)}</td>
                    <td className="p-3">
                      <Badge variant={vehicle.profitMargin > 60 ? "default" : vehicle.profitMargin > 40 ? "secondary" : "destructive"}>
                        {vehicle.profitMargin.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${vehicle.utilizationRate}%` }}
                          />
                        </div>
                        <span className="text-sm">{vehicle.utilizationRate}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={vehicle.profitMargin > 50 ? "default" : "secondary"}>
                        {vehicle.profitMargin > 50 ? "ممتاز" : vehicle.profitMargin > 30 ? "جيد" : "يحتاج تحسين"}
                      </Badge>
                    </td>
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