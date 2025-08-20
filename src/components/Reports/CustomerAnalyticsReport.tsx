
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Star, 
  Calendar,
  DollarSign,
  UserCheck,
  Loader2
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useCustomerAnalytics, CustomerAnalyticsData } from "@/hooks/useCustomerAnalytics";
import { useCustomerReportsData } from "@/hooks/useCustomerReportsData";

export function CustomerAnalyticsReport() {
  const [sortBy, setSortBy] = useState('revenue');
  const [customerSegment, setCustomerSegment] = useState('all');
  const [timePeriod, setTimePeriod] = useState('year');

  const { data: customerData = [], isLoading: isLoadingCustomers } = useCustomerAnalytics();
  const { data: reportsData, isLoading: isLoadingReports } = useCustomerReportsData();

  if (isLoadingCustomers || isLoadingReports) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل تحليلات العملاء...</span>
      </div>
    );
  }

  // تطبيق الفلاتر
  let filteredCustomers = [...customerData];
  if (customerSegment !== 'all') {
    filteredCustomers = customerData.filter(customer => customer.status === customerSegment);
  }

  // ترتيب البيانات
  const sortedCustomers = filteredCustomers.sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'contracts':
        return b.totalContracts - a.totalContracts;
      case 'loyalty':
        return b.loyaltyScore - a.loyaltyScore;
      default:
        return 0;
    }
  });

  // حساب الإحصائيات العامة
  const totalCustomers = customerData.length;
  const vipCustomers = customerData.filter(c => c.status === 'vip').length;
  const activeCustomers = customerData.filter(c => c.status === 'active').length;
  const avgRevenue = totalCustomers > 0 ? customerData.reduce((sum, c) => sum + c.totalRevenue, 0) / totalCustomers : 0;
  const avgLoyalty = totalCustomers > 0 ? customerData.reduce((sum, c) => sum + c.loyaltyScore, 0) / totalCustomers : 0;

  // بيانات الرسم البياني الدائري
  const customerSegments = [
    { name: 'VIP', value: vipCustomers, color: '#10B981' },
    { name: 'نشط', value: activeCustomers, color: '#3B82F6' },
    { name: 'غير نشط', value: totalCustomers - vipCustomers - activeCustomers, color: '#F59E0B' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vip':
        return <Badge className="bg-yellow-100 text-yellow-800">VIP</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">غير نشط</Badge>;
      default:
        return <Badge variant="outline">عادي</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">منخفض</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">متوسط</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">عالي</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">الإيرادات</SelectItem>
              <SelectItem value="contracts">عدد العقود</SelectItem>
              <SelectItem value="loyalty">درجة الولاء</SelectItem>
            </SelectContent>
          </Select>

          <Select value={customerSegment} onValueChange={setCustomerSegment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع العملاء</SelectItem>
              <SelectItem value="vip">عملاء VIP</SelectItem>
              <SelectItem value="active">عملاء نشطون</SelectItem>
              <SelectItem value="inactive">عملاء غير نشطين</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">شهري</SelectItem>
              <SelectItem value="quarter">ربعي</SelectItem>
              <SelectItem value="year">سنوي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          تخصيص الفترة
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عملاء VIP</p>
                <p className="text-2xl font-bold text-yellow-600">{vipCustomers}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط الإيراد</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(avgRevenue).toLocaleString()} ريال
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
                <p className="text-sm text-muted-foreground">متوسط الولاء</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(avgLoyalty)}%
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              توزيع العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        {reportsData?.monthlyRevenue && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                اتجاه إيرادات العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportsData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} ريال`} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="الإيرادات"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل تحليل العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">اسم العميل</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="text-right p-3 font-medium">عدد العقود</th>
                  <th className="text-right p-3 font-medium">إجمالي الإيرادات</th>
                  <th className="text-right p-3 font-medium">متوسط العقد</th>
                  <th className="text-right p-3 font-medium">موثوقية الدفع</th>
                  <th className="text-right p-3 font-medium">درجة الولاء</th>
                  <th className="text-right p-3 font-medium">مستوى المخاطر</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.slice(0, 10).map((customer) => (
                  <tr key={customer.customerId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="p-3 font-bold text-center">{customer.totalContracts}</td>
                    <td className="p-3 font-bold text-green-600">
                      {customer.totalRevenue.toLocaleString()} ريال
                    </td>
                    <td className="p-3 font-bold">
                      {Math.round(customer.averageContractValue).toLocaleString()} ريال
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{customer.paymentReliability.toFixed(0)}%</span>
                        </div>
                        <Progress value={customer.paymentReliability} className="h-2" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{customer.loyaltyScore.toFixed(0)}%</span>
                        </div>
                        <Progress value={customer.loyaltyScore} className="h-2" />
                      </div>
                    </td>
                    <td className="p-3">
                      {getRiskBadge(customer.riskLevel)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Patterns */}
      {reportsData?.behaviorPatterns && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              أنماط سلوك العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportsData.behaviorPatterns.map((pattern, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{pattern.pattern}</span>
                    <span className="text-muted-foreground">{pattern.count} عقد</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${pattern.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pattern.percentage.toFixed(1)}%</span>
                    <span>من إجمالي العقود</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
