
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Package
} from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";

export const SuppliersOverview = () => {
  const { getSupplierStats } = useSuppliers();
  const stats = getSupplierStats();

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {stats.activeSuppliers} نشط
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أوامر الشراء</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-orange-500" />
              {stats.pendingOrders} قيد التنفيذ
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المشتريات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOrderValue.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي قيمة أوامر الشراء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موردين متميزين</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.topRatedSuppliers}
            </div>
            <p className="text-xs text-muted-foreground">
              تقييم 4 نجوم فأكثر
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              أداء الموردين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">التسليم في الوقت المحدد</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">85%</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ممتاز
                  </Badge>
                </div>
              </div>
              <Progress value={85} className="h-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">جودة المنتجات</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">92%</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    ممتاز
                  </Badge>
                </div>
              </div>
              <Progress value={92} className="h-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">الخدمة العامة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">78%</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    جيد
                  </Badge>
                </div>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              تنبيهات الموردين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                <div>
                  <div className="font-medium text-orange-800">تأخير في التسليم</div>
                  <div className="text-sm text-orange-600">
                    3 أوامر شراء متأخرة عن الموعد المحدد
                  </div>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  3
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div>
                  <div className="font-medium text-blue-800">مراجعة الأسعار</div>
                  <div className="text-sm text-blue-600">
                    2 موردين يحتاجون مراجعة أسعار
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  2
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                <div>
                  <div className="font-medium text-green-800">عقود منتهية</div>
                  <div className="text-sm text-green-600">
                    1 عقد ينتهي خلال 30 يوم
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  1
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
