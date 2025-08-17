
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/hooks/useInventory";
import { Package, AlertTriangle, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

export const InventoryStats = () => {
  const { getInventoryStats, getLowStockItems, getExpiredItems } = useInventory();
  
  const stats = getInventoryStats();
  const lowStockItems = getLowStockItems();
  const expiredItems = getExpiredItems();

  const statsCards = [
    {
      title: "إجمالي العناصر",
      value: stats.totalItems,
      description: `${stats.activeItems} عنصر نشط`,
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "قيمة المخزون",
      value: `${stats.totalValue.toFixed(2)} ر.س`,
      description: "القيمة الإجمالية",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "مخزون منخفض",
      value: stats.lowStockCount,
      description: "عناصر تحتاج تجديد",
      icon: AlertTriangle,
      color: "text-amber-600",
      badge: stats.lowStockCount > 0 ? "تحذير" : undefined,
      badgeVariant: "secondary" as const
    },
    {
      title: "منتهية الصلاحية",
      value: stats.expiredCount,
      description: "عناصر منتهية الصلاحية",
      icon: TrendingDown,
      color: "text-red-600",
      badge: stats.expiredCount > 0 ? "عاجل" : undefined,
      badgeVariant: "destructive" as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {stat.badge && (
                  <Badge variant={stat.badgeVariant}>
                    {stat.badge}
                  </Badge>
                )}
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* تحذيرات المخزون */}
      {(lowStockItems.length > 0 || expiredItems.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* المخزون المنخفض */}
          {lowStockItems.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  مخزون منخفض ({lowStockItems.length})
                </CardTitle>
                <CardDescription>
                  عناصر تحتاج إلى إعادة تجديد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="secondary">
                        {item.current_stock} / {item.minimum_stock}
                      </Badge>
                    </div>
                  ))}
                  {lowStockItems.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      و {lowStockItems.length - 5} عنصر آخر...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* منتهية الصلاحية */}
          {expiredItems.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <TrendingDown className="h-4 w-4" />
                  منتهية الصلاحية ({expiredItems.length})
                </CardTitle>
                <CardDescription>
                  عناصر تحتاج إلى مراجعة عاجلة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {expiredItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="destructive" className="text-xs">
                        {item.expiry_date && new Date(item.expiry_date).toLocaleDateString('ar-SA')}
                      </Badge>
                    </div>
                  ))}
                  {expiredItems.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      و {expiredItems.length - 5} عنصر آخر...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
