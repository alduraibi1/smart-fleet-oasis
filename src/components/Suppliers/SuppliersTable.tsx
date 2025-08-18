
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
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSuppliers } from "@/hooks/useSuppliers";

export const SuppliersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
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
      <Badge className="bg-green-100 text-green-800">نشط</Badge> :
      <Badge variant="secondary">غير نشط</Badge>;
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الموردين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
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
      </div>

      {/* Suppliers Cards */}
      <div className="grid gap-4">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id}>
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
                        <span>{supplier.email}</span>
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

                  {supplier.payment_terms && (
                    <p className="text-sm">
                      <span className="font-medium">شروط الدفع:</span> {supplier.payment_terms}
                    </p>
                  )}
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
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      حذف
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">لا توجد موردين</h3>
            <p className="text-muted-foreground">
              لم يتم العثور على موردين مطابقين للفلاتر المحددة
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
