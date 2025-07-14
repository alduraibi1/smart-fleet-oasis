import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart, Car, Wrench, Receipt, FileText, Users, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreatePaymentReceiptDialog } from "./PaymentReceipts/CreatePaymentReceiptDialog";
import { CreatePaymentVoucherDialog } from "./PaymentVouchers/CreatePaymentVoucherDialog";
import { CreateDiscountVoucherDialog } from "./DiscountVouchers/CreateDiscountVoucherDialog";

export function AccountingOverview() {
  // Mock data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
  const metrics = {
    totalRevenue: 450000,
    totalExpenses: 180000,
    netProfit: 270000,
    profitMargin: 60,
    activeContracts: 35,
    availableVehicles: 12,
    monthlyGrowth: 12.5,
    averageRevenuePerVehicle: 15000
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
              +{metrics.monthlyGrowth}% من الشهر الماضي
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(metrics.totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground">
              صيانة ومصروفات تشغيل
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.netProfit)}
            </div>
            <div className="text-xs text-muted-foreground">
              هامش ربح {metrics.profitMargin}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الإيراد لكل مركبة</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.averageRevenuePerVehicle)}
            </div>
            <div className="text-xs text-muted-foreground">
              شهريًا
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              حالة الأسطول
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">العقود النشطة</span>
              <Badge variant="default">{metrics.activeContracts} عقد</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">المركبات المتاحة</span>
              <Badge variant="secondary">{metrics.availableVehicles} مركبة</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">معدل الاستخدام</span>
              <Badge variant="outline">
                {Math.round((metrics.activeContracts / (metrics.activeContracts + metrics.availableVehicles)) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              تحليل المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">مصروفات الصيانة</span>
              <span className="font-medium">{formatCurrency(120000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">قطع الغيار</span>
              <span className="font-medium">{formatCurrency(45000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">مصروفات تشغيلية</span>
              <span className="font-medium">{formatCurrency(15000)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Documents */}
      <Card>
        <CardHeader>
          <CardTitle>السندات المالية</CardTitle>
          <CardDescription>
            إصدار وإدارة سندات القبض والصرف والخصم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <CreatePaymentReceiptDialog />
            <CreatePaymentVoucherDialog />
            <CreateDiscountVoucherDialog />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
          <CardDescription>
            الوصول السريع للتقارير والعمليات المحاسبية الهامة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <Car className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">ربحية المركبات</h3>
                <p className="text-sm text-muted-foreground">تحليل ربحية كل مركبة</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">أرباح المالكين</h3>
                <p className="text-sm text-muted-foreground">تقرير أرباح وعمولات المالكين</p>
              </div>
            </Card>

            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <DollarSign className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">المستحقات المالية</h3>
                <p className="text-sm text-muted-foreground">متابعة المدفوعات المستحقة</p>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <Target className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">مؤشرات الأداء</h3>
                <p className="text-sm text-muted-foreground">تحليل KPIs والأهداف</p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}