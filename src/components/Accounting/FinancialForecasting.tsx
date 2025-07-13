import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, TrendingUp, TrendingDown, Brain, Target, AlertTriangle, Lightbulb, BarChart3, PieChart } from "lucide-react";
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
  ComposedChart
} from "recharts";

export function FinancialForecasting() {
  const [forecastPeriod, setForecastPeriod] = useState("6months");
  const [scenario, setScenario] = useState("realistic");

  // Mock forecasting data
  const forecastData = {
    realistic: [
      { month: "يوليو 2024", revenue: 485000, expenses: 195000, profit: 290000, confidence: 85 },
      { month: "أغسطس 2024", revenue: 502000, expenses: 201000, profit: 301000, confidence: 82 },
      { month: "سبتمبر 2024", revenue: 478000, expenses: 189000, profit: 289000, confidence: 79 },
      { month: "أكتوبر 2024", revenue: 515000, expenses: 206000, profit: 309000, confidence: 76 },
      { month: "نوفمبر 2024", revenue: 532000, expenses: 213000, profit: 319000, confidence: 73 },
      { month: "ديسمبر 2024", revenue: 548000, expenses: 219000, profit: 329000, confidence: 70 }
    ],
    optimistic: [
      { month: "يوليو 2024", revenue: 545000, expenses: 190000, profit: 355000, confidence: 65 },
      { month: "أغسطس 2024", revenue: 570000, expenses: 195000, profit: 375000, confidence: 62 },
      { month: "سبتمبر 2024", revenue: 595000, expenses: 200000, profit: 395000, confidence: 58 },
      { month: "أكتوبر 2024", revenue: 620000, expenses: 205000, profit: 415000, confidence: 55 },
      { month: "نوفمبر 2024", revenue: 645000, expenses: 210000, profit: 435000, confidence: 52 },
      { month: "ديسمبر 2024", revenue: 670000, expenses: 215000, profit: 455000, confidence: 48 }
    ],
    pessimistic: [
      { month: "يوليو 2024", revenue: 425000, expenses: 200000, profit: 225000, confidence: 78 },
      { month: "أغسطس 2024", revenue: 415000, expenses: 205000, profit: 210000, confidence: 75 },
      { month: "سبتمبر 2024", revenue: 405000, expenses: 195000, profit: 210000, confidence: 72 },
      { month: "أكتوبر 2024", revenue: 420000, expenses: 200000, profit: 220000, confidence: 69 },
      { month: "نوفمبر 2024", revenue: 435000, expenses: 205000, profit: 230000, confidence: 66 },
      { month: "ديسمبر 2024", revenue: 450000, expenses: 210000, profit: 240000, confidence: 63 }
    ]
  };

  const currentData = forecastData[scenario as keyof typeof forecastData];

  const seasonalTrends = [
    { season: "الربيع", historicalGrowth: 12.5, forecastGrowth: 14.2, demand: "عالي" },
    { season: "الصيف", historicalGrowth: 8.3, forecastGrowth: 9.8, demand: "متوسط" },
    { season: "الخريف", historicalGrowth: 15.7, forecastGrowth: 17.3, demand: "عالي جداً" },
    { season: "الشتاء", historicalGrowth: -5.2, forecastGrowth: -3.1, demand: "منخفض" }
  ];

  const riskFactors = [
    { factor: "التضخم الاقتصادي", impact: "متوسط", probability: 65, mitigation: "تعديل الأسعار تدريجياً" },
    { factor: "زيادة أسعار الوقود", impact: "عالي", probability: 45, mitigation: "رسوم وقود إضافية" },
    { factor: "منافسة جديدة", impact: "عالي", probability: 30, mitigation: "تحسين الخدمات والأسعار" },
    { factor: "تغيير اللوائح", impact: "متوسط", probability: 25, mitigation: "متابعة التحديثات القانونية" }
  ];

  const forecastSummary = {
    totalRevenue6Months: currentData.reduce((sum, month) => sum + month.revenue, 0),
    avgMonthlyGrowth: 3.2,
    breakEvenPoint: "الشهر الثاني",
    cashFlowPositive: 95,
    riskLevel: scenario === "optimistic" ? "منخفض" : scenario === "pessimistic" ? "عالي" : "متوسط"
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case "optimistic": return "text-green-600";
      case "pessimistic": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "عالي": return "text-red-600";
      case "متوسط": return "text-yellow-600";
      case "منخفض": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'revenue' ? 'الإيرادات المتوقعة' : 
                entry.dataKey === 'expenses' ? 'المصروفات المتوقعة' : 
                entry.dataKey === 'profit' ? 'الربح المتوقع' : 
                'مستوى الثقة'}: ${
                entry.dataKey === 'confidence' ? `${entry.value}%` : formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            التنبؤات المالية الذكية
          </h2>
          <p className="text-muted-foreground">تحليل مدعوم بالذكاء الاصطناعي للتوقعات المالية المستقبلية</p>
        </div>
        <div className="flex gap-2">
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 أشهر</SelectItem>
              <SelectItem value="6months">6 أشهر</SelectItem>
              <SelectItem value="12months">12 شهر</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التوقعات
          </Button>
        </div>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>اختيار السيناريو</CardTitle>
          <CardDescription>اختر السيناريو المناسب لعرض التوقعات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer transition-all hover-scale ${scenario === 'optimistic' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-muted/50'}`}
              onClick={() => setScenario('optimistic')}
            >
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800">السيناريو المتفائل</h3>
                <p className="text-sm text-green-600 mt-1">نمو 15-20%</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover-scale ${scenario === 'realistic' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-muted/50'}`}
              onClick={() => setScenario('realistic')}
            >
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-800">السيناريو الواقعي</h3>
                <p className="text-sm text-blue-600 mt-1">نمو 8-12%</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover-scale ${scenario === 'pessimistic' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-muted/50'}`}
              onClick={() => setScenario('pessimistic')}
            >
              <CardContent className="p-4 text-center">
                <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-medium text-red-800">السيناريو المتشائم</h3>
                <p className="text-sm text-red-600 mt-1">نمو 0-5%</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات المتوقعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScenarioColor(scenario)} mb-2`}>
              {formatCurrency(forecastSummary.totalRevenue6Months)}
            </div>
            <p className="text-xs text-muted-foreground">للستة أشهر القادمة</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط النمو الشهري</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {forecastSummary.avgMonthlyGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">معدل النمو المتوقع</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">احتمالية التدفق النقدي الإيجابي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {forecastSummary.cashFlowPositive}%
            </div>
            <p className="text-xs text-muted-foreground">مستوى الثقة</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مستوى المخاطر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(forecastSummary.riskLevel)} mb-2`}>
              {forecastSummary.riskLevel}
            </div>
            <p className="text-xs text-muted-foreground">تقييم المخاطر</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            التوقعات المالية - {scenario === 'optimistic' ? 'السيناريو المتفائل' : 
                                scenario === 'pessimistic' ? 'السيناريو المتشائم' : 'السيناريو الواقعي'}
          </CardTitle>
          <CardDescription>الإيرادات والمصروفات والأرباح المتوقعة مع مستوى الثقة</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}ك`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="revenue" />
              <Bar yAxisId="left" dataKey="expenses" fill="#ef4444" name="expenses" />
              <Area yAxisId="left" dataKey="profit" fill="#10b981" fillOpacity={0.3} name="profit" />
              <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#8884d8" strokeWidth={2} name="confidence" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seasonal Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>التحليل الموسمي</CardTitle>
          <CardDescription>توقعات النمو حسب الفصول بناءً على البيانات التاريخية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalTrends.map((season, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="p-4">
                  <h3 className="font-medium text-center mb-3">{season.season}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">النمو التاريخي</span>
                      <Badge variant="outline">{season.historicalGrowth}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">النمو المتوقع</span>
                      <Badge className={season.forecastGrowth > season.historicalGrowth ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {season.forecastGrowth}%
                      </Badge>
                    </div>
                    <div className="text-center">
                      <Badge variant={season.demand === 'عالي جداً' ? 'default' : 
                                    season.demand === 'عالي' ? 'secondary' : 
                                    season.demand === 'متوسط' ? 'outline' : 'destructive'}>
                        طلب {season.demand}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            تحليل المخاطر
          </CardTitle>
          <CardDescription>العوامل المؤثرة على التوقعات المالية واستراتيجيات التخفيف</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">عامل المخاطرة</th>
                  <th className="text-right p-3 font-medium">مستوى التأثير</th>
                  <th className="text-right p-3 font-medium">احتمالية الحدوث</th>
                  <th className="text-right p-3 font-medium">استراتيجية التخفيف</th>
                </tr>
              </thead>
              <tbody>
                {riskFactors.map((risk, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{risk.factor}</td>
                    <td className="p-3">
                      <Badge variant={risk.impact === 'عالي' ? 'destructive' : 
                                   risk.impact === 'متوسط' ? 'secondary' : 'outline'}>
                        {risk.impact}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${risk.probability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{risk.probability}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{risk.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            نصائح الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-medium text-blue-800 mb-2">🎯 فرص النمو</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• زيادة الأسطول بـ 3 مركبات في الربع القادم</li>
                <li>• استهداف قطاع الشركات برسوم مخفضة</li>
                <li>• تطوير عروض موسمية لفصل الخريف</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-yellow-50">
              <h3 className="font-medium text-yellow-800 mb-2">⚠️ تحذيرات مبكرة</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• توقع انخفاض الطلب 15% في الشتاء</li>
                <li>• ارتفاع محتمل في تكاليف الصيانة</li>
                <li>• ضرورة مراجعة الأسعار خلال شهرين</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}