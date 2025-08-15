
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMonthlyTrends } from "@/hooks/useReportsData";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function TrendsReport() {
  const { data: trends, isLoading, error } = useMonthlyTrends(6);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !trends) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">حدث خطأ في تحميل تقرير الاتجاهات</p>
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

  const currentMonth = trends[trends.length - 1];
  const previousMonth = trends[trends.length - 2];
  
  const revenueChange = previousMonth 
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
    : 0;
  
  const profitChange = previousMonth 
    ? ((currentMonth.profit - previousMonth.profit) / previousMonth.profit) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">تقرير الاتجاهات الشهرية</h2>
      </div>

      {/* Monthly Change Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تغيير الإيرادات الشهرية</p>
                <p className={`text-2xl font-bold ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                </p>
              </div>
              {revenueChange >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تغيير الأرباح الشهرية</p>
                <p className={`text-2xl font-bold ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(1)}%
                </p>
              </div>
              {profitChange >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Profit Trends */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاه الإيرادات والأرباح</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ textAlign: 'right' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={3}
                name="الإيرادات" 
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={3}
                name="المصروفات" 
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={3}
                name="صافي الربح" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Contracts Trend */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاه عدد العقود الجديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} عقد`, 'عدد العقود']}
                labelStyle={{ textAlign: 'right' }}
              />
              <Bar dataKey="contractsCount" fill="hsl(var(--chart-4))" name="عدد العقود" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الأداء الشهري</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">الشهر</th>
                  <th className="text-right p-3 font-medium">الإيرادات</th>
                  <th className="text-right p-3 font-medium">المصروفات</th>
                  <th className="text-right p-3 font-medium">صافي الربح</th>
                  <th className="text-right p-3 font-medium">عدد العقود</th>
                  <th className="text-right p-3 font-medium">متوسط قيمة العقد</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend) => (
                  <tr key={trend.month} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{trend.month}</td>
                    <td className="p-3 font-bold text-green-600">{formatCurrency(trend.revenue)}</td>
                    <td className="p-3 font-bold text-red-600">{formatCurrency(trend.expenses)}</td>
                    <td className={`p-3 font-bold ${trend.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {formatCurrency(trend.profit)}
                    </td>
                    <td className="p-3 text-center">{trend.contractsCount}</td>
                    <td className="p-3 text-purple-600">
                      {trend.contractsCount > 0 
                        ? formatCurrency(trend.revenue / trend.contractsCount)
                        : formatCurrency(0)
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
