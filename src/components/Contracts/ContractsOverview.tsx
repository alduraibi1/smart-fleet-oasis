import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, TrendingUp, TrendingDown, FileText, Users, Car, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";
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
  AreaChart,
  Area
} from "recharts";

export function ContractsOverview() {
  // Mock contracts data
  const contractsData = {
    totalContracts: 248,
    activeContracts: 89,
    expiredContracts: 34,
    pendingContracts: 12,
    averageContractValue: 15750,
    totalRevenue: 3900000,
    contractsThisMonth: 23,
    renewalRate: 78.5
  };

  const monthlyTrend = [
    { month: "يناير", new: 18, renewed: 12, expired: 8, revenue: 285000 },
    { month: "فبراير", new: 22, renewed: 15, expired: 6, revenue: 320000 },
    { month: "مارس", new: 25, renewed: 18, expired: 10, revenue: 375000 },
    { month: "أبريل", new: 20, renewed: 14, expired: 12, revenue: 310000 },
    { month: "مايو", new: 28, renewed: 20, expired: 9, revenue: 425000 },
    { month: "يونيو", new: 23, renewed: 16, expired: 11, revenue: 365000 }
  ];

  const contractsByType = [
    { name: "عقود شهرية", value: 156, color: "#8884d8" },
    { name: "عقود يومية", value: 67, color: "#82ca9d" },
    { name: "عقود أسبوعية", value: 25, color: "#ffc658" }
  ];

  const topPerformingContracts = [
    { id: "C001", customerName: "شركة الرياض للنقل", vehicleCount: 8, monthlyValue: 28800, duration: 12, type: "شركات" },
    { id: "C045", customerName: "أحمد محمد العلي", vehicleCount: 3, monthlyValue: 8400, duration: 6, type: "أفراد" },
    { id: "C078", customerName: "مؤسسة الخليج", vehicleCount: 5, monthlyValue: 15500, duration: 9, type: "مؤسسة" },
    { id: "C092", customerName: "فاطمة سعد الغامدي", vehicleCount: 2, monthlyValue: 4800, duration: 8, type: "أفراد" },
    { id: "C134", customerName: "شركة الأمل السياحية", vehicleCount: 6, monthlyValue: 19200, duration: 18, type: "سياحة" }
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
              {`${entry.dataKey === 'new' ? 'عقود جديدة' : 
                entry.dataKey === 'renewed' ? 'عقود مُجددة' : 
                entry.dataKey === 'expired' ? 'عقود منتهية' : 'الإيرادات'}: ${
                entry.dataKey === 'revenue' ? formatCurrency(entry.value) : entry.value}`}
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
          <h2 className="text-2xl font-bold">نظرة عامة على العقود</h2>
          <p className="text-muted-foreground">تحليل شامل لأداء العقود وإحصائيات النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            هذا الشهر
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              إجمالي العقود
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {contractsData.totalContracts}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">+12% من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              العقود النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {contractsData.activeContracts}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {Math.round((contractsData.activeContracts / contractsData.totalContracts) * 100)}% من الإجمالي
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              متوسط قيمة العقد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(contractsData.averageContractValue)}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">+8.5% نمو</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              معدل التجديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {contractsData.renewalRate}%
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-100 text-orange-800">ممتاز</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>اتجاه العقود الشهري</CardTitle>
            <CardDescription>إحصائيات العقود الجديدة والمُجددة والمنتهية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="new" fill="#3b82f6" name="عقود جديدة" />
                <Bar dataKey="renewed" fill="#10b981" name="عقود مُجددة" />
                <Bar dataKey="expired" fill="#ef4444" name="عقود منتهية" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع أنواع العقود</CardTitle>
            <CardDescription>التوزيع حسب مدة العقد</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contractsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contractsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاه الإيرادات من العقود</CardTitle>
          <CardDescription>الإيرادات الشهرية من جميع العقود</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                name="الإيرادات"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>أفضل العقود أداءً</CardTitle>
          <CardDescription>العقود الأكثر ربحية وقيمة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم العقد</th>
                  <th className="text-right p-3 font-medium">العميل</th>
                  <th className="text-right p-3 font-medium">عدد المركبات</th>
                  <th className="text-right p-3 font-medium">القيمة الشهرية</th>
                  <th className="text-right p-3 font-medium">المدة (شهور)</th>
                  <th className="text-right p-3 font-medium">النوع</th>
                </tr>
              </thead>
              <tbody>
                {topPerformingContracts.map((contract, index) => (
                  <tr key={contract.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono font-medium">{contract.id}</td>
                    <td className="p-3">{contract.customerName}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">{contract.vehicleCount} مركبة</Badge>
                    </td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(contract.monthlyValue)}</td>
                    <td className="p-3 text-center">{contract.duration}</td>
                    <td className="p-3">
                      <Badge variant={contract.type === 'شركات' ? 'default' : 
                                   contract.type === 'مؤسسة' ? 'secondary' : 'outline'}>
                        {contract.type}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              نقاط القوة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">معدل تجديد عالي</h3>
                <p className="text-sm text-green-700">78.5% من العملاء يجددون عقودهم</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">نمو مستمر في الإيرادات</h3>
                <p className="text-sm text-green-700">زيادة 12% في عدد العقود الجديدة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">تنوع في قطاعات العملاء</h3>
                <p className="text-sm text-green-700">توزيع متوازن بين الأفراد والشركات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              فرص التحسين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-yellow-800">تقليل العقود المنتهية</h3>
                <p className="text-sm text-yellow-700">وضع نظام تذكير مبكر للتجديد</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-yellow-800">زيادة متوسط قيمة العقد</h3>
                <p className="text-sm text-yellow-700">عروض باقات متعددة المركبات</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-yellow-800">تسريع العقود المعلقة</h3>
                <p className="text-sm text-yellow-700">تطوير نظام موافقة أسرع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}