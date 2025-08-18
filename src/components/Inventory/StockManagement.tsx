
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  Plus, 
  Minus, 
  Settings, 
  ArrowUpDown, 
  Search,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";

export const StockManagement = () => {
  const { items, addStockTransaction, categories } = useInventory();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // فلترة العناصر
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.part_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory && item.is_active;
  });

  const handleStockTransaction = async () => {
    if (!selectedItem || !quantity) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await addStockTransaction({
        item_id: selectedItem.id,
        transaction_type: transactionType,
        quantity: parseInt(quantity),
        unit_cost: unitCost ? parseFloat(unitCost) : undefined,
        total_cost: unitCost ? parseFloat(unitCost) * parseInt(quantity) : undefined,
        notes,
        reference_type: 'manual',
        transaction_date: new Date().toISOString()
      });

      // إعادة تعيين النموذج
      setSelectedItem(null);
      setQuantity("");
      setUnitCost("");
      setNotes("");
      setDialogOpen(false);

      toast({
        title: "تم بنجاح",
        description: "تم تحديث المخزون بنجاح"
      });
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const getStockStatus = (item: any) => {
    if (item.current_stock === 0) return { status: 'out', label: 'نفد', color: 'destructive' };
    if (item.current_stock <= item.minimum_stock) return { status: 'low', label: 'منخفض', color: 'secondary' };
    if (item.maximum_stock && item.current_stock >= item.maximum_stock) return { status: 'high', label: 'مرتفع', color: 'outline' };
    return { status: 'normal', label: 'طبيعي', color: 'default' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إدارة المخزون
          </CardTitle>
          <CardDescription>
            تتبع وإدارة مستويات المخزون مع التحديثات الفورية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* البحث والفلترة */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="البحث بالاسم، رمز SKU، أو رقم القطعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Label htmlFor="category">الفئة</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* قائمة العناصر */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>لا توجد عناصر تطابق البحث</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {item.sku && <span>رمز: {item.sku}</span>}
                            {item.part_number && <span>• رقم القطعة: {item.part_number}</span>}
                            {item.location && <span>• موقع: {item.location}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="font-medium">
                          {item.current_stock} {item.unit_of_measure}
                        </div>
                        <Badge variant={stockStatus.color as any} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                      </div>
                      
                      <Dialog open={dialogOpen && selectedItem?.id === item.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) setSelectedItem(item);
                        else setSelectedItem(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            تحديث
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تحديث مخزون: {item.name}</DialogTitle>
                            <DialogDescription>
                              المخزون الحالي: {item.current_stock} {item.unit_of_measure}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="transactionType">نوع الحركة</Label>
                              <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in">إضافة مخزون</SelectItem>
                                  <SelectItem value="out">استهلاك مخزون</SelectItem>
                                  <SelectItem value="adjustment">تعديل المخزون</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="quantity">الكمية</Label>
                              <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={transactionType === 'adjustment' ? 'الكمية الجديدة' : 'الكمية'}
                              />
                            </div>

                            {transactionType === 'in' && (
                              <div>
                                <Label htmlFor="unitCost">تكلفة الوحدة (اختياري)</Label>
                                <Input
                                  id="unitCost"
                                  type="number"
                                  step="0.01"
                                  value={unitCost}
                                  onChange={(e) => setUnitCost(e.target.value)}
                                  placeholder="0.00"
                                />
                              </div>
                            )}

                            <div>
                              <Label htmlFor="notes">ملاحظات</Label>
                              <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="سبب التحديث..."
                                rows={3}
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                              إلغاء
                            </Button>
                            <Button onClick={handleStockTransaction}>
                              تحديث المخزون
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
