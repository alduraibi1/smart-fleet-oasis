
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, UserPlus, Star } from "lucide-react";
import { useCustomerAnalysisReport, ReportFilters } from "@/hooks/useReportsData";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CustomerAnalysisReportProps {
  filters: ReportFilters;
}

export function CustomerAnalysisReport({ filters }: CustomerAnalysisReportProps) {
  const { data: customers, isLoading, error } = useCustomerAnalysisReport(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !customers) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">حدث خطأ في تحميل تقرير تحليل العملاء</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const vipCustomers = customers.filter(c => c.customerType === 'vip');
  const newCustomers = customers.filter(c => c.customerType === 'new');
  const regularCustomers = customers.filter(c => c.customerType === 'regular');

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalContracts = customers.reduce((sum, c) => sum + c.totalContracts, 0);
  const avgContractValue = totalContracts > 0 ? totalRevenue / totalContracts : 0;

  const customerTypeData = [
    { name: 'عملاء VIP', value: vipCustomers.length, color: 'hsl(var(--chart-1))' },
    { name: 'عملاء جدد', value: newCustomers.length, color: 'hsl(var(--chart-2))' },
    { name: 'عملاء عاديون', value: regularCustomers.length, color: 'hsl(var(--chart-3))' }
  ];

  const getCustomerTypeIcon = (type: string) => {
    switch (type) {
      case 'vip': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'new': return <UserPlus className="h-4 w-4 text-green-500" />;
      default: return <Star className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case 'vip': return <Badge className="bg-yellow-100 text-yellow-800">VIP</Badge>;
      case 'new': return <Badge className="bg-green-100 text-green-800">جديد</Badge>;
      default: return <Badge variant="outline">عادي</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">تحليل العملاء</h2>
        <Badge>
          {customers.length} عميل
        </Badge>
      </div>

      {/* Customer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عملاء VIP</p>
                <p className="text-2xl font-bold text-yellow-600">{vipCustomers.length}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عملاء جدد</p>
                <p className="text-2xl font-bold text-green-600">{newCustomers.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط قيمة العقد</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgContractValue)}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع أنواع العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    عملاء VIP
                  </span>
                  <span className="font-bold">{vipCustomers.length}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  إيرادات: {formatCurrency(vipCustomers.reduce((sum, c) => sum + c.totalRevenue, 0))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-green-500" />
                    عملاء جدد
                  </span>
                  <span className="font-bold">{newCustomers.length}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  إيرادات: {formatCurrency(newCustomers.reduce((sum, c) => sum + c.totalRevenue, 0))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-500" />
                    عملاء عاديون
                  </span>
                  <span className="font-bold">{regularCustomers.length}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  إيرادات: {formatCurrency(regularCustomers.reduce((sum, c) => sum + c.totalRevenue, 0))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>أفضل العملاء حسب الإيرادات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">اسم العميل</th>
                  <th className="text-right p-3 font-medium">نوع العميل</th>
                  <th className="text-right p-3 font-medium">عدد العقود</th>
                  <th className="text-right p-3 font-medium">إجمالي الإيرادات</th>
                  <th className="text-right p-3 font-medium">متوسط قيمة العقد</th>
                  <th className="text-right p-3 font-medium">آخر تأجير</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 20).map((customer) => (
                  <tr key={customer.customerId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{customer.customerName}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getCustomerTypeIcon(customer.customerType)}
                        {getCustomerTypeBadge(customer.customerType)}
                      </div>
                    </td>
                    <td className="p-3 text-center">{customer.totalContracts}</td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(customer.totalRevenue)}</td>
                    <td className="p-3 text-blue-600">{formatCurrency(customer.avgContractValue)}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {customer.lastRentalDate 
                        ? new Date(customer.lastRentalDate).toLocaleDateString('ar-SA')
                        : 'لا توجد'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
