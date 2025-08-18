
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Building2, 
  Phone, 
  Mail, 
  Star,
  Plus
} from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierQuickActions } from "./SupplierQuickActions";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";

export const SuppliersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const { suppliers } = useSuppliers();

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && supplier.is_active) ||
                         (statusFilter === "inactive" && !supplier.is_active);
    const matchesRating = ratingFilter === "all" ||
                         (ratingFilter === "excellent" && supplier.rating >= 4) ||
                         (ratingFilter === "good" && supplier.rating >= 3 && supplier.rating < 4) ||
                         (ratingFilter === "poor" && supplier.rating < 3);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-100 text-green-800 animate-fade-in">نشط</Badge> :
      <Badge variant="secondary" className="animate-fade-in">غير نشط</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 transition-colors ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const handleCreateOrder = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowCreateOrder(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRatingFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || ratingFilter !== "all";

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في الموردين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="التقييم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التقييمات</SelectItem>
              <SelectItem value="excellent">ممتاز (4+)</SelectItem>
              <SelectItem value="good">جيد (3-4)</SelectItem>
              <SelectItem value="poor">ضعيف (أقل من 3)</SelectItem>
            </SelectContent>
          </Select>
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
            عرض {filteredSuppliers.length} من أصل {suppliers.length} مورد
          </span>
          {hasActiveFilters && (
            <Badge variant="outline" className="animate-fade-in">
              تم تطبيق فلاتر
            </Badge>
          )}
        </div>

        {/* Suppliers Cards */}
        <div className="grid gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-lg">{supplier.name}</h3>
                        {supplier.contact_person && (
                          <p className="text-sm text-muted-foreground">
                            جهة الاتصال: {supplier.contact_person}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(supplier.is_active)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {getRatingStars(supplier.rating)}
                      </div>
                    </div>

                    {supplier.address && (
                      <p className="text-sm text-muted-foreground mb-3">
                        العنوان: {supplier.address}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {supplier.payment_terms && (
                        <Badge variant="outline" className="text-xs">
                          شروط الدفع: {supplier.payment_terms}
                        </Badge>
                      )}
                      {supplier.tax_number && (
                        <Badge variant="outline" className="text-xs">
                          الرقم الضريبي: {supplier.tax_number}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <SupplierQuickActions
                    supplier={supplier}
                    onCreateOrder={handleCreateOrder}
                    onEdit={(supplier) => {
                      // TODO: Implement edit dialog
                      console.log("Edit supplier:", supplier);
                    }}
                    onView={(supplier) => {
                      // TODO: Implement view dialog
                      console.log("View supplier:", supplier);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <Card className="animate-fade-in">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد موردين</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "لم يتم العثور على موردين مطابقين للفلاتر المحددة"
                  : "لا توجد موردين في النظام حالياً"
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

      {/* Create Purchase Order Dialog */}
      <CreatePurchaseOrderDialog
        open={showCreateOrder}
        onOpenChange={(open) => {
          setShowCreateOrder(open);
          if (!open) setSelectedSupplier(null);
        }}
      />
    </>
  );
};
