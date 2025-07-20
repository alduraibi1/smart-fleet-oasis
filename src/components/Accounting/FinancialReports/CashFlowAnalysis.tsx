
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";

interface CashFlowData {
  date: string;
  receipts: number;
  vouchers: number;
  netFlow: number;
}

interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

export function CashFlowAnalysis() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryData[]>([]);
  const [summary, setSummary] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    netCashFlow: 0,
    avgDailyFlow: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categoryColors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'
  ];

  useEffect(() => {
    fetchCashFlowData();
  }, [dateRange, period]);

  const fetchCashFlowData = async () => {
    try {
      setLoading(true);

      if (!dateRange.from || !dateRange.to) return;

      // جلب سندات القبض
      const { data: receipts, error: receiptsError } = await supabase
        .from('payment_receipts')
        .select('payment_date, amount')
        .gte('payment_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('payment_date', format(dateRange.to, 'yyyy-MM-dd'))
        .eq('status', 'confirmed');

      if (receiptsError) throw receiptsError;

      // جلب سندات الصرف
      const { data: vouchers, error: vouchersError } = await supabase
        .from('payment_vouchers')
        .select('payment_date, amount, expense_category')
        .gte('payment_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('payment_date', format(dateRange.to, 'yyyy-MM-dd'))
        .in('status', ['approved', 'paid']);

      if (vouchersError) throw vouchersError;

      // تجميع البيانات حسب الفترة
      const flowData = processFlowData(receipts || [], vouchers || []);
      setCashFlowData(flowData);

      // تجميع المصروفات حسب الفئة
      const categoryData = processCategoryData(vouchers || []);
      setExpenseCategories(categoryData);

      // حساب الملخص
      const totalInflow = (receipts || []).reduce((sum, r) => sum + r.amount, 0);
      const totalOutflow = (vouchers || []).reduce((sum, v) => sum + v.amount, 0);
      const netCashFlow = totalInflow - totalOutflow;
      const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const avgDailyFlow = days > 0 ? netCashFlow / days : 0;

      setSummary({
        totalInflow,
        totalOutflow,
        netCashFlow,
        avgDailyFlow
      });

    } catch (error) {
      console.error('Error fetching cash flow data:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات التدفق النقدي",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processFlowData = (receipts: any[], vouchers: any[]): CashFlowData[] => {
    const dataMap = new Map<string, { receipts: number; vouchers: number }>();

    // معالجة سندات القبض
    receipts.forEach(receipt => {
      const date = receipt.payment_date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { receipts: 0, vouchers: 0 });
      }
      dataMap.get(date)!.receipts += receipt.amount;
    });

    // معالجة سندات الصرف
    vouchers.forEach(voucher => {
      const date = voucher.payment_date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { receipts: 0, vouchers: 0 });
      }
      dataMap.get(date)!.vouchers += voucher.amount;
    });

    // تحويل إلى مصفوفة مرتبة
    return Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        receipts: data.receipts,
        vouchers: data.vouchers,
        netFlow: data.receipts - data.vouchers
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processCategoryData = (vouchers: any[]): CategoryData[] => {
    const categoryMap = new Map<string, number>();

    vouchers.forEach(voucher => {
      const category = voucher.expense_category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + voucher.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount], index) => ({
        category: getCategoryName(category),
        amount,
        color: categoryColors[index % categoryColors.length]
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'maintenance': 'صيانة',
      'fuel': 'وقود',
      'insurance': 'تأمين',
      'owner_commission': 'عمولات المالكين',
      'salary': 'رواتب',
      'office_expenses': 'مصاريف إدارية',
      'parts_purchase': 'شراء قطع غيار',
      'oil_purchase': 'شراء زيوت',
      'service_fees': 'رسوم خدمات',
      'other': 'أخرى'
    };
    return categoryNames[category] || category;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range && range.from && range.to) {
      setDateRange(range);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تحليل التدفق النقدي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            تحليل التدفق النقدي
          </CardTitle>
          <CardDescription>
            تحليل تفصيلي للتدفقات النقدية الداخلة والخارجة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">الفترة الزمنية</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={handleDateRangeChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">نوع التجميع</label>
              <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={fetchCashFlowData}>
              <Filter className="h-4 w-4 mr-2" />
              تطبيق
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي التدفق الداخل</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalInflow)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي التدفق الخارج</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOutflow)}</p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صافي التدفق النقدي</p>
                <p className={`text-2xl font-bold ${summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netCashFlow)}
                </p>
              </div>
              <DollarSign className={`h-6 w-6 ${summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط التدفق اليومي</p>
                <p className={`text-2xl font-bold ${summary.avgDailyFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.avgDailyFlow)}
                </p>
              </div>
              <Calendar className={`h-6 w-6 ${summary.avgDailyFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* رسم بياني للتدفق النقدي */}
      <Card>
        <CardHeader>
          <CardTitle>مخطط التدفق النقدي</CardTitle>
          <CardDescription>
            عرض التدفقات النقدية الداخلة والخارجة عبر الوقت
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                />
                <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(value) => format(new Date(value), 'yyyy/MM/dd')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receipts" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="المقبوضات"
                />
                <Line 
                  type="monotone" 
                  dataKey="vouchers" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="المصروفات"
                />
                <Line 
                  type="monotone" 
                  dataKey="netFlow" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="صافي التدفق"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع المصروفات حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
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

        <Card>
          <CardHeader>
            <CardTitle>المصروفات بالأرقام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {formatCurrency(category.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
