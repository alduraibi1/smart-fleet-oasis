import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, Calculator, FileText, TrendingUp, AlertTriangle, PieChart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Cell
} from "recharts";

export function TaxManagement() {
  const [selectedQuarter, setSelectedQuarter] = useState("Q1-2024");

  // Mock tax data
  const taxSummary = {
    totalRevenue: 2640000,
    taxableRevenue: 2640000,
    vatRate: 15,
    vatOwed: 396000,
    vatPaid: 320000,
    vatBalance: 76000,
    quarterlyRevenue: [
      { quarter: "Q1 2024", revenue: 660000, vat: 99000 },
      { quarter: "Q4 2023", revenue: 620000, vat: 93000 },
      { quarter: "Q3 2023", revenue: 580000, vat: 87000 },
      { quarter: "Q2 2023", revenue: 545000, vat: 81750 }
    ]
  };

  const vatBreakdown = [
    { source: "إيرادات التأجير", amount: 2400000, vat: 360000, rate: 15 },
    { source: "رسوم التفويض", amount: 150000, vat: 22500, rate: 15 },
    { source: "غرامات وأتعاب", amount: 90000, vat: 13500, rate: 15 }
  ];

  const taxByCategory = [
    { name: "ضريبة القيمة المضافة", value: 396000, color: "#8884d8" },
    { name: "ضريبة الدخل المقدرة", value: 158400, color: "#82ca9d" },
    { name: "رسوم حكومية", value: 25000, color: "#ffc658" }
  ];

  const monthlyVat = [
    { month: "يناير", revenue: 420000, vat: 63000 },
    { month: "فبراير", revenue: 380000, vat: 57000 },
    { month: "مارس", revenue: 450000, vat: 67500 },
    { month: "أبريل", revenue: 480000, vat: 72000 },
    { month: "مايو", revenue: 460000, vat: 69000 },
    { month: "يونيو", revenue: 450000, vat: 67500 }
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
              {`${entry.dataKey === 'revenue' ? 'الإيرادات' : 'ضريبة القيمة المضافة'}: ${formatCurrency(entry.value)}`}
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
          <h2 className="text-2xl font-bold">إدارة النظام الضريبي</h2>
          <p className="text-muted-foreground">حساب وإدارة الضرائب والإقرارات الضريبية</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                إعداد إقرار ضريبي
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إعداد إقرار ضريبي جديد</DialogTitle>
                <DialogDescription>إنشاء إقرار ضريبي للفترة المحددة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="period">الفترة الضريبية</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1-2024">الربع الأول 2024</SelectItem>
                      <SelectItem value="Q4-2023">الربع الرابع 2023</SelectItem>
                      <SelectItem value="Q3-2023">الربع الثالث 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">نوع الإقرار</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الإقرار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vat">ضريبة القيمة المضافة</SelectItem>
                      <SelectItem value="income">ضريبة الدخل</SelectItem>
                      <SelectItem value="withholding">ضريبة الاستقطاع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">إنشاء الإقرار</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير الضريبي
          </Button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              إجمالي الإيرادات الخاضعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(taxSummary.taxableRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">للربع الحالي</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              ضريبة القيمة المضافة المستحقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(taxSummary.vatOwed)}
            </div>
            <div className="flex items-center mt-1">
              <Badge variant="outline">{taxSummary.vatRate}% معدل الضريبة</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              ضريبة مدفوعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(taxSummary.vatPaid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">دفعات مقدمة</p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              الرصيد المستحق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(taxSummary.vatBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">متبقي للدفع</p>
          </CardContent>
        </Card>
      </div>

      {/* Quarter Selection */}
      <Card>
        <CardHeader>
          <CardTitle>اختيار الفترة الضريبية</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1-2024">الربع الأول 2024</SelectItem>
              <SelectItem value="Q4-2023">الربع الرابع 2023</SelectItem>
              <SelectItem value="Q3-2023">الربع الثالث 2023</SelectItem>
              <SelectItem value="Q2-2023">الربع الثاني 2023</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly VAT Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ضريبة القيمة المضافة الشهرية</CardTitle>
            <CardDescription>تطور الضريبة المستحقة شهرياً</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyVat}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}ك`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#3b82f6" name="الإيرادات" />
                <Bar dataKey="vat" fill="#ef4444" name="ضريبة القيمة المضافة" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tax Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الضرائب</CardTitle>
            <CardDescription>أنواع الضرائب المستحقة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={taxByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taxByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* VAT Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفصيل ضريبة القيمة المضافة</CardTitle>
          <CardDescription>تفاصيل حساب الضريبة حسب مصادر الإيرادات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">مصدر الإيراد</th>
                  <th className="text-right p-3 font-medium">المبلغ الخاضع للضريبة</th>
                  <th className="text-right p-3 font-medium">معدل الضريبة</th>
                  <th className="text-right p-3 font-medium">ضريبة القيمة المضافة</th>
                </tr>
              </thead>
              <tbody>
                {vatBreakdown.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{item.source}</td>
                    <td className="p-3 text-blue-600">{formatCurrency(item.amount)}</td>
                    <td className="p-3">
                      <Badge variant="outline">{item.rate}%</Badge>
                    </td>
                    <td className="p-3 font-bold text-red-600">{formatCurrency(item.vat)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold bg-muted/30">
                  <td className="p-3">الإجمالي</td>
                  <td className="p-3 text-blue-600">
                    {formatCurrency(vatBreakdown.reduce((sum, item) => sum + item.amount, 0))}
                  </td>
                  <td className="p-3">-</td>
                  <td className="p-3 text-red-600">
                    {formatCurrency(vatBreakdown.reduce((sum, item) => sum + item.vat, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>التقويم الضريبي</CardTitle>
          <CardDescription>مواعيد الإقرارات والدفعات الضريبية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">15 فبراير 2024</span>
              </div>
              <h3 className="font-medium">إقرار ضريبة القيمة المضافة</h3>
              <p className="text-sm text-muted-foreground">الربع الرابع 2023</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">30 أبريل 2024</span>
              </div>
              <h3 className="font-medium">إقرار ضريبة الدخل</h3>
              <p className="text-sm text-muted-foreground">السنة المالية 2023</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">15 مايو 2024</span>
              </div>
              <h3 className="font-medium">إقرار ضريبة القيمة المضافة</h3>
              <p className="text-sm text-muted-foreground">الربع الأول 2024</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">15 أغسطس 2024</span>
              </div>
              <h3 className="font-medium">إقرار ضريبة القيمة المضافة</h3>
              <p className="text-sm text-muted-foreground">الربع الثاني 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <Calculator className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">حاسبة الضريبة</h3>
                <p className="text-sm text-muted-foreground">حساب الضريبة لمبلغ معين</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <FileText className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">إقرارات سابقة</h3>
                <p className="text-sm text-muted-foreground">عرض الإقرارات المقدمة</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors hover-scale">
              <div className="text-center space-y-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">تنبيهات ضريبية</h3>
                <p className="text-sm text-muted-foreground">إعداد تذكيرات للمواعيد</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}