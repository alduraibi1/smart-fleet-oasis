
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Package, Plus, Trash2, Search, AlertCircle } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface PartsTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData) => void;
  onCalculateCosts: () => void;
}

export function PartsTab({ formData, setFormData, onCalculateCosts }: PartsTabProps) {
  const { items } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // تصفية قطع الغيار حسب البحث
  const filteredParts = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.part_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addPart = () => {
    if (!selectedPartId || quantity <= 0) return;
    
    const selectedPart = items.find(item => item.id === selectedPartId);
    if (!selectedPart) return;

    // التحقق من توفر الكمية في المخزون
    if (selectedPart.current_stock < quantity) {
      alert(`الكمية المتاحة في المخزون: ${selectedPart.current_stock}`);
      return;
    }

    const newPart = {
      partId: selectedPart.id,
      partName: selectedPart.name,
      quantity: quantity,
      unitCost: selectedPart.unit_cost,
      totalCost: quantity * selectedPart.unit_cost,
      stockBefore: selectedPart.current_stock,
      stockAfter: selectedPart.current_stock - quantity
    };

    const updatedParts = [...formData.partsUsed, newPart];
    setFormData({ ...formData, partsUsed: updatedParts });
    
    // إعادة تعيين الحقول
    setSelectedPartId("");
    setQuantity(1);
    setSearchTerm("");
    
    // حساب التكاليف
    setTimeout(onCalculateCosts, 100);
  };

  const removePart = (index: number) => {
    const updatedParts = formData.partsUsed.filter((_, i) => i !== index);
    setFormData({ ...formData, partsUsed: updatedParts });
    onCalculateCosts();
  };

  const updatePartQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    const updatedParts = [...formData.partsUsed];
    const part = updatedParts[index];
    
    // التحقق من توفر الكمية الجديدة
    const originalItem = items.find(item => item.id === part.partId);
    if (originalItem && originalItem.current_stock < newQuantity) {
      alert(`الكمية المتاحة في المخزون: ${originalItem.current_stock}`);
      return;
    }
    
    part.quantity = newQuantity;
    part.totalCost = newQuantity * part.unitCost;
    part.stockAfter = part.stockBefore - newQuantity;
    
    setFormData({ ...formData, partsUsed: updatedParts });
    onCalculateCosts();
  };

  const getTotalPartsValue = () => {
    return formData.partsUsed.reduce((sum, part) => sum + part.totalCost, 0);
  };

  const getStockStatusColor = (currentStock: number, minStock: number) => {
    if (currentStock <= 0) return 'destructive';
    if (currentStock <= minStock) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-4">
      {/* إضافة قطعة غيار جديدة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة قطعة غيار
          </CardTitle>
          <CardDescription>
            ابحث واختر قطع الغيار المطلوبة للصيانة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن قطعة غيار (الاسم، رقم القطعة، SKU)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="part">قطعة الغيار</Label>
              <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر قطعة الغيار" />
                </SelectTrigger>
                <SelectContent>
                  {filteredParts.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{part.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {part.part_number && `رقم القطعة: ${part.part_number}`}
                            {part.sku && ` | SKU: ${part.sku}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStockStatusColor(part.current_stock, part.minimum_stock)}>
                            {part.current_stock}
                          </Badge>
                          <span className="text-xs">{part.unit_cost} ر.س</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">الكمية</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="الكمية"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={addPart} disabled={!selectedPartId} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                إضافة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة قطع الغيار المضافة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            قطع الغيار المستخدمة ({formData.partsUsed.length})
          </CardTitle>
          <CardDescription>
            إجمالي قيمة قطع الغيار: {getTotalPartsValue().toFixed(2)} ر.س
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.partsUsed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لم يتم إضافة أي قطع غيار بعد</p>
              <p className="text-sm">استخدم النموذج أعلاه لإضافة قطع الغيار</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>قطعة الغيار</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.partsUsed.map((part, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{part.partName}</div>
                          <div className="text-xs text-muted-foreground">ID: {part.partId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={part.quantity}
                          onChange={(e) => updatePartQuantity(index, parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{part.unitCost.toFixed(2)} ر.س</TableCell>
                      <TableCell className="font-medium">{part.totalCost.toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>قبل: {part.stockBefore}</div>
                          <div className="flex items-center gap-1">
                            بعد: {part.stockAfter}
                            {part.stockAfter <= 0 && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePart(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* تحذيرات المخزون */}
      {formData.partsUsed.some(part => part.stockAfter <= 0) && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">تحذير: نقص في المخزون</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              بعض قطع الغيار المحددة ستؤدي إلى نفاد المخزون. تأكد من توفر البدائل أو تحديث المخزون.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
