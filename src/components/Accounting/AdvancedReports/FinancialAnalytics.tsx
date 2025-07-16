import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  Car,
  Users,
  Receipt,
  FileText,
  AlertTriangle,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ar } from "date-fns/locale";

interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  vehicleCount: number;
  activeContracts: number;
  averageRentalRate: number;
  utilizationRate: number;
}

interface ChartData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export function FinancialAnalytics() {
  const [data, setData] = useState<FinancialData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    vehicleCount: 0,
    activeContracts: 0,
    averageRentalRate: 0,
    utilizationRate: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryData[]>([]);
  const [revenueByVehicle, setRevenueByVehicle] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [periodType, setPeriodType] = useState<'month' | 'quarter' | 'year'>('month');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');

      // جلب سندات القبض
      const { data: receipts } = await supabase
        .from('payment_receipts')
        .select('*')
        .gte('payment_date', fromDate)
        .lte('payment_date', toDate)
        .eq('status', 'confirmed');

      // جلب سندات الصرف
      const { data: vouchers } = await supabase
        .from('payment_vouchers')
        .select('*')
        .gte('payment_date', fromDate)
        .lte('payment_date', toDate)
        .in('status', ['approved', 'paid']);

      // جلب بيانات المركبات
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*');

      // جلب العقود النشطة
      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select('*')
        .eq('status', 'active');

