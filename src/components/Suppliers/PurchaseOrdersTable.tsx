
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  ShoppingCart, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSuppliers } from "@/hooks/useSuppliers";

export const PurchaseOrdersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { purchaseOrders } = useSuppliers();

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.suppliers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline"><Edit className="h-3 w-3 mr-1" />مسودة</Badge>;
      case "sent":
        return <Badge variant="secondary"><Truck className="h-3 w-3 mr-1" />مرسل</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />مؤكد</Badge>;
      case "partially_received":
        return <Badge className="bg-orange-100 text-orange-800"><Package className="h-3 w-3 mr-1" />استلام جزئي</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />مكتمل</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />ملغي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في أوامر الشراء..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="حالة الطلب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
            <SelectItem value="sent">مرسل</SelectItem>
            <SelectItem value="confirmed">مؤكد</SelectItem>
            <SelectItem value="partially_received">استلام جزئي</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchase Orders Cards */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">{order.order_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.suppliers?.name}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      عرض التفاصيل
                    </DropdownMenuItem>
                    {order.status === "draft" && (
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">تاريخ الطلب:</span>
                    <div>{formatDate(order.order_date)}</div>
                  </div>
                </div>

                {order.expected_delivery_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">التسليم المتوقع:</span>
                      <div>{formatDate(order.expected_delivery_date)}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">العناصر:</span>
                    <div>{order.purchase_order_items?.length || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">الإجمالي:</span>
                  <span className="font-medium text-lg">
                    {order.total_amount.toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              {order.notes && (
                <div className="text-sm">
                  <span className="font-medium">ملاحظات:</span> {order.notes}
                </div>
              )}

              {/* Progress indicator */}
              {order.purchase_order_items && order.purchase_order_items.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>تقدم الاستلام</span>
                    <span>
                      {order.purchase_order_items.reduce((sum, item) => sum + item.received_quantity, 0)} / {order.purchase_order_items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(order.purchase_order_items.reduce((sum, item) => sum + item.received_quantity, 0) / order.purchase_order_items.reduce((sum, item) => sum + item.quantity, 0)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">لا توجد أوامر شراء</h3>
            <p className="text-muted-foreground">
              لم يتم العثور على أوامر شراء مطابقة للفلاتر المحددة
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
