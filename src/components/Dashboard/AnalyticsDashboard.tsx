
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car, 
  Users, 
  Calendar,
  Target,
  AlertTriangle,
  Download,
  Filter
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";

export default function AnalyticsDashboard() {
  const { stats, revenueData, topVehicles, loading } = useDashboardData();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // إعداد بيانات الرسوم البيانية
  const revenueVsExpenses = revenueData.map(item => ({
    ...item,
    profit: item.revenue - item.expenses,
    profitMargin: item.revenue > 0 ? ((item.revenue - item.expenses) / item.revenue) * 100 : 0
  }));

  const vehicleUtilization = topVehicles.map(vehicle => ({
    name: vehicle.plateNumber,
    utilization: vehicle.utilization,
    revenue: vehicle.revenue,
    contracts: vehicle.contracts
  }));

  const performanceMetrics = [
    { name: 'الإيرادات', value: stats.totalRevenue, target: stats.totalRevenue * 1.2, unit: 'ريال' },
    { name: 'العقود', value: stats.activeContracts, target: stats.activeContracts * 1.15, unit: 'عقد' },
    { name: 'معدل الاستخدام', value: stats.utilizationRate, target: 85, unit: '%' },
    { name: 'رضا العملاء', value: stats.customerSatisfaction * 20, target: 90, unit: '%' }
  ];

  const distributionData = [
    { name: 'متاحة', value: stats.availableVehicles, color: '#10b981' },
    { name: 'مؤجرة', value: stats.totalVehicles - stats.availableVehicles, color: '#3b82f6' },
    { name: 'صيانة', value: stats.pendingMaintenance, color: '#f59e0b' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">تحليلات متقدمة</h2>
          <p className="text-muted-foreground">رؤى تفصيلية حول أداء الأعمال</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوعي</SelectItem>
              <SelectItem value="month">شهري</SelectItem>
              <SelectItem value="quarter">ربع سنوي</SelectItem>
              <SelectItem value="year">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">الأداء المالي</TabsTrigger>
          <TabsTrigger value="operational">التشغيلي</TabsTrigger>
          <TabsTrigger value="vehicles">المركبات</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          {/* Financial KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  نمو إيجابي
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الإيرادات الشهرية</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">
                  الشهر الحالي
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">هامش الربح</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.profitMargin.toFixed(1)}%
                </div>
                <Progress value={stats.profitMargin} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل النمو</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">+12.5%</div>
                <div className="text-xs text-muted-foreground">
                  مقارنة بالشهر الماضي
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات مقابل المصروفات</CardTitle>
              <CardDescription>مقارنة شهرية للأداء المالي</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
                  <Bar dataKey="expenses" fill="#ef4444" name="المصروفات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit Trend */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه الربحية</CardTitle>
              <CardDescription>تطور هامش الربح عبر الوقت</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'هامش الربح']} />
                  <Line type="monotone" dataKey="profitMargin" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          {/* Operational Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold">
                        {metric.unit === 'ريال' ? formatCurrency(metric.value) : 
                         `${metric.value.toFixed(1)}${metric.unit}`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        الهدف: {metric.unit === 'ريال' ? formatCurrency(metric.target) : 
                               `${metric.target.toFixed(1)}${metric.unit}`}
                      </span>
                    </div>
                    <Progress value={(metric.value / metric.target) * 100} />
                    <div className="flex items-center gap-1">
                      {metric.value >= metric.target ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">تم تحقيق الهدف</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-600">
                            {((metric.target - metric.value) / metric.target * 100).toFixed(1)}% متبقي
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fleet Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع الأسطول</CardTitle>
              <CardDescription>حالة المركبات الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {distributionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{item.value}</div>
                        <div className="text-xs text-muted-foreground">
                          {((item.value / stats.totalVehicles) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          {/* Vehicle Performance */}
          <Card>
            <CardHeader>
              <CardTitle>أداء المركبات</CardTitle>
              <CardDescription>معدل الاستخدام والإيرادات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicleUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="utilization" fill="#3b82f6" name="معدل الاستخدام %" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="الإيرادات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Vehicles Table */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل المركبات أداءً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topVehicles.map((vehicle, index) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{vehicle.plateNumber}</div>
                        <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold text-green-600">
                        {formatCurrency(vehicle.revenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.contracts} عقد - {vehicle.utilization.toFixed(1)}% استخدام
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {/* Customer Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">رضا العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.customerSatisfaction.toFixed(1)}/5
                </div>
                <Progress value={(stats.customerSatisfaction / 5) * 100} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  متوسط التقييمات
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">العملاء النشطون</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeContracts}</div>
                <div className="text-xs text-muted-foreground">
                  عميل لديه عقد نشط
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">معدل العائدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <div className="text-xs text-muted-foreground">
                  عملاء متكررون
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Satisfaction Trend */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه رضا العملاء</CardTitle>
              <CardDescription>تطور التقييمات عبر الوقت</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueData.map(item => ({
                  ...item,
                  satisfaction: 4.2 + Math.random() * 0.8 // مثال للبيانات
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="satisfaction" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
