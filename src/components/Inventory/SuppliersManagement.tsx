import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Package,
  DollarSign
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const suppliers = [
  {
    id: 1,
    name: "شركة قطع غيار الخليج",
    contact: "أحمد محمد",
    phone: "+966 11 234 5678",
    email: "info@gulfparts.com",
    address: "الرياض، المملكة العربية السعودية",
    rating: 4.8,
    totalOrders: 156,
    totalValue: 245000,
    products: 89,
    status: "active",
    category: "قطع غيار",
    paymentTerms: "30 يوم",
    lastOrder: "2024-01-10"
  },
  {
    id: 2,
    name: "موبيل الخليج",
    contact: "سارة أحمد",
    phone: "+966 11 345 6789",
    email: "sales@mobilgulf.com",
    address: "جدة، المملكة العربية السعودية",
    rating: 4.6,
    totalOrders: 89,
    totalValue: 178000,
    products: 23,
    status: "active",
    category: "زيوت ومواد",
    paymentTerms: "15 يوم",
    lastOrder: "2024-01-08"
  },
  {
    id: 3,
    name: "مؤسسة الإطارات الحديثة",
    contact: "محمد العلي",
    phone: "+966 11 456 7890",
    email: "contact@moderntires.com",
    address: "الدمام، المملكة العربية السعودية",
    rating: 4.2,
    totalOrders: 67,
    totalValue: 134000,
    products: 45,
    status: "active",
    category: "إطارات",
    paymentTerms: "45 يوم",
    lastOrder: "2024-01-05"
  }
];

const SuppliersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">نشط</Badge>;
      case 'inactive':
        return <Badge variant="secondary">غير نشط</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">قيد المراجعة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في الموردين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الموردين</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة مورد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة مورد جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierName">اسم المورد</Label>
                  <Input id="supplierName" placeholder="أدخل اسم المورد" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">جهة الاتصال</Label>
                  <Input id="contactPerson" placeholder="اسم جهة الاتصال" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">الهاتف</Label>
                  <Input id="phone" placeholder="+966 11 234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input id="address" placeholder="العنوان الكامل" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">فئة المنتجات</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="قطع غيار">قطع غيار</SelectItem>
                      <SelectItem value="زيوت ومواد">زيوت ومواد</SelectItem>
                      <SelectItem value="إطارات">إطارات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">شروط الدفع</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر شروط الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 يوم</SelectItem>
                      <SelectItem value="30">30 يوم</SelectItem>
                      <SelectItem value="45">45 يوم</SelectItem>
                      <SelectItem value="cash">نقداً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea id="notes" placeholder="ملاحظات إضافية (اختياري)" />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">إلغاء</Button>
                <Button>حفظ المورد</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10">
                      {supplier.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                  </div>
                </div>
                {getStatusBadge(supplier.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{supplier.address}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">التقييم:</span>
                {renderStars(supplier.rating)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold text-primary">
                    <Package className="h-4 w-4" />
                    {supplier.totalOrders}
                  </div>
                  <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    {(supplier.totalValue / 1000).toFixed(0)}k
                  </div>
                  <p className="text-xs text-muted-foreground">القيمة الإجمالية</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الفئة:</span>
                  <Badge variant="outline" className="text-xs">{supplier.category}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">شروط الدفع:</span>
                  <span>{supplier.paymentTerms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">آخر طلب:</span>
                  <span>{supplier.lastOrder}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  عرض التفاصيل
                </Button>
                <Button size="sm" className="flex-1">
                  طلب جديد
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuppliersManagement;