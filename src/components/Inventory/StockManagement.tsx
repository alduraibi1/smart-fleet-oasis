import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  QrCode
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const stockItems = [
  {
    id: 1,
    name: "فلتر زيت موتور - تويوتا",
    sku: "TOY-OF-001",
    category: "قطع غيار",
    quantity: 45,
    minStock: 20,
    maxStock: 100,
    cost: 25.50,
    price: 35.00,
    location: "A-1-5",
    supplier: "شركة قطع غيار الخليج",
    status: "available"
  },
  {
    id: 2,
    name: "زيت محرك 5W-30",
    sku: "MOB-5W30-4L",
    category: "زيوت ومواد",
    quantity: 12,
    minStock: 25,
    maxStock: 80,
    cost: 45.00,
    price: 65.00,
    location: "B-2-3",
    supplier: "موبيل الخليج",
    status: "low"
  },
  {
    id: 3,
    name: "إطار 225/60 R16",
    sku: "TIRE-225-60-16",
    category: "إطارات",
    quantity: 8,
    minStock: 15,
    maxStock: 50,
    cost: 120.00,
    price: 180.00,
    location: "C-1-1",
    supplier: "مؤسسة الإطارات الحديثة",
    status: "low"
  }
];

const StockManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredItems, setFilteredItems] = useState(stockItems);

  const getStatusBadge = (status: string, quantity: number, minStock: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">نفد المخزون</Badge>;
    } else if (quantity <= minStock) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">مخزون منخفض</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-100 text-green-800">متوفر</Badge>;
    }
  };

  const getStockTrend = () => {
    const random = Math.random();
    if (random > 0.6) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (random < 0.4) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="قطع غيار">قطع غيار</SelectItem>
              <SelectItem value="زيوت ومواد">زيوت ومواد</SelectItem>
              <SelectItem value="إطارات">إطارات</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة منتج جديد للمخزون</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج</Label>
                  <Input id="name" placeholder="أدخل اسم المنتج" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                  <Input id="sku" placeholder="TOY-OF-001" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة</Label>
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
                  <Label htmlFor="supplier">المورد</Label>
                  <Input id="supplier" placeholder="اسم المورد" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">الكمية الحالية</Label>
                  <Input id="quantity" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">الحد الأدنى</Label>
                  <Input id="minStock" type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStock">الحد الأقصى</Label>
                  <Input id="maxStock" type="number" placeholder="100" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">تكلفة الشراء</Label>
                  <Input id="cost" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">سعر البيع</Label>
                  <Input id="price" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">موقع التخزين</Label>
                  <Input id="location" placeholder="A-1-5" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea id="description" placeholder="وصف المنتج (اختياري)" />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">إلغاء</Button>
                <Button>حفظ المنتج</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            إدارة المخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.sku}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.quantity}</span>
                      {getStockTrend()}
                      {item.quantity <= item.minStock && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      الحد الأدنى: {item.minStock}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status, item.quantity, item.minStock)}
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{item.location}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${item.price}</div>
                      <div className="text-xs text-muted-foreground">التكلفة: ${item.cost}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockManagement;