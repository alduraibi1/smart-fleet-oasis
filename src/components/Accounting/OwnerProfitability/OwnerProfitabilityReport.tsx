import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Car,
  Clock,
  Download,
  Search,
  Filter,
  Eye,
  BarChart3,
  PieChart,
  Wallet,
  Calendar
} from "lucide-react";
import {
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
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";

export function OwnerProfitabilityReport() {
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");

  // Mock data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
  const ownersProfitability = [
    {
      ownerId: "1",
      ownerName: "محمد أحمد الفهد",
      totalVehicles: 3,
      activeVehicles: 3,
      totalRevenue: 68300,
      averageRevenuePerVehicle: 22767,
      bestPerformingVehicle: "أ ب ج 123 - تويوتا كامري",
      worstPerformingVehicle: "م ن س 654 - تويوتا كورولا",
      totalCommission: 40980, // 60% commission rate
      paidCommission: 35000,
      pendingCommission: 5980,
      commissionRate: 60,
      fleetUtilization: 85.3,
      totalProfitGenerated: 8120,
      averageProfitPerVehicle: 2707,
      lastPaymentDate: new Date('2024-01-15'),
      paymentFrequency: 'monthly' as const,
      vehicles: [
        { plateNumber: "أ ب ج 123", revenue: 25500, commission: 15300, profit: 2500 },
        { plateNumber: "ز ح ط 789", revenue: 22800, commission: 13680, profit: 3120 },
        { plateNumber: "م ن س 654", revenue: 20000, commission: 12000, profit: 2500 }
      ]
    },
    {
      ownerId: "2", 
      ownerName: "عبدالله سالم القحطاني",
      totalVehicles: 2,
      activeVehicles: 2,
      totalRevenue: 42000,
      averageRevenuePerVehicle: 21000,
      bestPerformingVehicle: "د هـ و 456 - نيسان التيما",
      worstPerformingVehicle: "ع غ ف 987 - هيونداي سوناتا",
      totalCommission: 25200, // 60% commission rate
      paidCommission: 20000,
      pendingCommission: 5200,
      commissionRate: 60,
      fleetUtilization: 73.5,
      totalProfitGenerated: 2800,
      averageProfitPerVehicle: 1400,
      lastPaymentDate: new Date('2024-01-10'),
      paymentFrequency: 'monthly' as const,
      vehicles: [
        { plateNumber: "د هـ و 456", revenue: 20000, commission: 12000, profit: 1500 },
        { plateNumber: "ع غ ف 987", revenue: 22000, commission: 13200, profit: 1300 }
      ]
    },
    {
      ownerId: "3",
      ownerName: "فاطمة عبدالرحمن الغامدي", 
      totalVehicles: 4,
      activeVehicles: 3,
      totalRevenue: 55600,
      averageRevenuePerVehicle: 13900,
      bestPerformingVehicle: "ص ض ط 111 - لكزس ES350",
      worstPerformingVehicle: "ي ك ل 321 - كيا أوبتيما",
      totalCommission: 33360, // 60% commission rate
      paidCommission: 28000,
      pendingCommission: 5360,
      commissionRate: 60,
      fleetUtilization: 68.2,
      totalProfitGenerated: 1580,
      averageProfitPerVehicle: 395,
      lastPaymentDate: new Date('2024-01-20'),
      paymentFrequency: 'monthly' as const,
      vehicles: [
        { plateNumber: "ي ك ل 321", revenue: 17200, commission: 10320, profit: -420 },
        { plateNumber: "ص ض ط 111", revenue: 18400, commission: 11040, profit: 1200 },
        { plateNumber: "ق ر ش 222", revenue: 20000, commission: 12000, profit: 800 }
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredOwners = ownersProfitability.filter(owner => 
    owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = filteredOwners.reduce((sum, o) => sum + o.totalRevenue, 0);
  const totalCommission = filteredOwners.reduce((sum, o) => sum + o.totalCommission, 0);
  const totalPendingCommission = filteredOwners.reduce((sum, o) => sum + o.pendingCommission, 0);
  const totalVehicles = filteredOwners.reduce((sum, o) => sum + o.totalVehicles, 0);
  const averageUtilization = filteredOwners.reduce((sum, o) => sum + o.fleetUtilization, 0) / filteredOwners.length;

  // Chart data
  const revenueByOwnerData = filteredOwners.map(owner => ({
    name: owner.ownerName.split(' ')[0] + '...',
    fullName: owner.ownerName,
    revenue: owner.totalRevenue,
    commission: owner.totalCommission,
    profit: owner.totalProfitGenerated
  }));

  const utilizationComparisonData = filteredOwners.map(owner => ({
    name: owner.ownerName.split(' ')[0] + '...',
    fullName: owner.ownerName,
    utilization: owner.fleetUtilization,
    vehicles: owner.totalVehicles,
    avgRevenue: owner.averageRevenuePerVehicle
  }));

  const commissionStatusData = [
    { name: "مدفوع", value: filteredOwners.reduce((sum, o) => sum + o.paidCommission, 0), color: "#8884d8" },
    { name: "معلق", value: totalPendingCommission, color: "#82ca9d" }
  ];

  const monthlyTrendData = [
    { month: "أكتوبر", revenue: 45000, commission: 27000, profit: 5400 },
    { month: "نوفمبر", revenue: 52000, commission: 31200, profit: 6200 },
    { month: "ديسمبر", revenue: 48000, commission: 28800, profit: 5800 },
    { month: "يناير", revenue: 55000, commission: 33000, profit: 6600 }
  ];

  const getOwnerDetails = (ownerId: string) => {
    return ownersProfitability.find(o => o.ownerId === ownerId);
  };

  const getPerformanceBadge = (profitGenerated: number) => {
    if (profitGenerated > 5000) return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
    if (profitGenerated > 2000) return <Badge className="bg-blue-100 text-blue-800">جيد</Badge>;
    if (profitGenerated > 0) return <Badge className="bg-yellow-100 text-yellow-800">متوسط</Badge>;
    return <Badge variant="destructive">ضعيف</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">تقرير أرباح المالكين</h2>
          <p className="text-muted-foreground">تحليل شامل لأداء كل مالك وعمولاته والأرباح المحققة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            المرشحات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="period">الفترة الزمنية</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">الشهر الحالي</SelectItem>
                  <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                  <SelectItem value="6months">آخر 6 أشهر</SelectItem>
                  <SelectItem value="12months">آخر 12 شهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث باسم المالك..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              إجمالي المالكين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredOwners.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {totalVehicles} مركبة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">
              جميع المالكين
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-purple-600" />
              إجمالي العمولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalCommission)}
            </div>
            <div className="text-xs text-muted-foreground">
              عمولات مستحقة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              العمولات المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalPendingCommission)}
            </div>
            <div className="text-xs text-muted-foreground">
              في انتظار الدفع
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4 text-indigo-600" />
              متوسط الاستخدام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {averageUtilization.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              جميع الأساطيل
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="individual">تفاصيل المالكين</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  مقارنة الإيرادات والعمولات
                </CardTitle>
                <CardDescription>الإيرادات مقابل العمولات لكل مالك</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByOwnerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(Number(value)), name]}
                      labelFormatter={(label) => {
                        const owner = revenueByOwnerData.find(o => o.name === label);
                        return owner ? owner.fullName : label;
                      }}
                    />
                    <Bar dataKey="revenue" fill="#8884d8" name="الإيرادات" />
                    <Bar dataKey="commission" fill="#82ca9d" name="العمولة" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Commission Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  حالة العمولات
                </CardTitle>
                <CardDescription>توزيع العمولات المدفوعة والمعلقة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={commissionStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {commissionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                أداء الاستخدام والإيرادات
              </CardTitle>
              <CardDescription>مقارنة معدل الاستخدام مع متوسط الإيرادات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={utilizationComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'avgRevenue' ? formatCurrency(Number(value)) : `${value}%`,
                      name === 'utilization' ? 'معدل الاستخدام' : 'متوسط الإيراد'
                    ]}
                    labelFormatter={(label) => {
                      const owner = utilizationComparisonData.find(o => o.name === label);
                      return owner ? owner.fullName : label;
                    }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="utilization" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="utilization" />
                  <Line yAxisId="right" type="monotone" dataKey="avgRevenue" stroke="#ff7c7c" strokeWidth={2} name="avgRevenue" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          {/* Owner Selection */}
          <Card>
            <CardHeader>
              <CardTitle>اختيار المالك للتفاصيل</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر مالك لعرض التفاصيل..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredOwners.map((owner) => (
                    <SelectItem key={owner.ownerId} value={owner.ownerId}>
                      {owner.ownerName} - {owner.totalVehicles} مركبات
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Individual Owner Details */}
          {selectedOwner && (
            <div className="space-y-6">
              {(() => {
                const owner = getOwnerDetails(selectedOwner);
                if (!owner) return null;

                return (
                  <>
                    {/* Owner Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {owner.ownerName} - تفاصيل الأداء
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">إجمالي المركبات</p>
                            <p className="text-2xl font-bold text-primary">{owner.totalVehicles}</p>
                            <p className="text-xs text-muted-foreground">{owner.activeVehicles} نشطة</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(owner.totalRevenue)}</p>
                            <p className="text-xs text-muted-foreground">آخر 3 أشهر</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">إجمالي العمولة</p>
                            <p className="text-2xl font-bold text-purple-600">{formatCurrency(owner.totalCommission)}</p>
                            <p className="text-xs text-muted-foreground">{owner.commissionRate}% عمولة</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">معدل الاستخدام</p>
                            <p className="text-2xl font-bold text-blue-600">{owner.fleetUtilization}%</p>
                            <p className="text-xs text-muted-foreground">جميع المركبات</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Vehicle Performance */}
                    <Card>
                      <CardHeader>
                        <CardTitle>أداء المركبات الفردية</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-right p-3 font-medium">رقم اللوحة</th>
                                <th className="text-right p-3 font-medium">الإيرادات</th>
                                <th className="text-right p-3 font-medium">العمولة</th>
                                <th className="text-right p-3 font-medium">صافي ربح الشركة</th>
                                <th className="text-right p-3 font-medium">النسبة من الإجمالي</th>
                              </tr>
                            </thead>
                            <tbody>
                              {owner.vehicles.map((vehicle, index) => (
                                <tr key={index} className="border-b hover:bg-muted/50">
                                  <td className="p-3 font-medium">{vehicle.plateNumber}</td>
                                  <td className="p-3 text-green-600 font-medium">{formatCurrency(vehicle.revenue)}</td>
                                  <td className="p-3 text-purple-600 font-medium">{formatCurrency(vehicle.commission)}</td>
                                  <td className={`p-3 font-medium ${vehicle.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(vehicle.profit)}
                                  </td>
                                  <td className="p-3">
                                    <Badge variant="outline">
                                      {((vehicle.revenue / owner.totalRevenue) * 100).toFixed(1)}%
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            معلومات الدفع
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">العمولة المدفوعة:</span>
                            <span className="font-medium text-green-600">{formatCurrency(owner.paidCommission)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">العمولة المعلقة:</span>
                            <span className="font-medium text-orange-600">{formatCurrency(owner.pendingCommission)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">آخر دفعة:</span>
                            <span className="font-medium">{owner.lastPaymentDate?.toLocaleDateString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">دورة الدفع:</span>
                            <Badge variant="outline">
                              {owner.paymentFrequency === 'monthly' ? 'شهرياً' : 
                               owner.paymentFrequency === 'quarterly' ? 'ربع سنوي' : 'سنوياً'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            مؤشرات الأداء
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">أفضل مركبة:</span>
                            <span className="font-medium text-green-600 text-sm">{owner.bestPerformingVehicle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">أضعف مركبة:</span>
                            <span className="font-medium text-red-600 text-sm">{owner.worstPerformingVehicle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">متوسط الإيراد لكل مركبة:</span>
                            <span className="font-medium">{formatCurrency(owner.averageRevenuePerVehicle)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">متوسط الربح لكل مركبة:</span>
                            <span className="font-medium">{formatCurrency(owner.averageProfitPerVehicle)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {/* Payments Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المدفوعات المستحقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {formatCurrency(totalPendingCommission)}
                </div>
                <p className="text-sm text-muted-foreground">
                  لجميع المالكين - يتطلب دفع فوري
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المدفوعات هذا الشهر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(83000)}
                </div>
                <p className="text-sm text-muted-foreground">
                  تم دفعها للمالكين
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المتوسط الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCurrency(totalCommission / 3)}
                </div>
                <p className="text-sm text-muted-foreground">
                  متوسط العمولات الشهرية
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                تفاصيل المدفوعات المستحقة
              </CardTitle>
              <CardDescription>
                العمولات المستحقة للمالكين وتواريخ الاستحقاق
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-medium">المالك</th>
                      <th className="text-right p-3 font-medium">عدد المركبات</th>
                      <th className="text-right p-3 font-medium">إجمالي الإيرادات</th>
                      <th className="text-right p-3 font-medium">العمولة المستحقة</th>
                      <th className="text-right p-3 font-medium">العمولة المعلقة</th>
                      <th className="text-right p-3 font-medium">آخر دفعة</th>
                      <th className="text-right p-3 font-medium">الحالة</th>
                      <th className="text-right p-3 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOwners.map((owner) => (
                      <tr key={owner.ownerId} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{owner.ownerName}</td>
                        <td className="p-3">{owner.totalVehicles}</td>
                        <td className="p-3 text-green-600 font-medium">{formatCurrency(owner.totalRevenue)}</td>
                        <td className="p-3 text-purple-600 font-medium">{formatCurrency(owner.totalCommission)}</td>
                        <td className="p-3 text-orange-600 font-medium">{formatCurrency(owner.pendingCommission)}</td>
                        <td className="p-3 text-sm">{owner.lastPaymentDate?.toLocaleDateString('ar-SA')}</td>
                        <td className="p-3">
                          {owner.pendingCommission > 1000 ? (
                            <Badge variant="destructive">متأخر</Badge>
                          ) : owner.pendingCommission > 0 ? (
                            <Badge className="bg-orange-100 text-orange-800">مستحق</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">مسدد</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" className="gap-1">
                            <DollarSign className="h-3 w-3" />
                            دفع
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                الاتجاهات الشهرية للإيرادات والعمولات
              </CardTitle>
              <CardDescription>
                تطور الإيرادات والعمولات والأرباح خلال الأشهر الماضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} name="الإيرادات" />
                  <Line type="monotone" dataKey="commission" stroke="#82ca9d" strokeWidth={3} name="العمولات" />
                  <Line type="monotone" dataKey="profit" stroke="#ffc658" strokeWidth={3} name="صافي الربح" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أفضل المالكين أداءً</CardTitle>
                <CardDescription>ترتيب المالكين حسب الأرباح المحققة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOwners
                    .sort((a, b) => b.totalProfitGenerated - a.totalProfitGenerated)
                    .map((owner, index) => (
                      <div key={owner.ownerId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{owner.ownerName}</p>
                            <p className="text-sm text-muted-foreground">{owner.totalVehicles} مركبات</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(owner.totalProfitGenerated)}</p>
                          <p className="text-sm text-muted-foreground">{owner.fleetUtilization.toFixed(1)}% استخدام</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملخص الأداء العام</CardTitle>
                <CardDescription>مؤشرات الأداء الرئيسية لجميع المالكين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">نقاط القوة</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• متوسط استخدام جيد ({averageUtilization.toFixed(1)}%)</li>
                    <li>• إيرادات مستقرة ومتنامية</li>
                    <li>• علاقات طيبة مع المالكين</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">نقاط تحتاج تحسين</span>
                  </div>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• عمولات معلقة بقيمة {formatCurrency(totalPendingCommission)}</li>
                    <li>• بعض المركبات تحتاج تحسين في الاستخدام</li>
                    <li>• أتمتة عملية دفع العمولات</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">التوصيات</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• زيادة معدل استخدام الأسطول الضعيف</li>
                    <li>• تطوير برنامج حوافز للمالكين</li>
                    <li>• مراجعة هيكل العمولات دورياً</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}