import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Crown,
  BarChart3,
  PieChart,
  Users,
  Car,
  DollarSign,
  Target,
  Award,
  Calendar,
  Globe,
  Building,
  LineChart,
  Activity
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";

export const ExecutiveDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("quarter");

  // Executive KPIs Data
  const executiveKPIs = {
    revenue: {
      current: 15250000,
      target: 18000000,
      growth: 23.5,
      forecast: 19500000
    },
    contracts: {
      current: 1250,
      target: 1500,
      growth: 18.2,
      forecast: 1650
    },
    marketShare: {
      current: 12.8,
      target: 15.0,
      growth: 2.3,
      forecast: 16.2
    },
    profitMargin: {
      current: 28.5,
      target: 30.0,
      growth: 3.2,
      forecast: 31.5
    }
  };

  // Performance vs Competitors
  const competitorData = [
    { name: "شركتنا", value: 15.2, color: "#3b82f6" },
    { name: "المنافس الأول", value: 18.5, color: "#ef4444" },
    { name: "المنافس الثاني", value: 12.3, color: "#f59e0b" },
    { name: "المنافس الثالث", value: 8.7, color: "#10b981" },
    { name: "أخرى", value: 45.3, color: "#6b7280" }
  ];

  // Strategic Goals Progress
  const strategicGoals = [
    {
      goal: "زيادة الحصة السوقية إلى 20%",
      progress: 64,
      target: "ديسمبر 2024",
      status: "متقدم"
    },
    {
      goal: "تحقيق إيرادات 25 مليون ريال",
      progress: 78,
      target: "مارس 2025",
      status: "ممتاز"
    },
    {
      goal: "افتتاح 5 فروع جديدة",
      progress: 40,
      target: "يونيو 2025",
      status: "متأخر"
    },
    {
      goal: "تقليل تكلفة التشغيل بنسبة 15%",
      progress: 85,
      target: "يناير 2025",
      status: "ممتاز"
    }
  ];

  // Regional Performance
  const regionalData = [
    { region: "الرياض", revenue: 6200000, contracts: 450, growth: 25.3 },
    { region: "جدة", revenue: 4100000, contracts: 320, growth: 18.7 },
    { region: "الدمام", revenue: 2800000, contracts: 280, growth: 22.1 },
    { region: "المدينة", revenue: 1200000, contracts: 150, growth: 15.2 },
    { region: "أبها", revenue: 950000, contracts: 50, growth: 28.9 }
  ];

  // Monthly Revenue Trend
  const monthlyRevenue = [
    { month: "يناير", revenue: 2100000, target: 2000000 },
    { month: "فبراير", revenue: 2250000, target: 2100000 },
    { month: "مارس", revenue: 2400000, target: 2200000 },
    { month: "أبريل", revenue: 2650000, target: 2300000 },
    { month: "مايو", revenue: 2800000, target: 2400000 },
    { month: "يونيو", revenue: 3050000, target: 2500000 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ممتاز': return 'bg-green-100 text-green-800';
      case 'متقدم': return 'bg-blue-100 text-blue-800';
      case 'متأخر': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            لوحة التحكم التنفيذية
          </h2>
          <p className="text-muted-foreground">
            رؤية شاملة للأداء الاستراتيجي والمؤشرات التنفيذية
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="month">شهري</option>
            <option value="quarter">ربع سنوي</option>
            <option value="year">سنوي</option>
          </select>
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <LineChart className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              الإيرادات الإجمالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {(executiveKPIs.revenue.current / 1000000).toFixed(1)}م ر.س
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">+{executiveKPIs.revenue.growth}%</span>
              </div>
              <Progress 
                value={(executiveKPIs.revenue.current / executiveKPIs.revenue.target) * 100} 
                className="mt-2" 
              />
              <div className="text-xs text-muted-foreground">
                الهدف: {(executiveKPIs.revenue.target / 1000000).toFixed(1)}م ر.س
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4 text-green-600" />
              إجمالي العقود
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {executiveKPIs.contracts.current.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">+{executiveKPIs.contracts.growth}%</span>
              </div>
              <Progress 
                value={(executiveKPIs.contracts.current / executiveKPIs.contracts.target) * 100} 
                className="mt-2" 
              />
              <div className="text-xs text-muted-foreground">
                الهدف: {executiveKPIs.contracts.target.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              الحصة السوقية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">
                {executiveKPIs.marketShare.current}%
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">+{executiveKPIs.marketShare.growth}%</span>
              </div>
              <Progress 
                value={(executiveKPIs.marketShare.current / executiveKPIs.marketShare.target) * 100} 
                className="mt-2" 
              />
              <div className="text-xs text-muted-foreground">
                الهدف: {executiveKPIs.marketShare.target}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              هامش الربح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-600">
                {executiveKPIs.profitMargin.current}%
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">+{executiveKPIs.profitMargin.growth}%</span>
              </div>
              <Progress 
                value={(executiveKPIs.profitMargin.current / executiveKPIs.profitMargin.target) * 100} 
                className="mt-2" 
              />
              <div className="text-xs text-muted-foreground">
                الهدف: {executiveKPIs.profitMargin.target}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">الأداء المالي</TabsTrigger>
          <TabsTrigger value="market">تحليل السوق</TabsTrigger>
          <TabsTrigger value="strategic">الأهداف الاستراتيجية</TabsTrigger>
          <TabsTrigger value="regional">الأداء الإقليمي</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>اتجاه الإيرادات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)}م ر.س`, '']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="الإيرادات الفعلية" />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="المستهدف" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأداء مقابل المؤشرات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">العائد على الاستثمار</div>
                      <div className="text-sm text-green-600">مقارنة بالعام الماضي</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">32.5%</div>
                      <div className="text-sm text-green-500">+8.3%</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-800">معدل نمو العملاء</div>
                      <div className="text-sm text-blue-600">عملاء جدد شهرياً</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">18.7%</div>
                      <div className="text-sm text-blue-500">+4.2%</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium text-purple-800">كفاءة التشغيل</div>
                      <div className="text-sm text-purple-600">التكلفة لكل عقد</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">1,250 ر.س</div>
                      <div className="text-sm text-purple-500">-12.1%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل الحصة السوقية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={competitorData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {competitorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تحليل المنافسين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {competitorData.slice(0, 4).map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: competitor.color }}
                        ></div>
                        <span className="font-medium">{competitor.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{competitor.value}%</div>
                        <div className="text-sm text-muted-foreground">
                          {index === 0 ? 'موقعنا' : `المرتبة ${index + 1}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6">
          <div className="space-y-4">
            {strategicGoals.map((goal, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{goal.goal}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold text-lg">{goal.progress}%</div>
                        <div className="text-xs text-muted-foreground">مكتمل</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Progress value={goal.progress} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>الموعد المستهدف: {goal.target}</span>
                      <span>متبقي: {100 - goal.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الأداء الإقليمي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((region, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {region.region}
                      </h3>
                      <Badge className={region.growth > 20 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        +{region.growth}% نمو
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {(region.revenue / 1000000).toFixed(1)}م ر.س
                        </div>
                        <div className="text-sm text-muted-foreground">الإيرادات</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {region.contracts}
                        </div>
                        <div className="text-sm text-muted-foreground">العقود</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {Math.round(region.revenue / region.contracts / 1000)}ك ر.س
                        </div>
                        <div className="text-sm text-muted-foreground">متوسط العقد</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};