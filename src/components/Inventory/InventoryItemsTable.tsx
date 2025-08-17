
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useInventory } from "@/hooks/useInventory";
import { 
  Package, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter
} from "lucide-react";

export const InventoryItemsTable = () => {
  const { items, loading } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter items based on search criteria
  const filteredItems = items.filter((item) => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "low_stock" && item.current_stock <= item.minimum_stock) ||
      (statusFilter === "out_of_stock" && item.current_stock <= 0) ||
      (statusFilter === "in_stock" && item.current_stock > item.minimum_stock) ||
      (statusFilter === "inactive" && !item.is_active);

    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock <= 0) return { status: 'out_of_stock', label: 'نفد المخزون', variant: 'destructive' as const };
    if (currentStock <= minStock) return { status: 'low_stock', label: 'مخزون منخفض', variant: 'secondary' as const };
    return { status: 'in_stock', label: 'متوفر', variant: 'default' as const };
  };

  const getStockIcon = (currentStock: number, minStock: number) => {
    if (currentStock <= 0) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (currentStock <= minStock) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل عناصر المخزون...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              عناصر المخزون ({filteredItems.length})
            </CardTitle>
            <CardDescription>
              إدارة وعرض جميع عناصر المخزون
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة عنصر
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في العناصر (الاسم، SKU، رقم القطعة)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  حالة المخزون
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  جميع العناصر
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in_stock")}>
                  متوفر
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("low_stock")}>
                  مخزون منخفض
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("out_of_stock")}>
                  نفد المخزون
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  غير نشط
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد عناصر تطابق معايير البحث</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const stockStatus = getStockStatus(item.current_stock, item.minimum_stock);
              const stockIcon = getStockIcon(item.current_stock, item.minimum_stock);
              
              return (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {stockIcon}
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                        {!item.is_active && (
                          <Badge variant="outline">غير نشط</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {item.description && (
                          <p>الوصف: {item.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.part_number && <span>رقم القطعة: {item.part_number}</span>}
                          {item.barcode && <span>الباركود: {item.barcode}</span>}
                          {item.location && <span>الموقع: {item.location}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">المخزون الحالي:</span>
                      <div className="font-medium">{item.current_stock} {item.unit_of_measure}</div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">الحد الأدنى:</span>
                      <div className="font-medium">{item.minimum_stock} {item.unit_of_measure}</div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">تكلفة الوحدة:</span>
                      <div className="font-medium">{item.unit_cost.toFixed(2)} ر.س</div>
                    </div>
                    
                    {item.selling_price && (
                      <div>
                        <span className="text-muted-foreground">سعر البيع:</span>
                        <div className="font-medium">{item.selling_price.toFixed(2)} ر.س</div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-muted-foreground">القيمة الإجمالية:</span>
                      <div className="font-medium">{(item.current_stock * item.unit_cost).toFixed(2)} ر.س</div>
                    </div>
                  </div>

                  {item.expiry_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                      <span className={
                        new Date(item.expiry_date) < new Date() 
                          ? "text-destructive font-medium"
                          : new Date(item.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? "text-amber-600 font-medium"
                          : "text-foreground"
                      }>
                        {new Date(item.expiry_date).toLocaleDateString('ar-SA')}
                      </span>
                      {new Date(item.expiry_date) < new Date() && (
                        <Badge variant="destructive" className="text-xs">منتهي الصلاحية</Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
