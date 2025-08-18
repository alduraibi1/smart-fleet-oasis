
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Car,
  Users,
  PieChart,
  BarChart3,
  Calculator,
  AlertTriangle
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface ProfitabilityData {
  entity: string;
  entityType: 'vehicle' | 'customer' | 'contract';
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  roi: number;
  period: string;
}

export function ProfitabilityDashboard() {
  const [viewType, setViewType] = useState('vehicles');
  const [timePeriod, setTimePeriod] = useState('month');
  const [sortBy, setSortBy] = useState('profit');

  // بيانات ربحية المركبات
  const vehicleProfitability: ProfitabilityData[] = [
    {
      entity: "أ ب ج 123 - كامري",
      entityType: 'vehicle',
      revenue: 42000,
      costs: 8500,
      profit: 33500,
      profitMargin: 79.8,
      roi: 394.1,
      period: "شهري"
    },
    {
      entity: "د هـ و 456 - النترا",
      entityType: 'vehicle',
      revenue: 35000,
      costs: 12000,
      profit: 23000,
      profitMargin: 65.7,
      roi: 191.7,
      period: "شهري"
    },
    {
      entity: "ز ح ط 789 - التيما",
      entityType: 'vehicle',
      revenue: 38000,
      costs: 9200,
      profit: 28800,
      profitMargin: 75.8,
      roi: 313.0,
      period: "شهري"
    },
    {
      entity: "ي ك ل 321 - إكسبلورر",
      entityType: 'vehicle',
      revenue: 48000,
      costs: 15000,
      profit: 33000,
      profitMargin: 68.8,
      roi: 220.0,
      period: "شهري"
    }
  ];

  // بيانات ربحية العملاء
  const customerProfitability = [
    { customer: "أحمد محمد العلي", profit: 85000, margin: 78.2, contracts: 12 },
    { customer: "فاطمة سعد الغامدي", profit: 52000, margin: 72.5, contracts: 8 },
    { customer: "محمد عبدالله النجار", profit: 67000, margin: 69.1, contracts: 15 },
    { customer: "خالد أحمد السالم", profit: 24000, margin: 65.8, contracts: 6 }
  ];

  // بيانات اتجاه الربحية الشهري
  const monthlyProfitability = [
    { month: 'يناير', profit: 158000, margin: 64.5, costs: 87000 },
    { month: 'فبراير', profit: 192000, margin: 66.9, costs: 95000 },
    { month: 'مارس', profit: 210000, margin: 67.3, costs: 102000 },
    { month: 'أبريل', profit: 209000, margin: 70.1, costs: 89000 },
    { month: 'مايو', profit: 222000, margin: 66.5, costs: 112000 },
    { month: 'يونيو', profit: 238000, margin: 66.9, costs: 118000 }
  ];

  // توزيع التكاليف
  const costBreakdown = [
    { category: 'وقود', amount: 45000, percentage: 35, color: '#EF4444' },
    { category: 'صيانة', amount: 28000, percentage: 22, color: '#F59E0B' },
    { category: 'تأمين', amount: 18000, percentage: 14, color: '#3B82F6' },
    { category: 'إهلاك', amount: 25000, percentage: 19, color: '#8B5CF6' },
    { category: 'أخرى', amount: 12000, percentage: 10, color: '#10B981' }
  ];

  // حساب الإحصائيات العامة
  const totalRevenue = vehicleProfitability.reduce((sum, item) => sum + item.revenue, 0);
  const totalCosts = vehicleProfitability.reduce((sum, item) => sum + item.costs, 0);
  const totalProfit = totalRevenue - totalCosts;
  const overallMargin = (totalProfit / totalRevenue) * 100;
  const avgROI = vehicleProfitability.reduce((sum, item) => sum + item.roi, 0) / vehicleProfitability.length;

  const sortedData = [...vehicleProfitability].sort((a, b) => {
    switch (sortBy) {
      case 'profit':
        return b.profit - a.profit;
      case 'margin':
        return b.profitMargin - a.profitMargin;
      case 'roi':
        return b.roi - a.roi;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vehicles">المركبات</SelectItem>
              <SelectItem value="customers">العملاء</SelectItem>
              <SelectItem value="overview">نظرة عامة</SelectItem>
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
              <SelectItem value="year">سنوي</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profit">صافي الربح</SelectItem>
              <SelectItem value="margin">هامش الربح</SelectItem>
              <SelectItem value="roi">عائد الاستثمار</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Calculator className="h-4 w-4 mr-2" />
          حاسبة الربحية
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">إجمالي التكاليف</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalCosts.toLocaleString()} ريال
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalProfit.toLocaleString()} ريال
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">هامش الربح العام</p>
                <p className="text-2xl font-bold text-purple-600">
                  {overallMargin.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              اتجاه الربحية الشهري
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyProfitability}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} ريال`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="صافي الربح"
                />
                <Line 
                  type="monotone" 
                  dataKey="costs" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="التكاليف"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              توزيع التكاليف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} ريال`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profitability Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل الربحية التفصيلي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">المركبة/العميل</th>
                  <th className="text-right p-3 font-medium">الإيرادات</th>
                  <th className="text-right p-3 font-medium">التكاليف</th>
                  <th className="text-right p-3 font-medium">صافي الربح</th>
                  <th className="text-right p-3 font-medium">هامش الربح</th>
                  <th className="text-right p-3 font-medium">عائد الاستثمار</th>
                  <th className="text-right p-3 font-medium">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{item.entity}</td>
                    <td className="p-3 font-bold text-green-600">
                      {item.revenue.toLocaleString()} ريال
                    </td>
                    <td className="p-3 font-bold text-red-600">
                      {item.costs.toLocaleString()} ريال
                    </td>
                    <td className="p-3 font-bold text-blue-600">
                      {item.profit.toLocaleString()} ريال
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="font-bold">{item.profitMargin.toFixed(1)}%</div>
                        <Progress value={Math.min(item.profitMargin, 100)} className="h-2" />
                      </div>
                    </td>
                    <td className="p-3 font-bold text-purple-600">
                      {item.roi.toFixed(1)}%
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          item.profitMargin > 75 ? "default" : 
                          item.profitMargin > 60 ? "secondary" : 
                          "destructive"
                        }
                      >
                        {item.profitMargin > 75 ? "ممتاز" : 
                         item.profitMargin > 60 ? "جيد" : 
                         "يحتاج تحسين"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            تنبيهات الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">مركبات بهامش ربح أقل من 60%</span>
              </div>
              <Badge className="bg-red-100 text-red-800">
                {sortedData.filter(item => item.profitMargin < 60).length}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800">مركبات بعائد استثمار أقل من 200%</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                {sortedData.filter(item => item.roi < 200).length}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-800">مركبات بأداء ممتاز (+75% هامش ربح)</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {sortedData.filter(item => item.profitMargin > 75).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
