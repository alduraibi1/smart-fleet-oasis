import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  Users,
  Car,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from "recharts";

interface AdvancedDashboardProps {
  contracts?: any[];
  stats?: any;
}

export function AdvancedDashboard({ contracts = [], stats }: AdvancedDashboardProps) {
  // Enhanced mock data for advanced dashboard
  const kpiData = {
    contractGrowth: 12.5,
    revenueGrowth: 18.3,
    customerRetention: 78.5,
    avgContractDuration: 8.2,
    profitMargin: 24.8,
    utilizationRate: 87.3,
    customerSatisfaction: 4.6,
    renewalRate: 73.2
  };

  const heatmapData = [
    { month: 'يناير', week1: 85, week2: 92, week3: 78, week4: 96 },
    { month: 'فبراير', week1: 88, week2: 85, week3: 94, week4: 89 },
    { month: 'مارس', week1: 92, week2: 87, week3: 91, week4: 93 },
    { month: 'أبريل', week1: 79, week2: 95, week3: 88, week4: 85 },
    { month: 'مايو', week1: 96, week2: 89, week3: 92, week4: 87 },
    { month: 'يونيو', week1: 91, week2: 94, week3: 89, week4: 96 }
  ];

  const performanceMetrics = [
    { name: 'الأداء المالي', value: 92, trend: 'up', change: '+8%' },
    { name: 'رضا العملاء', value: 88, trend: 'up', change: '+5%' },
    { name: 'كفاءة العمليات', value: 85, trend: 'up', change: '+12%' },
    { name: 'نمو المحفظة', value: 78, trend: 'down', change: '-3%' }
  ];

  const contractLifecycleData = [
    { stage: 'طلب جديد', count: 45, percentage: 18 },
    { stage: 'قيد المراجعة', count: 32, percentage: 13 },
    { stage: 'معتمد', count: 28, percentage: 11 },
    { stage: 'نشط', count: 89, percentage: 36 },
    { stage: 'قريب الانتهاء', count: 34, percentage: 14 },
    { stage: 'مكتمل', count: 20, percentage: 8 }
  ];

  const predictiveAnalytics = [
    { month: 'يوليو', predicted: 95, actual: null, confidence: 85 },
    { month: 'أغسطس', predicted: 102, actual: null, confidence: 78 },
    { month: 'سبتمبر', predicted: 98, actual: null, confidence: 82 },
    { month: 'أكتوبر', predicted: 110, actual: null, confidence: 75 }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 80) return 'bg-yellow-500';
    if (value >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Real-time Updates */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            لوحة التحكم المتقدمة
          </h2>
          <p className="text-muted-foreground mt-2">
            تحليل ذكي ومراقبة مباشرة لأداء العقود في الوقت الفعلي
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">متصل مباشر</span>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            آخر تحديث: منذ دقيقة
          </Badge>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              نمو العقود
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {kpiData.contractGrowth}%
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">زيادة متسارعة</span>
            </div>
            <Progress value={kpiData.contractGrowth * 4} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="hover-scale border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              نمو الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {kpiData.revenueGrowth}%
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">أداء ممتاز</span>
            </div>
            <Progress value={kpiData.revenueGrowth * 2.7} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="hover-scale border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              معدل الاستبقاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {kpiData.customerRetention}%
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">هدف محقق</span>
            </div>
            <Progress value={kpiData.customerRetention} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="hover-scale border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              معدل الاستخدام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {kpiData.utilizationRate}%
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">كفاءة عالية</span>
            </div>
            <Progress value={kpiData.utilizationRate} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            تحليل الأداء
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="gap-2">
            <Activity className="h-4 w-4" />
            الخريطة الحرارية
          </TabsTrigger>
          <TabsTrigger value="lifecycle" className="gap-2">
            <PieChart className="h-4 w-4" />
            دورة الحياة
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <LineChart className="h-4 w-4" />
            اتجاهات النمو
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <Target className="h-4 w-4" />
            التنبؤات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
                <CardDescription>تقييم شامل لأداء النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{metric.value}%</span>
                        {metric.trend === 'up' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={metric.value} 
                      className={`h-2 ${metric.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع أنواع العقود</CardTitle>
                <CardDescription>التوزيع حسب القطاعات والأنواع</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={contractLifecycleData.slice(0, 4)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {contractLifecycleData.slice(0, 4).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>خريطة حرارية لأداء العقود</CardTitle>
              <CardDescription>كثافة النشاط حسب الأسابيع والأشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2 text-sm text-center">
                  <div></div>
                  <div>الأسبوع 1</div>
                  <div>الأسبوع 2</div>
                  <div>الأسبوع 3</div>
                  <div>الأسبوع 4</div>
                </div>
                {heatmapData.map((monthData, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-center">
                    <div className="text-sm font-medium">{monthData.month}</div>
                    <div className={`h-12 rounded flex items-center justify-center text-white font-bold ${getHeatmapColor(monthData.week1)}`}>
                      {monthData.week1}%
                    </div>
                    <div className={`h-12 rounded flex items-center justify-center text-white font-bold ${getHeatmapColor(monthData.week2)}`}>
                      {monthData.week2}%
                    </div>
                    <div className={`h-12 rounded flex items-center justify-center text-white font-bold ${getHeatmapColor(monthData.week3)}`}>
                      {monthData.week3}%
                    </div>
                    <div className={`h-12 rounded flex items-center justify-center text-white font-bold ${getHeatmapColor(monthData.week4)}`}>
                      {monthData.week4}%
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>أقل من 70%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>70-79%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>80-89%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>أكثر من 90%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مراحل دورة حياة العقد</CardTitle>
              <CardDescription>توزيع العقود حسب المراحل المختلفة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractLifecycleData.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index] === '#3b82f6' ? 'bg-blue-500' : 
                        colors[index] === '#10b981' ? 'bg-green-500' : 
                        colors[index] === '#f59e0b' ? 'bg-yellow-500' : 
                        colors[index] === '#ef4444' ? 'bg-red-500' : 
                        colors[index] === '#8b5cf6' ? 'bg-purple-500' : 'bg-cyan-500'}`}></div>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="px-3 py-1">
                        {stage.count} عقد
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">{stage.percentage}%</div>
                        <Progress value={stage.percentage * 4} className="w-20 h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات النمو والتطور</CardTitle>
              <CardDescription>تحليل الاتجاهات طويلة المدى</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={heatmapData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="week1" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="week2" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="week3" stroke="#f59e0b" strokeWidth={3} />
                  <Bar dataKey="week4" fill="#ef4444" fillOpacity={0.7} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التنبؤات والتوقعات</CardTitle>
              <CardDescription>توقعات مستقبلية مدعومة بالذكاء الاصطناعي</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {predictiveAnalytics.map((prediction, index) => (
                    <Card key={index} className="text-center">
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {prediction.predicted}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {prediction.month}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <div className="text-xs text-green-600">
                            {prediction.confidence}% ثقة
                          </div>
                        </div>
                        <Progress value={prediction.confidence} className="mt-3 h-1" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">توقعات الذكاء الاصطناعي</h4>
                      <p className="text-sm text-blue-700">
                        يتوقع النظام نمواً بنسبة 15% في العقود الجديدة خلال الربع القادم بناءً على الاتجاهات الحالية والعوامل الموسمية.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}