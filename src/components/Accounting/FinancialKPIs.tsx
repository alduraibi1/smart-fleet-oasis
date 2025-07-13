import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, TrendingUp, TrendingDown, Target, Gauge, Car, DollarSign, Users, Clock, Zap, Award } from "lucide-react";
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
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from "recharts";

export function FinancialKPIs() {
  const [timeRange, setTimeRange] = useState("12months");

  // Mock KPI data
  const kpiMetrics = {
    roi: 28.5, // Return on Investment
    fleetUtilization: 74.2, // Fleet Utilization Rate
    avgRevenuePerVehicle: 15750, // Average Revenue per Vehicle
    customerRetention: 82.3, // Customer Retention Rate
    avgContractDuration: 18.5, // Average Contract Duration (days)
    profitMargin: 61.4, // Profit Margin
    costPerKm: 0.45, // Cost per Kilometer
    vehicleTurnover: 8.2 // Vehicle Turnover Rate
  };

  const vehiclePerformance = [
    { plateNumber: "أ ب ج 123", brand: "تويوتا كامري", monthlyRevenue: 18500, utilization: 87, roi: 32.1, status: "excellent" },
    { plateNumber: "د هـ و 456", brand: "نيسان التيما", monthlyRevenue: 16200, utilization: 78, roi: 28.4, status: "good" },
    { plateNumber: "ز ح ط 789", brand: "هيونداي إلنترا", monthlyRevenue: 14800, utilization: 69, roi: 24.7, status: "average" },
    { plateNumber: "ي ك ل 321", brand: "كيا أوبتيما", monthlyRevenue: 13500, utilization: 62, roi: 21.3, status: "poor" },
    { plateNumber: "م ن س 654", brand: "تويوتا كورولا", monthlyRevenue: 19200, utilization: 92, roi: 35.8, status: "excellent" }
  ];

  const monthlyKPIs = [
    { month: "يناير", roi: 26.2, utilization: 71, profitMargin: 58.3, avgRevenue: 14800 },
    { month: "فبراير", roi: 27.1, utilization: 73, profitMargin: 59.7, avgRevenue: 15200 },
    { month: "مارس", roi: 28.8, utilization: 76, profitMargin: 61.2, avgRevenue: 15900 },
    { month: "أبريل", roi: 29.5, utilization: 78, profitMargin: 62.8, avgRevenue: 16400 },
    { month: "مايو", roi: 28.9, utilization: 75, profitMargin: 61.9, avgRevenue: 16100 },
    { month: "يونيو", roi: 30.2, utilization: 79, profitMargin: 63.5, avgRevenue: 16800 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600";
      case "good": return "text-blue-600";
      case "average": return "text-yellow-600";
      case "poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getPerformanceBadge = (status: string) => {
    switch (status) {
      case "excellent": return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
      case "good": return <Badge className="bg-blue-100 text-blue-800">جيد</Badge>;
      case "average": return <Badge className="bg-yellow-100 text-yellow-800">متوسط</Badge>;
      case "poor": return <Badge variant="destructive">ضعيف</Badge>;
      default: return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const kpiGaugeData = [
    { name: "ROI", value: kpiMetrics.roi, target: 25, color: "#8884d8" },
    { name: "الاستخدام", value: kpiMetrics.fleetUtilization, target: 80, color: "#82ca9d" },
    { name: "هامش الربح", value: kpiMetrics.profitMargin, target: 60, color: "#ffc658" }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">مؤشرات الأداء المالي (KPIs)</h2>
          <p className="text-muted-foreground">تحليل شامل لأداء الأعمال ومؤشرات النجاح الرئيسية</p>
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
              <SelectItem value="24months">آخر سنتان</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              معدل العائد على الاستثمار (ROI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {kpiMetrics.roi}%
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">+2.3% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-600" />
              معدل استخدام الأسطول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {kpiMetrics.fleetUtilization}%
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">+1.8% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4 text-purple-600" />
              متوسط الإيراد لكل مركبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(kpiMetrics.avgRevenuePerVehicle)}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">شهرياً</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              معدل الاحتفاظ بالعملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {kpiMetrics.customerRetention}%
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">+0.9% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              متوسط مدة العقد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">
              {kpiMetrics.avgContractDuration} يوم
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              هامش الربح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">
              {kpiMetrics.profitMargin}%
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              التكلفة لكل كيلومتر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">
              {kpiMetrics.costPerKm} ريال
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              معدل دوران المركبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-2">
              {kpiMetrics.vehicleTurnover}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاهات مؤشرات الأداء الرئيسية</CardTitle>
          <CardDescription>تطور المؤشرات المالية الأساسية عبر الزمن</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyKPIs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  typeof value === 'number' && name === 'avgRevenue' 
                    ? formatCurrency(value) 
                    : `${value}${name !== 'avgRevenue' ? '%' : ''}`, 
                  name === 'roi' ? 'العائد على الاستثمار' :
                  name === 'utilization' ? 'معدل الاستخدام' :
                  name === 'profitMargin' ? 'هامش الربح' :
                  name === 'avgRevenue' ? 'متوسط الإيراد' : name
                ]}
              />
              <Line yAxisId="left" type="monotone" dataKey="roi" stroke="#8884d8" strokeWidth={3} name="roi" />
              <Line yAxisId="left" type="monotone" dataKey="utilization" stroke="#82ca9d" strokeWidth={3} name="utilization" />
              <Line yAxisId="left" type="monotone" dataKey="profitMargin" stroke="#ffc658" strokeWidth={3} name="profitMargin" />
              <Line yAxisId="right" type="monotone" dataKey="avgRevenue" stroke="#ff7c7c" strokeWidth={3} name="avgRevenue" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vehicle Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل أداء المركبات</CardTitle>
          <CardDescription>ترتيب المركبات حسب الأداء المالي والتشغيلي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم اللوحة</th>
                  <th className="text-right p-3 font-medium">المركبة</th>
                  <th className="text-right p-3 font-medium">الإيراد الشهري</th>
                  <th className="text-right p-3 font-medium">معدل الاستخدام</th>
                  <th className="text-right p-3 font-medium">العائد على الاستثمار</th>
                  <th className="text-right p-3 font-medium">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {vehiclePerformance.map((vehicle, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono font-medium">{vehicle.plateNumber}</td>
                    <td className="p-3">{vehicle.brand}</td>
                    <td className="p-3 font-bold text-primary">{formatCurrency(vehicle.monthlyRevenue)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${vehicle.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{vehicle.utilization}%</span>
                      </div>
                    </td>
                    <td className={`p-3 font-bold ${getPerformanceColor(vehicle.status)}`}>
                      {vehicle.roi}%
                    </td>
                    <td className="p-3">{getPerformanceBadge(vehicle.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* KPI Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>مقارنة المؤشرات مع الأهداف</CardTitle>
          <CardDescription>مدى تحقق الأهداف المحددة للشركة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpiGaugeData.map((kpi, index) => (
              <div key={index} className="text-center">
                <h3 className="font-medium mb-4">{kpi.name}</h3>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgb(229, 231, 235)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={kpi.color}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${(kpi.value / 100) * 351.86} 351.86`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{kpi.value}%</div>
                      <div className="text-xs text-muted-foreground">الهدف: {kpi.target}%</div>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  {kpi.value >= kpi.target ? (
                    <Badge className="bg-green-100 text-green-800">تحقق الهدف</Badge>
                  ) : (
                    <Badge variant="secondary">أقل من الهدف</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>التوصيات والإجراءات المطلوبة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-green-800">نقاط القوة</h3>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• العائد على الاستثمار أعلى من المستهدف</li>
                    <li>• معدل الاحتفاظ بالعملاء ممتاز</li>
                    <li>• تحسن مستمر في هامش الربح</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-yellow-800">نقاط التحسين</h3>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• زيادة معدل استخدام الأسطول إلى 80%</li>
                    <li>• تحسين أداء المركبات ضعيفة الأداء</li>
                    <li>• تقليل التكلفة لكل كيلومتر</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}