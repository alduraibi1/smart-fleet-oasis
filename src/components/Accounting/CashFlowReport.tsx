import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, ArrowUp, ArrowDown, Wallet } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

export function CashFlowReport() {
  // Mock data for cash flow
  const cashFlowData = [
    { month: "يناير", inflow: 380000, outflow: 150000, netFlow: 230000, balance: 230000 },
    { month: "فبراير", inflow: 420000, outflow: 160000, netFlow: 260000, balance: 490000 },
    { month: "مارس", inflow: 390000, outflow: 140000, netFlow: 250000, balance: 740000 },
    { month: "أبريل", inflow: 450000, outflow: 180000, netFlow: 270000, balance: 1010000 },
    { month: "مايو", inflow: 480000, outflow: 190000, netFlow: 290000, balance: 1300000 },
    { month: "يونيو", inflow: 520000, outflow: 200000, netFlow: 320000, balance: 1620000 }
  ];

  const currentBalance = 1620000;
  const monthlyInflow = 520000;
  const monthlyOutflow = 200000;
  const netCashFlow = 320000;

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
              {`${entry.dataKey === 'inflow' ? 'التدفق الداخل' : 
                entry.dataKey === 'outflow' ? 'التدفق الخارج' : 
                entry.dataKey === 'netFlow' ? 'صافي التدفق' : 'الرصيد التراكمي'}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">تقرير التدفق النقدي</h2>
          <p className="text-muted-foreground">متابعة حركة الأموال الداخلة والخارجة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            آخر 6 أشهر
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              الرصيد الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي السيولة المتاحة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
              التدفق الداخل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyInflow)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-red-600" />
              التدفق الخارج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyOutflow)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">صافي التدفق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(netCashFlow)}
            </div>
            <div className="flex items-center mt-1">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                +18.5%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>التدفق النقدي الشهري</CardTitle>
            <CardDescription>مقارنة التدفق الداخل والخارج</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="inflow" fill="#10b981" name="التدفق الداخل" />
                <Bar dataKey="outflow" fill="#ef4444" name="التدفق الخارج" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>تطور الرصيد التراكمي</CardTitle>
            <CardDescription>نمو الرصيد النقدي عبر الزمن</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3} 
                  name="الرصيد التراكمي"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow Sources */}
        <Card>
          <CardHeader>
            <CardTitle>مصادر التدفق الداخل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium">إيرادات العقود النشطة</span>
              <span className="font-bold text-green-600">{formatCurrency(450000)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium">رسوم التفويض</span>
              <span className="font-bold text-green-600">{formatCurrency(35000)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium">غرامات وأتعاب إضافية</span>
              <span className="font-bold text-green-600">{formatCurrency(25000)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium">ودائع ضمان مسترجعة</span>
              <span className="font-bold text-green-600">{formatCurrency(10000)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Outflow Categories */}
        <Card>
          <CardHeader>
            <CardTitle>فئات التدفق الخارج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium">مصروفات الصيانة</span>
              <span className="font-bold text-red-600">{formatCurrency(120000)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium">أجور الموظفين</span>
              <span className="font-bold text-red-600">{formatCurrency(45000)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium">مصروفات تشغيلية</span>
              <span className="font-bold text-red-600">{formatCurrency(25000)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium">مدفوعات للموردين</span>
              <span className="font-bold text-red-600">{formatCurrency(10000)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Cash Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle>جدول التدفق النقدي التفصيلي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">الشهر</th>
                  <th className="text-right p-3 font-medium">التدفق الداخل</th>
                  <th className="text-right p-3 font-medium">التدفق الخارج</th>
                  <th className="text-right p-3 font-medium">صافي التدفق</th>
                  <th className="text-right p-3 font-medium">الرصيد التراكمي</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{row.month}</td>
                    <td className="p-3 text-green-600">{formatCurrency(row.inflow)}</td>
                    <td className="p-3 text-red-600">{formatCurrency(row.outflow)}</td>
                    <td className="p-3">
                      <Badge variant={row.netFlow > 0 ? "default" : "destructive"}>
                        {formatCurrency(row.netFlow)}
                      </Badge>
                    </td>
                    <td className="p-3 font-bold text-primary">{formatCurrency(row.balance)}</td>
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