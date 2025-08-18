
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  PieChart,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from "recharts";

export function FinancialPerformanceReport() {
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [reportType, setReportType] = useState('revenue');

  // بيانات وهمية للإيرادات الشهرية
  const monthlyData = [
    { month: 'يناير', revenue: 245000, expenses: 87000, profit: 158000, contracts: 45 },
    { month: 'فبراير', revenue: 287000, expenses: 95000, profit: 192000, contracts: 52 },
    { month: 'مارس', revenue: 312000, expenses: 102000, profit: 210000, contracts: 58 },
    { month: 'أبريل', revenue: 298000, expenses: 89000, profit: 209000, contracts: 55 },
    { month: 'مايو', revenue: 334000, expenses: 112000, profit: 222000, contracts: 62 },
    { month: 'يونيو', revenue: 356000, expenses: 118000, profit: 238000, contracts: 67 }
  ];

  // بيانات توزيع الإيرادات
  const revenueDistribution = [
    { name: 'إيجار السيارات', value: 2850000, color: '#10B981' },
    { name: 'رسوم إضافية', value: 185000, color: '#3B82F6' },
    { name: 'خدمات التأمين', value: 125000, color: '#8B5CF6' },
    { name: 'أخرى', value: 92000, color: '#F59E0B' }
  ];

  // حساب المؤشرات الرئيسية
  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = ((totalProfit / totalRevenue) * 100);
  const avgMonthlyRevenue = totalRevenue / monthlyData.length;

  const financialMetrics = [
    {
      title: "إجمالي الإيرادات",
      value: totalRevenue,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "إجمالي المصروفات",
      value: totalExpenses,
      change: "+8.2%",
      trend: "up",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "صافي الربح",
      value: totalProfit,
      change: "+18.7%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "هامش الربح",
      value: profitMargin,
      unit: "%",
      change: "+2.3%",
      trend: "up",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="quarterly">ربعي</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">الإيرادات</SelectItem>
              <SelectItem value="profit">الأرباح</SelectItem>
              <SelectItem value="expenses">المصروفات</SelectItem>
              <SelectItem value="comparison">مقارنة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          تخصيص الفترة
        </Button>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">
                      {metric.unit === "%" 
                        ? `${metric.value.toFixed(1)}%` 
                        : `${metric.value.toLocaleString()} ريال`}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change} من الشهر الماضي
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              اتجاه الإيرادات والأرباح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ريال`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="الإيرادات"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="الأرباح"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              توزيع الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={revenueDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} ريال`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>الأداء الشهري التفصيلي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">الشهر</th>
                  <th className="text-right p-3 font-medium">الإيرادات</th>
                  <th className="text-right p-3 font-medium">المصروفات</th>
                  <th className="text-right p-3 font-medium">صافي الربح</th>
                  <th className="text-right p-3 font-medium">هامش الربح</th>
                  <th className="text-right p-3 font-medium">عدد العقود</th>
                  <th className="text-right p-3 font-medium">متوسط العقد</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, index) => {
                  const profitMargin = (row.profit / row.revenue) * 100;
                  const avgContract = row.revenue / row.contracts;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">{row.month}</td>
                      <td className="p-3 text-green-600 font-bold">
                        {row.revenue.toLocaleString()} ريال
                      </td>
                      <td className="p-3 text-red-600 font-bold">
                        {row.expenses.toLocaleString()} ريال
                      </td>
                      <td className="p-3 text-blue-600 font-bold">
                        {row.profit.toLocaleString()} ريال
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={profitMargin > 65 ? "default" : profitMargin > 50 ? "secondary" : "destructive"}
                        >
                          {profitMargin.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-3">{row.contracts}</td>
                      <td className="p-3">{Math.round(avgContract).toLocaleString()} ريال</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
