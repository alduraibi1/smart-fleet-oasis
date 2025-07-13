import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, Crown, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Zap, Users, Car, DollarSign, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export function ExecutiveDashboard() {
  const [timeframe, setTimeframe] = useState("month");

  // Executive Summary Data
  const executiveSummary = {
    totalRevenue: 2875000,
    netProfit: 1725000,
    profitMargin: 60.0,
    roi: 32.5,
    activeVehicles: 47,
    activeContracts: 38,
    customerSatisfaction: 94.2,
    operationalEfficiency: 88.5
  };

  // Key Performance Indicators for radar chart
  const performanceMetrics = [
    { metric: "الربحية", value: 85, fullMark: 100 },
    { metric: "الكفاءة التشغيلية", value: 89, fullMark: 100 },
    { metric: "رضا العملاء", value: 94, fullMark: 100 },
    { metric: "النمو", value: 78, fullMark: 100 },
    { metric: "السيولة", value: 92, fullMark: 100 },
    { metric: "الاستدامة", value: 76, fullMark: 100 }
  ];

  // Top performing vehicles
  const topVehicles = [
    { rank: 1, plateNumber: "أ ب ج 123", model: "تويوتا كامري 2023", revenue: 24500, utilization: 95, profit: 18200 },
    { rank: 2, plateNumber: "م ن س 654", model: "تويوتا كورولا 2023", revenue: 22800, utilization: 92, profit: 17100 },
    { rank: 3, plateNumber: "د هـ و 456", model: "نيسان التيما 2022", revenue: 19600, utilization: 87, profit: 14200 },
    { rank: 4, plateNumber: "ز ح ط 789", model: "هيونداي إلنترا 2022", revenue: 18300, utilization: 84, profit: 13500 },
    { rank: 5, plateNumber: "ي ك ل 321", model: "كيا أوبتيما 2021", revenue: 16900, utilization: 78, profit: 12100 }
  ];

  // Monthly performance trend
  const monthlyTrend = [
    { month: "يناير", revenue: 420000, profit: 252000, efficiency: 85, satisfaction: 92 },
    { month: "فبراير", revenue: 445000, profit: 267000, efficiency: 87, satisfaction: 93 },
    { month: "مارس", revenue: 478000, profit: 286800, efficiency: 89, satisfaction: 94 },
    { month: "أبريل", revenue: 495000, profit: 297000, efficiency: 91, satisfaction: 95 },
    { month: "مايو", revenue: 512000, profit: 307200, efficiency: 88, satisfaction: 94 },
    { month: "يونيو", revenue: 525000, profit: 315000, efficiency: 90, satisfaction: 94 }
  ];

  // Strategic alerts
  const strategicAlerts = [
    { type: "opportunity", title: "فرصة توسع", description: "الطلب يتجاوز العرض بنسبة 15%", priority: "عالي" },
    { type: "warning", title: "تحذير موسمي", description: "انخفاض متوقع في الطلب خلال الشتاء", priority: "متوسط" },
    { type: "success", title: "تحقيق هدف", description: "تجاوز هدف الربحية الربع سنوي", priority: "منخفض" },
    { type: "info", title: "مراجعة استراتيجية", description: "حان وقت مراجعة استراتيجية التسعير", priority: "متوسط" }
  ];

  // Market position data
  const marketData = [
    { segment: "الأفراد", marketShare: 28, growth: 12, competition: "متوسط" },
    { segment: "الشركات", marketShare: 15, growth: 18, competition: "عالي" },
    { segment: "السياحة", marketShare: 35, growth: 8, competition: "منخفض" },
    { segment: "الحكومي", marketShare: 22, growth: 22, competition: "عالي" }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "success": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "عالي": return <Badge variant="destructive">عالي</Badge>;
      case "متوسط": return <Badge variant="secondary">متوسط</Badge>;
      case "منخفض": return <Badge variant="outline">منخفض</Badge>;
      default: return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            لوحة المدير التنفيذي
          </h2>
          <p className="text-muted-foreground">نظرة شاملة على الأداء الاستراتيجي والتشغيلي للشركة</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوعي</SelectItem>
              <SelectItem value="month">شهري</SelectItem>
              <SelectItem value="quarter">ربع سنوي</SelectItem>
              <SelectItem value="year">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            تقرير تنفيذي
          </Button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-800">
              <DollarSign className="h-4 w-4" />
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {formatCurrency(executiveSummary.totalRevenue)}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-blue-700">+12.5% نمو سنوي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-800">
              <Target className="h-4 w-4" />
              صافي الربح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-2">
              {formatCurrency(executiveSummary.netProfit)}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">هامش {executiveSummary.profitMargin}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-800">
              <BarChart3 className="h-4 w-4" />
              العائد على الاستثمار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {executiveSummary.roi}%
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-purple-700">أعلى من المستهدف</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-800">
              <Users className="h-4 w-4" />
              رضا العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-2">
              {executiveSummary.customerSatisfaction}%
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-orange-700">ممتاز</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مؤشرات الأداء الاستراتيجي</CardTitle>
            <CardDescription>تقييم شامل لجميع جوانب الأعمال</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="الأداء" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>اتجاه الأداء الشهري</CardTitle>
            <CardDescription>الإيرادات والكفاءة التشغيلية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}ك`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' || name === 'profit' ? formatCurrency(Number(value)) : `${value}%`,
                    name === 'revenue' ? 'الإيرادات' :
                    name === 'profit' ? 'الربح' :
                    name === 'efficiency' ? 'الكفاءة' : 'رضا العملاء'
                  ]}
                />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Vehicles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            أفضل المركبات أداءً
          </CardTitle>
          <CardDescription>ترتيب المركبات حسب الربحية والاستخدام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">الترتيب</th>
                  <th className="text-right p-3 font-medium">رقم اللوحة</th>
                  <th className="text-right p-3 font-medium">الموديل</th>
                  <th className="text-right p-3 font-medium">الإيراد الشهري</th>
                  <th className="text-right p-3 font-medium">معدل الاستخدام</th>
                  <th className="text-right p-3 font-medium">الربح</th>
                </tr>
              </thead>
              <tbody>
                {topVehicles.map((vehicle) => (
                  <tr key={vehicle.rank} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {vehicle.rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                        <Badge variant={vehicle.rank <= 3 ? "default" : "outline"}>
                          #{vehicle.rank}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-medium">{vehicle.plateNumber}</td>
                    <td className="p-3">{vehicle.model}</td>
                    <td className="p-3 font-bold text-blue-600">{formatCurrency(vehicle.revenue)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${vehicle.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{vehicle.utilization}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(vehicle.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            التنبيهات الاستراتيجية
          </CardTitle>
          <CardDescription>أهم النقاط التي تحتاج انتباه الإدارة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategicAlerts.map((alert, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{alert.title}</h3>
                      {getPriorityBadge(alert.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Position */}
      <Card>
        <CardHeader>
          <CardTitle>الموقع في السوق</CardTitle>
          <CardDescription>الحصة السوقية ومعدلات النمو حسب القطاعات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketData.map((segment, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="p-4">
                  <h3 className="font-medium text-center mb-3">{segment.segment}</h3>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{segment.marketShare}%</div>
                      <div className="text-sm text-muted-foreground">الحصة السوقية</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">النمو</span>
                      <Badge className="bg-green-100 text-green-800">+{segment.growth}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">المنافسة</span>
                      <Badge variant={segment.competition === 'عالي' ? 'destructive' : 
                                   segment.competition === 'متوسط' ? 'secondary' : 'outline'}>
                        {segment.competition}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Executive Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات التنفيذية الموصى بها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale bg-green-50">
              <div className="text-center space-y-2">
                <TrendingUp className="h-8 w-8 mx-auto text-green-600" />
                <h3 className="font-medium text-green-800">توسيع الأسطول</h3>
                <p className="text-sm text-green-600">إضافة 5 مركبات جديدة للاستفادة من الطلب المرتفع</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale bg-blue-50">
              <div className="text-center space-y-2">
                <Target className="h-8 w-8 mx-auto text-blue-600" />
                <h3 className="font-medium text-blue-800">استهداف الشركات</h3>
                <p className="text-sm text-blue-600">تطوير عروض خاصة لقطاع الشركات عالي النمو</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale bg-purple-50">
              <div className="text-center space-y-2">
                <Zap className="h-8 w-8 mx-auto text-purple-600" />
                <h3 className="font-medium text-purple-800">تحسين الكفاءة</h3>
                <p className="text-sm text-purple-600">تطبيق نظام GPS لتحسين إدارة الأسطول</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}