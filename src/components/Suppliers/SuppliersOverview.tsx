import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuppliers } from "@/hooks/useSuppliers";

export const SuppliersOverview = () => {
  const { getSupplierStats } = useSuppliers();
  const stats = getSupplierStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي الموردين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            <p className="text-sm text-muted-foreground">
              {stats.activeSuppliers} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أوامر الشراء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-sm text-muted-foreground">
              {stats.pendingOrders} قيد المعالجة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إجمالي المشتريات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOrderValue.toLocaleString()} ريال
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.topRatedSuppliers} مورد متميز
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground">المزيد من التفاصيل قريباً...</p>
      </div>
    </div>
  );
};