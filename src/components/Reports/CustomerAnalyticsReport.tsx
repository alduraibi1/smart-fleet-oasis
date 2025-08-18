
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
  CreditCard,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface CustomerAnalytics {
  customerId: string;
  name: string;
  email: string;
  totalContracts: number;
  totalRevenue: number;
  averageContractValue: number;
  averageRentalDuration: number;
  lastRentalDate: string;
  customerSince: string;
  paymentReliability: number;
  preferredVehicleType: string;
  loyaltyScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'vip';
}

export function CustomerAnalyticsReport() {
  const [sortBy, setSortBy] = useState('revenue');
  const [customerSegment, setCustomerSegment] = useState('all');
  const [timePeriod, setTimePeriod] = useState('year');

  // بيانات وهمية للعملاء
  const customerData: CustomerAnalytics[] = [
    {
      customerId: "1",
      name: "أحمد محمد العلي",
      email: "ahmed@example.com",
      totalContracts: 12,
      totalRevenue: 86000,
      averageContractValue: 7167,
      averageRentalDuration: 25,
      lastRentalDate: "2024-01-15",
      customerSince: "2022-03-10",
      paymentReliability: 98,
      preferredVehicleType: "سيدان",
      loyaltyScore: 92,
      riskLevel: 'low',
      status: 'vip'
    },
    {
      customerId: "2",
      name: "فاطمة سعد الغامدي",
      email: "fatima@example.com",
      totalContracts: 8,
      totalRevenue: 54000,
      averageContractValue: 6750,
      averageRentalDuration: 22,
      lastRentalDate: "2024-01-08",
      customerSince: "2022-08-15",
      paymentReliability: 95,
      preferredVehicleType: "SUV",
      loyaltyScore: 85,
      riskLevel: 'low',
      status: 'active'
    },
    {
      customerId: "3",
      name: "محمد عبدالله النجار",
      email: "mohammed@example.com",
      totalContracts: 15,
      totalRevenue: 92000,
      averageContractValue: 6133,
      averageRentalDuration: 18,
      lastRentalDate: "2024-01-20",
      customerSince: "2021-11-22",
      paymentReliability: 88,
      preferredVehicleType: "هاتشباك",
      loyaltyScore: 78,
      riskLevel: 'medium',
      status: 'active'
    },
    {
      customerId: "4",
      name: "خالد أحمد السالم",
      email: "khalid@example.com",
      totalContracts: 6,
      totalRevenue: 28000,
      averageContractValue: 4667,
      averageRentalDuration: 15,
      lastRentalDate: "2023-11-30",
      customerSince: "2023-02-14",
      paymentReliability: 75,
      preferredVehicleType: "سيدان",
      loyaltyScore: 65,
      riskLevel: 'high',
      status: 'inactive'
    }
  ];

  // إحصائيات العملاء حسب الفئات
  const customerSegments = [
    { name: 'VIP', value: 1, color: '#10B981' },
    { name: 'نشط', value: 2, color: '#3B82F6' },
    { name: 'غير نشط', value: 1, color: '#F59E0B' }
  ];

  // أنماط السلوك
  const behaviorPatterns = [
    { pattern: 'إيجار طويل المدى', count: 8, percentage: 32 },
    { pattern: 'إيجار قصير المدى', count: 12, percentage: 48 },
    { pattern: 'إيجار موسمي', count: 5, percentage: 20 }
  ];

  // بيانات الإيرادات الشهرية من العملاء
  const monthlyCustomerRevenue = [
    { month: 'يناير', newCustomers: 5, returningCustomers: 18, revenue: 145000 },
    { month: 'فبراير', newCustomers: 7, returningCustomers: 22, revenue: 168000 },
    { month: 'مارس', newCustomers: 4, returningCustomers: 25, revenue: 185000 },
    { month: 'أبريل', newCustomers: 6, returningCustomers: 20, revenue: 172000 },
    { month: 'مايو', newCustomers: 8, returningCustomers: 28, revenue: 198000 },
    { month: 'يونيو', newCustomers: 3, returningCustomers: 24, revenue: 176000 }
  ];

  const sortedCustomers = [...customerData].sort((a, b) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vip':
        return <Badge className="bg-gold-100 text-gold-800">VIP</Badge>;
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

  // حساب الإحصائيات العامة
  const totalCustomers = customerData.length;
  const vipCustomers = customerData.filter(c => c.status === 'vip').length;
  const avgRevenue = customerData.reduce((sum, c) => sum + c.totalRevenue, 0) / totalCustomers;
  const avgLoyalty = customerData.reduce((sum, c) => sum + c.loyaltyScore, 0) / totalCustomers;

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
                <p className="text-2xl font-bold text-gold-600">{vipCustomers}</p>
              </div>
              <Star className="h-8 w-8 text-gold-500" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              اتجاه إيرادات العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyCustomerRevenue}>
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
                {sortedCustomers.map((customer) => (
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
                          <span className="text-sm font-medium">{customer.paymentReliability}%</span>
                        </div>
                        <Progress value={customer.paymentReliability} className="h-2" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{customer.loyaltyScore}%</span>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            أنماط سلوك العملاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {behaviorPatterns.map((pattern, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{pattern.pattern}</span>
                  <span className="text-muted-foreground">{pattern.count} عميل</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${pattern.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pattern.percentage}%</span>
                  <span>من إجمالي العملاء</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
