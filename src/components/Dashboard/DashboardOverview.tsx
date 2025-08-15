
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Car, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wrench, 
  AlertTriangle,
  Users,
  Activity,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { CreatePaymentReceiptDialog } from "@/components/Accounting/PaymentReceipts/CreatePaymentReceiptDialog";
import { CreatePaymentVoucherDialog } from "@/components/Accounting/PaymentVouchers/CreatePaymentVoucherDialog";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Link } from "react-router-dom";

export default function DashboardOverview() {
  const { stats, topVehicles, recentActivity, loading, refetch } = useDashboardData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'maintenance':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">نظرة عامة على الأداء</h2>
          <p className="text-muted-foreground">مؤشرات الأداء الرئيسية والإحصائيات المباشرة</p>
        </div>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث البيانات
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/vehicles">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المركبات</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.availableVehicles} متاحة للتأجير
              </p>
              <div className="mt-2">
                <Progress 
                  value={stats.totalVehicles > 0 ? (stats.availableVehicles / stats.totalVehicles) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/contracts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العقود النشطة</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
              {stats.overdueContracts > 0 && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.overdueContracts} متأخرة
                </p>
              )}
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  معدل الاستخدام {stats.utilizationRate.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/accounting">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                الشهر الحالي: {formatCurrency(stats.monthlyRevenue)}
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs text-green-600">
                  هامش ربح {stats.profitMargin.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/maintenance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الصيانة المعلقة</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pendingMaintenance}
              </div>
              <p className="text-xs text-muted-foreground">
                تحتاج إلى متابعة
              </p>
              {stats.pendingMaintenance > 5 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">
                    تحتاج إلى انتباه
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Additional KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رضا العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.customerSatisfaction.toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">
              متوسط التقييمات
            </p>
            <div className="mt-2">
              <Progress 
                value={(stats.customerSatisfaction / 5) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الاستخدام</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.utilizationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              من إجمالي الأسطول
            </p>
            <div className="mt-2">
              <Badge 
                variant={stats.utilizationRate > 80 ? "default" : "secondary"}
                className="text-xs"
              >
                {stats.utilizationRate > 80 ? 'ممتاز' : 'جيد'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأداء المالي</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              هامش الربح
            </p>
            <div className="mt-2 flex items-center gap-1">
              {stats.profitMargin > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${stats.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profitMargin > 0 ? 'مربح' : 'يحتاج تحسين'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المهام المعلقة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingMaintenance + stats.overdueContracts}
            </div>
            <p className="text-xs text-muted-foreground">
              تحتاج إلى متابعة
            </p>
            <div className="mt-2">
              <Badge 
                variant={stats.pendingMaintenance + stats.overdueContracts > 10 ? "destructive" : "secondary"}
                className="text-xs"
              >
                {stats.pendingMaintenance + stats.overdueContracts > 10 ? 'عاجل' : 'طبيعي'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
          <CardDescription>العمليات الأكثر استخداماً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <CreatePaymentReceiptDialog />
            <CreatePaymentVoucherDialog />
            <Link to="/vehicles/new">
              <Button variant="outline" className="gap-2">
                <Car className="h-4 w-4" />
                إضافة مركبة
              </Button>
            </Link>
            <Link to="/contracts/new">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                عقد جديد
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                التقارير
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Vehicles */}
      {topVehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>أفضل المركبات أداءً</CardTitle>
            <CardDescription>المركبات الأكثر إيراداً هذا الشهر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{vehicle.plateNumber}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-bold text-green-600">
                      {formatCurrency(vehicle.revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle.contracts} عقد
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>النشاطات الحديثة</CardTitle>
            <CardDescription>آخر العمليات في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'contract' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                    activity.type === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {activity.type === 'contract' && <FileText className="h-4 w-4" />}
                    {activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
                    {activity.type === 'maintenance' && <Wrench className="h-4 w-4" />}
                    {activity.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">{activity.description}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleDateString('ar-SA')}
                    </div>
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
