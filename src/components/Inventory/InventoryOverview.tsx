
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  ShoppingCart,
  Clock,
  DollarSign
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";

export const InventoryOverview = () => {
  const { 
    items, 
    transactions, 
    getInventoryStats, 
    getLowStockItems, 
    getExpiredItems 
  } = useInventory();
  
  const stats = getInventoryStats();
  const lowStockItems = getLowStockItems();
  const expiredItems = getExpiredItems();

  // حساب الاتجاهات
  const recentTransactions = transactions.slice(0, 30);
  const inTransactions = recentTransactions.filter(t => t.transaction_type === 'in').length;
  const outTransactions = recentTransactions.filter(t => t.transaction_type === 'out').length;

  // أعلى العناصر استخداماً
  const topUsedItems = items
    .filter(item => item.current_stock < item.minimum_stock * 2)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العناصر</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {stats.activeItems} نشط
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalValue.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي قيمة المخزون
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.lowStockCount}
            </div>
            <p className="text-xs text-amber-600">
              يحتاج إعادة تموين
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">منتهي الصلاحية</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.expiredCount}
            </div>
            <p className="text-xs text-red-600">
              يحتاج استبدال
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movement Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              اتجاهات الحركة
            </CardTitle>
            <CardDescription>
              حركات المخزون خلال آخر 30 معاملة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">وارد</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{inTransactions}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {Math.round((inTransactions / recentTransactions.length) * 100)}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={(inTransactions / recentTransactions.length) * 100} 
              className="h-2"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">صادر</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{outTransactions}</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {Math.round((outTransactions / recentTransactions.length) * 100)}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={(outTransactions / recentTransactions.length) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              عناصر تحتاج إعادة تموين
            </CardTitle>
            <CardDescription>
              العناصر التي وصلت للحد الأدنى
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>جميع العناصر ضمن المستوى الطبيعي</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.sku && `رمز: ${item.sku}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-amber-600">
                        {item.current_stock} / {item.minimum_stock}
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        منخفض
                      </Badge>
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <Button variant="outline" className="w-full">
                    عرض المزيد ({lowStockItems.length - 5})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expired Items Alert */}
      {expiredItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              عناصر منتهية الصلاحية
            </CardTitle>
            <CardDescription className="text-red-700">
              هذه العناصر تحتاج استبدال فوري
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiredItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      انتهت الصلاحية: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('ar-SA') : ''}
                    </div>
                  </div>
                  <Badge variant="destructive">
                    منتهي
                  </Badge>
                </div>
              ))}
              {expiredItems.length > 3 && (
                <p className="text-sm text-red-600 text-center">
                  و {expiredItems.length - 3} عنصر آخر
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
