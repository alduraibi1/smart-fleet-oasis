import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Calendar,
  Package,
  Building2,
  Eye,
  Edit,
  RefreshCw
} from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { PurchaseOrderStatusDialog } from "./PurchaseOrderStatusDialog";

const statusConfig = {
  draft: { label: "مسودة", color: "bg-gray-500" },
  sent: { label: "تم الإرسال", color: "bg-blue-500" },
  confirmed: { label: "تم التأكيد", color: "bg-green-500" },
  shipped: { label: "تم الشحن", color: "bg-purple-500" },
  delivered: { label: "تم التسليم", color: "bg-green-600" },
  cancelled: { label: "ملغي", color: "bg-red-500" },
};

export const PurchaseOrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const { purchaseOrders, fetchPurchaseOrders } = useSuppliers();

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.suppliers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    
    return (
      <Badge className={`${config.color} text-white animate-fade-in`}>
        {config.label}
      </Badge>
    );
  };

  const handleStatusUpdate = (order: any) => {
    setSelectedOrder(order);
    setShowStatusDialog(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all";

  const getTotalItems = (order: any) => {
    return order.purchase_order_items?.length || 0;
  };

  const getDeliveryStatus = (order: any) => {
    if (!order.expected_delivery_date) return null;
    
    const expectedDate = new Date(order.expected_delivery_date);
    const today = new Date();
    const diffDays = Math.ceil((expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (order.status === 'delivered') return null;
    
    if (diffDays < 0) {
      return <Badge variant="destructive" className="text-xs">متأخر {Math.abs(diffDays)} يوم</Badge>;
    } else if (diffDays <= 3) {
      return <Badge variant="secondary" className="text-xs">مستحق خلال {diffDays} يوم</Badge>;
    }
    
    return null;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في أوامر الشراء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="فلترة حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchPurchaseOrders} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              مسح الفلاتر
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            عرض {filteredOrders.length} من أصل {purchaseOrders.length} أمر شراء
          </span>
          {hasActiveFilters && (
            <Badge variant="outline" className="animate-fade-in">
              تم تطبيق فلاتر
            </Badge>
          )}
        </div>

        {/* Purchase Orders Cards */}
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {order.suppliers?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    {getDeliveryStatus(order)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">تاريخ الأمر</span>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.order_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">التسليم المتوقع</span>
                    <p className="text-sm">
                      {order.expected_delivery_date ? 
                        new Date(order.expected_delivery_date).toLocaleDateString('ar-SA') : 
                        'غير محدد'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">عدد الأصناف</span>
                    <p className="text-sm font-medium">{getTotalItems(order)} صنف</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">إجمالي المبلغ</span>
                    <p className="text-lg font-bold text-primary">{order.total_amount.toFixed(2)} ر.س</p>
                  </div>
                </div>

                {/* Order Items Summary */}
                {order.purchase_order_items && order.purchase_order_items.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-muted-foreground mb-2 block">الأصناف:</span>
                    <div className="flex flex-wrap gap-2">
                      {order.purchase_order_items.slice(0, 3).map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item.inventory_items?.name || `صنف ${index + 1}`} × {item.quantity}
                          {item.inventory_items?.unit_of_measure && ` ${item.inventory_items.unit_of_measure}`}
                        </Badge>
                      ))}
                      {order.purchase_order_items.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{order.purchase_order_items.length - 3} أصناف أخرى
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-muted-foreground">ملاحظات:</span>
                    <p className="text-sm text-muted-foreground mt-1">{order.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(order)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    تحديث الحالة
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log("View order details:", order)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    عرض التفاصيل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="animate-fade-in">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد أوامر شراء</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "لم يتم العثور على أوامر شراء مطابقة للفلاتر المحددة"
                  : "لا توجد أوامر شراء في النظام حالياً"
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Update Dialog */}
      <PurchaseOrderStatusDialog
        open={showStatusDialog}
        onOpenChange={(open) => {
          setShowStatusDialog(open);
          if (!open) setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </>
  );
};
