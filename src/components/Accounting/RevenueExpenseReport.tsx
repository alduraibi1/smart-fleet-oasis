import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export function RevenueExpenseReport() {
  // Mock data for charts
  const monthlyData = [
    { month: "يناير", revenue: 380000, expenses: 150000, profit: 230000 },
    { month: "فبراير", revenue: 420000, expenses: 160000, profit: 260000 },
    { month: "مارس", revenue: 390000, expenses: 140000, profit: 250000 },
    { month: "أبريل", revenue: 450000, expenses: 180000, profit: 270000 },
    { month: "مايو", revenue: 480000, expenses: 190000, profit: 290000 },
    { month: "يونيو", revenue: 520000, expenses: 200000, profit: 320000 }
  ];

  const expenseBreakdown = [
    { name: "صيانة المركبات", value: 120000, color: "#8884d8" },
    { name: "قطع الغيار", value: 45000, color: "#82ca9d" },
    { name: "الوقود", value: 25000, color: "#ffc658" },
    { name: "التأمين", value: 35000, color: "#ff7c7c" },
    { name: "مصروفات إدارية", value: 15000, color: "#8dd1e1" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'revenue' ? 'الإيرادات' : 
                entry.dataKey === 'expenses' ? 'المصروفات' : 'الربح'}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">تقرير الإيرادات والمصروفات</h2>
          <p className="text-muted-foreground">تحليل مفصل للوضع المالي للشركة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            آخر 6 أشهر
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatCurrency(2640000)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                +8.5%
              </Badge>
              <span className="text-sm text-muted-foreground">مقارنة بالفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              إجمالي المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mb-2">
              {formatCurrency(1020000)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                +3.2%
              </Badge>
              <span className="text-sm text-muted-foreground">مقارنة بالفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">صافي الربح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">
              {formatCurrency(1620000)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">
                هامش ربح 61.4%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>الاتجاه الشهري للإيرادات والمصروفات</CardTitle>
            <CardDescription>مقارنة الإيرادات والمصروفات على مدى الأشهر الستة الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="الإيرادات" />
                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" strokeWidth={2} name="المصروفات" />
                <Line type="monotone" dataKey="profit" stroke="#ffc658" strokeWidth={2} name="الربح" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>تفصيل المصروفات</CardTitle>
            <CardDescription>توزيع المصروفات حسب الفئات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الإيرادات والمصروفات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2 font-medium">الشهر</th>
                  <th className="text-right p-2 font-medium">الإيرادات</th>
                  <th className="text-right p-2 font-medium">المصروفات</th>
                  <th className="text-right p-2 font-medium">صافي الربح</th>
                  <th className="text-right p-2 font-medium">هامش الربح</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">{row.month}</td>
                    <td className="p-2 text-green-600 font-medium">{formatCurrency(row.revenue)}</td>
                    <td className="p-2 text-red-600 font-medium">{formatCurrency(row.expenses)}</td>
                    <td className="p-2 text-primary font-medium">{formatCurrency(row.profit)}</td>
                    <td className="p-2">
                      <Badge variant="outline">
                        {((row.profit / row.revenue) * 100).toFixed(1)}%
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