import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Package,
  DollarSign,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
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
  Cell
} from 'recharts';
import { Badge } from "@/components/ui/badge";

const monthlyData = [
  { month: 'يناير', input: 45000, output: 38000, profit: 7000 },
  { month: 'فبراير', input: 52000, output: 46000, profit: 6000 },
  { month: 'مارس', input: 48000, output: 51000, profit: -3000 },
  { month: 'أبريل', input: 61000, output: 42000, profit: 19000 },
  { month: 'مايو', input: 55000, output: 48000, profit: 7000 },
  { month: 'يونيو', input: 67000, output: 53000, profit: 14000 },
];

const categoryPerformance = [
  { name: 'قطع غيار', value: 45, sales: 156000, growth: 12 },
  { name: 'زيوت ومواد', value: 25, sales: 89000, growth: -5 },
  { name: 'إطارات', value: 20, sales: 78000, growth: 8 },
  { name: 'أخرى', value: 10, sales: 34000, growth: 3 },
];

const topSellingItems = [
  { name: 'فلتر زيت موتور', quantity: 89, revenue: 3115, growth: 15 },
  { name: 'زيت محرك 5W-30', quantity: 67, revenue: 4355, growth: 8 },
  { name: 'فحمات فرامل', quantity: 45, revenue: 2250, growth: -3 },
  { name: 'إطار 225/60 R16', quantity: 34, revenue: 6120, growth: 22 },
  { name: 'فلتر هواء', quantity: 78, revenue: 1560, growth: 5 },
];

const stockMovement = [
  { date: '01/01', incoming: 120, outgoing: 89 },
  { date: '02/01', incoming: 95, outgoing: 134 },
  { date: '03/01', incoming: 156, outgoing: 98 },
  { date: '04/01', incoming: 78, outgoing: 167 },
  { date: '05/01', incoming: 134, outgoing: 145 },
  { date: '06/01', incoming: 189, outgoing: 112 },
  { date: '07/01', incoming: 145, outgoing: 178 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const InventoryReports = () => {
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select defaultValue="monthly">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="quarterly">ربع سنوي</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="قطع غيار">قطع غيار</SelectItem>
              <SelectItem value="زيوت ومواد">زيوت ومواد</SelectItem>
              <SelectItem value="إطارات">إطارات</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          تصدير التقرير
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي قيمة المخزون</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$485,200</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% من الشهر الماضي
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حركة المخزون</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              منتج تم بيعه هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل دوران المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2x</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">
                +0.3 من الربع الماضي
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تكلفة التخزين</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,400</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                -3.2% من الشهر الماضي
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>تحليل الأرباح والخسائر الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, '']} />
                <Bar dataKey="input" name="المدخلات" fill="hsl(var(--chart-1))" />
                <Bar dataKey="output" name="المخرجات" fill="hsl(var(--chart-2))" />
                <Bar dataKey="profit" name="الربح" fill="hsl(var(--chart-3))" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>حركة المخزون اليومية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockMovement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="incoming" stroke="hsl(var(--chart-1))" strokeWidth={2} name="الواردات" />
                <Line type="monotone" dataKey="outgoing" stroke="hsl(var(--chart-2))" strokeWidth={2} name="الصادرات" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أداء الفئات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>الكمية: {item.quantity}</span>
                      <span>الإيرادات: ${item.revenue}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={item.growth >= 0 ? "default" : "secondary"}
                    className={item.growth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {item.growth >= 0 ? '+' : ''}{item.growth}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل أداء الفئات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categoryPerformance.map((category, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{category.name}</h3>
                  <Badge 
                    variant={category.growth >= 0 ? "default" : "secondary"}
                    className={category.growth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {category.growth >= 0 ? '+' : ''}{category.growth}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">${(category.sales / 1000).toFixed(0)}k</div>
                  <div className="text-sm text-muted-foreground">إجمالي المبيعات</div>
                  <div className="text-sm text-muted-foreground">{category.value}% من المخزون</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;