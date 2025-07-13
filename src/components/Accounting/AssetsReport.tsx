import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Car, TrendingDown, Calculator, FileText } from "lucide-react";
import {
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
  LineChart,
  Line
} from "recharts";

export function AssetsReport() {
  // Mock vehicle assets data
  const vehicleAssets = [
    { id: "1", plateNumber: "أ ب ج 123", brand: "تويوتا", model: "كامري", year: 2021, purchasePrice: 95000, currentValue: 78000, depreciation: 17000 },
    { id: "2", plateNumber: "د هـ و 456", brand: "نيسان", model: "التيما", year: 2020, purchasePrice: 88000, currentValue: 68000, depreciation: 20000 },
    { id: "3", plateNumber: "ز ح ط 789", brand: "هيونداي", model: "إلنترا", year: 2022, purchasePrice: 75000, currentValue: 68000, depreciation: 7000 },
    { id: "4", plateNumber: "ي ك ل 321", brand: "كيا", model: "أوبتيما", year: 2021, purchasePrice: 82000, currentValue: 70000, depreciation: 12000 },
    { id: "5", plateNumber: "م ن س 654", brand: "تويوتا", model: "كورولا", year: 2023, purchasePrice: 72000, currentValue: 70000, depreciation: 2000 }
  ];

  const assetSummary = {
    totalPurchaseValue: vehicleAssets.reduce((sum, v) => sum + v.purchasePrice, 0),
    totalCurrentValue: vehicleAssets.reduce((sum, v) => sum + v.currentValue, 0),
    totalDepreciation: vehicleAssets.reduce((sum, v) => sum + v.depreciation, 0),
    averageAge: 2.1,
    averageDepreciationRate: 15.2
  };

  const depreciationTrend = [
    { year: "2021", depreciation: 45000, rate: 12.5 },
    { year: "2022", depreciation: 52000, rate: 14.8 },
    { year: "2023", depreciation: 58000, rate: 15.2 },
    { year: "2024", depreciation: 65000, rate: 16.1 }
  ];

  const assetsByBrand = [
    { brand: "تويوتا", count: 2, value: 148000, color: "#8884d8" },
    { brand: "نيسان", count: 1, value: 68000, color: "#82ca9d" },
    { brand: "هيونداي", count: 1, value: 68000, color: "#ffc658" },
    { brand: "كيا", count: 1, value: 70000, color: "#ff7c7c" }
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
              {`${entry.dataKey === 'depreciation' ? 'إجمالي الإهلاك' : 
                entry.dataKey === 'rate' ? 'معدل الإهلاك' : entry.name}: ${
                entry.dataKey === 'rate' ? `${entry.value}%` : formatCurrency(entry.value)}`}
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
          <h2 className="text-2xl font-bold">تقرير الأصول</h2>
          <p className="text-muted-foreground">إدارة ومتابعة قيم الأصول والإهلاك</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            تقرير سنوي
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير جدول الأصول
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4" />
              إجمالي الأصول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(assetSummary.totalCurrentValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">القيمة الحالية للأسطول</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              قيمة الشراء الأصلية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(assetSummary.totalPurchaseValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي تكلفة الاستثمار</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              إجمالي الإهلاك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(assetSummary.totalDepreciation)}
            </div>
            <div className="flex items-center mt-1">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {assetSummary.averageDepreciationRate.toFixed(1)}% متوسط
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              عدد المركبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vehicleAssets.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">متوسط العمر {assetSummary.averageAge} سنة</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Depreciation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>اتجاه الإهلاك السنوي</CardTitle>
            <CardDescription>تطور قيم الإهلاك ومعدلاته عبر السنوات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={depreciationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value / 1000}ك`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="depreciation" fill="#ef4444" name="إجمالي الإهلاك" />
                <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} name="معدل الإهلاك" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assets by Brand */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الأصول حسب العلامة التجارية</CardTitle>
            <CardDescription>قيمة الأصول موزعة حسب الماركات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetsByBrand}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ brand, value }) => `${brand}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetsByBrand.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>جدول الأصول التفصيلي</CardTitle>
          <CardDescription>تفاصيل كل مركبة وحالة الإهلاك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 font-medium">رقم اللوحة</th>
                  <th className="text-right p-3 font-medium">المركبة</th>
                  <th className="text-right p-3 font-medium">سنة الصنع</th>
                  <th className="text-right p-3 font-medium">سعر الشراء</th>
                  <th className="text-right p-3 font-medium">القيمة الحالية</th>
                  <th className="text-right p-3 font-medium">الإهلاك</th>
                  <th className="text-right p-3 font-medium">معدل الإهلاك</th>
                </tr>
              </thead>
              <tbody>
                {vehicleAssets.map((vehicle) => {
                  const depreciationRate = (vehicle.depreciation / vehicle.purchasePrice) * 100;
                  return (
                    <tr key={vehicle.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{vehicle.plateNumber}</td>
                      <td className="p-3">{vehicle.brand} {vehicle.model}</td>
                      <td className="p-3">{vehicle.year}</td>
                      <td className="p-3 text-blue-600">{formatCurrency(vehicle.purchasePrice)}</td>
                      <td className="p-3 text-green-600 font-medium">{formatCurrency(vehicle.currentValue)}</td>
                      <td className="p-3 text-red-600">{formatCurrency(vehicle.depreciation)}</td>
                      <td className="p-3">
                        <Badge 
                          variant={depreciationRate > 20 ? "destructive" : depreciationRate > 10 ? "secondary" : "default"}
                        >
                          {depreciationRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="p-3" colSpan={3}>الإجمالي</td>
                  <td className="p-3 text-blue-600">{formatCurrency(assetSummary.totalPurchaseValue)}</td>
                  <td className="p-3 text-green-600">{formatCurrency(assetSummary.totalCurrentValue)}</td>
                  <td className="p-3 text-red-600">{formatCurrency(assetSummary.totalDepreciation)}</td>
                  <td className="p-3">
                    <Badge variant="outline">
                      {assetSummary.averageDepreciationRate.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Asset Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات إدارة الأصول</CardTitle>
          <CardDescription>أدوات لإدارة وتقييم الأصول</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <Calculator className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">إعادة تقييم الأصول</h3>
                <p className="text-sm text-muted-foreground">تحديث القيم السوقية الحالية</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <TrendingDown className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">حساب الإهلاك المتقدم</h3>
                <p className="text-sm text-muted-foreground">طرق إهلاك مختلفة ومتقدمة</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <FileText className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">تقرير ضريبي</h3>
                <p className="text-sm text-muted-foreground">إعداد تقارير للإقرارات الضريبية</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}