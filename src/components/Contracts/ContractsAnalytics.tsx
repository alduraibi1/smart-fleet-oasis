import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, BarChart3, TrendingUp, TrendingDown, Target, Users, DollarSign, Clock, FileText } from "lucide-react";
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
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";

export function ContractsAnalytics() {
  const [timeRange, setTimeRange] = useState("6months");

  // Analytics data
  const contractsMetrics = {
    avgContractDuration: 8.5,
    customerRetentionRate: 82.3,
    contractRenewalRate: 78.5,
    avgTimeToSign: 2.3,
    profitabilityPerContract: 3250,
    customerLifetimeValue: 28500
  };

  const profitabilityAnalysis = [
    { month: "يناير", revenue: 285000, costs: 95000, profit: 190000, margin: 66.7 },
    { month: "فبراير", revenue: 320000, costs: 105000, profit: 215000, margin: 67.2 },
    { month: "مارس", revenue: 375000, costs: 118000, profit: 257000, margin: 68.5 },
    { month: "أبريل", revenue: 310000, costs: 98000, profit: 212000, margin: 68.4 },
    { month: "مايو", revenue: 425000, costs: 135000, profit: 290000, margin: 68.2 },
    { month: "يونيو", revenue: 365000, costs: 115000, profit: 250000, margin: 68.5 }
  ];

  const customerSegments = [
    { segment: "الأفراد", contracts: 145, revenue: 1850000, avgValue: 12750, growth: 15.2 },
    { segment: "الشركات الصغيرة", contracts: 68, revenue: 1920000, avgValue: 28235, growth: 22.8 },
    { segment: "الشركات الكبيرة", contracts: 23, revenue: 1450000, avgValue: 63043, growth: 18.5 },
    { segment: "المؤسسات الحكومية", contracts: 12, revenue: 980000, avgValue: 81667, growth: 8.3 }
  ];

  const contractPerformance = [
    { type: "العقود اليومية", count: 78, avgRevenue: 2400, satisfaction: 85, efficiency: 92 },
    { type: "العقود الأسبوعية", count: 34, avgRevenue: 8500, satisfaction: 88, efficiency: 89 },
    { type: "العقود الشهرية", count: 156, avgRevenue: 15750, satisfaction: 91, efficiency: 95 },
    { type: "العقود السنوية", count: 28, avgRevenue: 175000, satisfaction: 94, efficiency: 97 }
  ];

  const renewalTrends = [
    { period: "Q1 2023", renewals: 45, totalExpired: 62, rate: 72.6 },
    { period: "Q2 2023", renewals: 52, totalExpired: 68, rate: 76.5 },
    { period: "Q3 2023", renewals: 58, totalExpired: 71, rate: 81.7 },
    { period: "Q4 2023", renewals: 61, totalExpired: 75, rate: 81.3 },
    { period: "Q1 2024", renewals: 67, totalExpired: 84, rate: 79.8 },
    { period: "Q2 2024", renewals: 72, totalExpired: 89, rate: 80.9 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSegmentColor = (index: number) => {
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            تحليل أداء العقود
          </h2>
          <p className="text-muted-foreground">تحليل شامل لربحية العقود وأداء العملاء</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">آخر 3 أشهر</SelectItem>
              <SelectItem value="6months">آخر 6 أشهر</SelectItem>
              <SelectItem value="12months">آخر 12 شهر</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التحليل
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              متوسط مدة العقد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {contractsMetrics.avgContractDuration} شهر
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              الاحتفاظ بالعملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contractsMetrics.customerRetentionRate}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              معدل التجديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {contractsMetrics.contractRenewalRate}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              زمن التوقيع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {contractsMetrics.avgTimeToSign} يوم
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ربحية العقد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(contractsMetrics.profitabilityPerContract)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              قيمة العميل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(contractsMetrics.customerLifetimeValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profitability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل الربحية</CardTitle>
          <CardDescription>الإيرادات والتكاليف وهامش الربح الشهري</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={profitabilityAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}ك`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'margin' ? `${value}%` : formatCurrency(Number(value)),
                  name === 'revenue' ? 'الإيرادات' :
                  name === 'costs' ? 'التكاليف' :
                  name === 'profit' ? 'الربح' : 'هامش الربح'
                ]}
              />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="revenue" />
              <Bar yAxisId="left" dataKey="costs" fill="#ef4444" name="costs" />
              <Area yAxisId="left" dataKey="profit" fill="#10b981" fillOpacity={0.3} name="profit" />
              <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#8884d8" strokeWidth={3} name="margin" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Segments Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل قطاعات العملاء</CardTitle>
          <CardDescription>أداء العقود حسب فئات العملاء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">القطاع</th>
                  <th className="text-right p-3 font-medium">عدد العقود</th>
                  <th className="text-right p-3 font-medium">إجمالي الإيرادات</th>
                  <th className="text-right p-3 font-medium">متوسط قيمة العقد</th>
                  <th className="text-right p-3 font-medium">معدل النمو</th>
                  <th className="text-right p-3 font-medium">الأداء</th>
                </tr>
              </thead>
              <tbody>
                {customerSegments.map((segment, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{segment.segment}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">{segment.contracts}</Badge>
                    </td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(segment.revenue)}</td>
                    <td className="p-3 font-medium text-blue-600">{formatCurrency(segment.avgValue)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-600">+{segment.growth}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(segment.growth * 4, 100)}%`,
                            backgroundColor: getSegmentColor(index)
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Contract Types Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>أداء أنواع العقود</CardTitle>
            <CardDescription>مقارنة أداء العقود المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractPerformance.map((contract, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{contract.type}</h3>
                    <Badge variant="outline">{contract.count} عقد</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">متوسط الإيراد</div>
                      <div className="font-bold text-green-600">{formatCurrency(contract.avgRevenue)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">رضا العملاء</div>
                      <div className="font-bold text-blue-600">{contract.satisfaction}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">الكفاءة</div>
                      <div className="font-bold text-purple-600">{contract.efficiency}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اتجاه التجديدات</CardTitle>
            <CardDescription>معدل تجديد العقود عبر الأرباع</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={renewalTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'rate' ? `${value}%` : value,
                    name === 'renewals' ? 'العقود المُجددة' :
                    name === 'totalExpired' ? 'العقود المنتهية' : 'معدل التجديد'
                  ]}
                />
                <Bar yAxisId="left" dataKey="renewals" fill="#10b981" name="renewals" />
                <Bar yAxisId="left" dataKey="totalExpired" fill="#ef4444" name="totalExpired" />
                <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={3} name="rate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-scale bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              أفضل الأداءات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-green-700">
              • العقود الشهرية تحقق أعلى رضا للعملاء (91%)
            </div>
            <div className="text-sm text-green-700">
              • الشركات الصغيرة تُظهر أعلى نمو (22.8%)
            </div>
            <div className="text-sm text-green-700">
              • معدل التجديد في تحسن مستمر
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              فرص التحسين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-yellow-700">
              • تقليل زمن التوقيع من 2.3 إلى أقل من يومين
            </div>
            <div className="text-sm text-yellow-700">
              • زيادة متوسط مدة العقود اليومية
            </div>
            <div className="text-sm text-yellow-700">
              • تحسين استهداف المؤسسات الحكومية
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              توصيات استراتيجية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-blue-700">
              • التركيز على الشركات الصغيرة والمتوسطة
            </div>
            <div className="text-sm text-blue-700">
              • تطوير عروض خاصة للعقود طويلة المدى
            </div>
            <div className="text-sm text-blue-700">
              • برنامج ولاء للعملاء المُجددين
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}