      const totalRevenue = receipts?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const totalExpenses = vouchers?.reduce((sum, v) => sum + v.amount, 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // حساب معدل الاستخدام
      const totalVehicles = vehicles?.length || 0;
      const activeContractsCount = contracts?.length || 0;
      const utilizationRate = totalVehicles > 0 ? (activeContractsCount / totalVehicles) * 100 : 0;

      // حساب متوسط السعر اليومي
      const averageRentalRate = contracts?.length > 0 
        ? contracts.reduce((sum, c) => sum + c.daily_rate, 0) / contracts.length 
        : 0;

      setData({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        vehicleCount: totalVehicles,
        activeContracts: activeContractsCount,
        averageRentalRate,
        utilizationRate
      });

      // إعداد بيانات الرسم البياني الزمني
      const dailyData = generateDailyData(receipts || [], vouchers || []);
      setChartData(dailyData);

      // إعداد بيانات فئات المصروفات
      const expenseCats = generateExpenseCategories(vouchers || []);
      setExpenseCategories(expenseCats);

      // إعداد بيانات الإيرادات حسب المركبة
      const vehicleRevenue = generateVehicleRevenue(receipts || [], vehicles || []);
      setRevenueByVehicle(vehicleRevenue);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في جلب بيانات التحليلات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDailyData = (receipts: any[], vouchers: any[]): ChartData[] => {
    const dataMap = new Map();
    
    // إضافة الإيرادات
    receipts.forEach(receipt => {
      const date = receipt.payment_date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, revenue: 0, expenses: 0, profit: 0 });
      }
      dataMap.get(date).revenue += receipt.amount;
    });

    // إضافة المصروفات
    vouchers.forEach(voucher => {
      const date = voucher.payment_date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, revenue: 0, expenses: 0, profit: 0 });
      }
      dataMap.get(date).expenses += voucher.amount;
    });

    // حساب الربح
    dataMap.forEach(data => {
      data.profit = data.revenue - data.expenses;
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const generateExpenseCategories = (vouchers: any[]): CategoryData[] => {
    const categoryMap = new Map();
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];
    
    vouchers.forEach(voucher => {
      const category = voucher.expense_category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, 0);
      }
      categoryMap.set(category, categoryMap.get(category) + voucher.amount);
    });

    const categories = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name: getCategoryLabel(name),
      value,
      color: colors[index % colors.length]
    }));

    return categories.sort((a, b) => b.value - a.value);
  };

  const generateVehicleRevenue = (receipts: any[], vehicles: any[]): CategoryData[] => {
    const vehicleMap = new Map();
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
    
    receipts.forEach(receipt => {
      if (receipt.vehicle_id) {
        if (!vehicleMap.has(receipt.vehicle_id)) {
          vehicleMap.set(receipt.vehicle_id, 0);
        }
        vehicleMap.set(receipt.vehicle_id, vehicleMap.get(receipt.vehicle_id) + receipt.amount);
      }
    });

    const vehicleRevenues = Array.from(vehicleMap.entries()).map(([vehicleId, revenue], index) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      return {
        name: vehicle ? `${vehicle.make} ${vehicle.model}` : 'مركبة غير معروفة',
        value: revenue,
        color: colors[index % colors.length]
      };
    });

    return vehicleRevenues.sort((a, b) => b.value - a.value).slice(0, 10);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'maintenance': 'صيانة',
      'fuel': 'وقود',
      'insurance': 'تأمين',
      'owner_commission': 'عمولة مالك',
      'salary': 'راتب',
      'office_expenses': 'مصاريف إدارية',
      'other': 'أخرى'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const setPredefinedRange = (type: 'month' | 'quarter' | 'year') => {
    const now = new Date();
    setPeriodType(type);
    
    switch (type) {
      case 'month':
        setDateRange({
          from: startOfMonth(now),
          to: endOfMonth(now)
        });
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        setDateRange({
          from: quarterStart,
          to: quarterEnd
        });
        break;
      case 'year':
        setDateRange({
          from: startOfYear(now),
          to: endOfYear(now)
        });
        break;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            إعدادات التحليل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Button
                variant={periodType === 'month' ? 'default' : 'outline'}
                onClick={() => setPredefinedRange('month')}
              >
                هذا الشهر
              </Button>
              <Button
                variant={periodType === 'quarter' ? 'default' : 'outline'}
                onClick={() => setPredefinedRange('quarter')}
              >
                هذا الربع
              </Button>
              <Button
                variant={periodType === 'year' ? 'default' : 'outline'}
                onClick={() => setPredefinedRange('year')}
              >
                هذا العام
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                تصدير التقرير
              </Button>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                فترة مخصصة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(dateRange.from, "dd MMM", { locale: ar })} - {format(dateRange.to, "dd MMM", { locale: ar })}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.totalExpenses)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  نسبة للإيرادات: {((data.totalExpenses / data.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صافي الربح</p>
                <p className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.netProfit)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  هامش الربح: {data.profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className={`p-2 rounded-lg ${data.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الاستخدام</p>
                <p className="text-2xl font-bold text-blue-600">{data.utilizationRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.activeContracts} من {data.vehicleCount} مركبة
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المؤشرات الثانوية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">عدد المركبات</p>
                <p className="text-2xl font-bold">{data.vehicleCount}</p>
              </div>
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العقود النشطة</p>
                <p className="text-2xl font-bold">{data.activeContracts}</p>
              </div>
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط السعر اليومي</p>
                <p className="text-2xl font-bold">{formatCurrency(data.averageRentalRate)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الإيرادات المتوقعة</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.averageRentalRate * data.activeContracts * 30)}
                </p>
                <p className="text-sm text-muted-foreground">شهرياً</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الرسم البياني الزمني */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>التدفق النقدي اليومي</CardTitle>
            <CardDescription>تطور الإيرادات والمصروفات والأرباح عبر الزمن</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), "dd/MM")}
                  />
                  <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'revenue' ? 'إيرادات' : name === 'expenses' ? 'مصروفات' : 'ربح'
                    ]}
                    labelFormatter={(value) => format(new Date(value), "dd MMMM yyyy", { locale: ar })}
                  />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* توزيع المصروفات */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع المصروفات</CardTitle>
            <CardDescription>تقسيم المصروفات حسب الفئة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* إيرادات المركبات */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل المركبات أداءً</CardTitle>
            <CardDescription>الإيرادات حسب المركبة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByVehicle.slice(0, 5)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مؤشرات الأداء المرجعية */}
      <Card>
        <CardHeader>
          <CardTitle>مؤشرات الأداء المرجعية</CardTitle>
          <CardDescription>مقارنة الأداء الحالي مع الأهداف المحددة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>معدل الاستخدام</span>
                <span>{data.utilizationRate.toFixed(1)}% / 80%</span>
              </div>
              <Progress value={data.utilizationRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                الهدف: 80% | الحالي: {data.utilizationRate.toFixed(1)}%
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>هامش الربح</span>
                <span>{data.profitMargin.toFixed(1)}% / 25%</span>
              </div>
              <Progress value={data.profitMargin > 0 ? (data.profitMargin / 25) * 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground">
                الهدف: 25% | الحالي: {data.profitMargin.toFixed(1)}%
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>الإيرادات الشهرية</span>
                <span>{formatCurrency(data.totalRevenue)} / {formatCurrency(1000000)}</span>
              </div>
              <Progress value={(data.totalRevenue / 1000000) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                الهدف: {formatCurrency(1000000)} | الحالي: {formatCurrency(data.totalRevenue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}