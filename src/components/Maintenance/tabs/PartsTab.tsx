import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  AlertTriangle, 
  CheckCircle,
  Barcode
} from "lucide-react";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";
import { useMaintenanceInventory } from "@/hooks/useMaintenanceInventory";
import { translateUnit } from "@/utils/unitTranslations";

interface PartsTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData | ((prev: MaintenanceFormData) => MaintenanceFormData)) => void;
  onCalculateCosts: () => void;
}

export function PartsTab({ formData, setFormData, onCalculateCosts }: PartsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const { getPartsInventory, searchParts, getItemById } = useMaintenanceInventory();
  
  const filteredParts = searchParts(searchTerm);

  const addPart = () => {
    const selectedPart = getItemById(selectedPartId);
    if (!selectedPart || quantity <= 0) return;

    if (quantity > selectedPart.current_stock) {
      alert(`المخزون غير كافي. المتوفر: ${selectedPart.current_stock} ${translateUnit(selectedPart.unit_of_measure)}`);
      return;
    }

    const existingPartIndex = formData.partsUsed.findIndex(p => p.partId === selectedPartId);
    
    if (existingPartIndex >= 0) {
      // Update existing part
      const updatedParts = [...formData.partsUsed];
      const newQuantity = updatedParts[existingPartIndex].quantity + quantity;
      updatedParts[existingPartIndex] = {
        ...updatedParts[existingPartIndex],
        quantity: newQuantity,
        totalCost: newQuantity * (selectedPart.selling_price || selectedPart.unit_cost),
        stockAfter: selectedPart.current_stock - newQuantity
      };
      
      setFormData(prev => ({ ...prev, partsUsed: updatedParts }));
    } else {
      // Add new part
      const unitPrice = selectedPart.selling_price || selectedPart.unit_cost;
      const newPart = {
        partId: selectedPart.id,
        partName: selectedPart.name,
        quantity,
        unitCost: unitPrice,
        totalCost: quantity * unitPrice,
        stockBefore: selectedPart.current_stock,
        stockAfter: selectedPart.current_stock - quantity
      };
      
      setFormData(prev => ({ ...prev, partsUsed: [...prev.partsUsed, newPart] }));
    }

    // Reset form
    setSelectedPartId("");
    setQuantity(1);
    setTimeout(onCalculateCosts, 0);
  };

  const removePart = (index: number) => {
    const updatedParts = formData.partsUsed.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, partsUsed: updatedParts }));
    setTimeout(onCalculateCosts, 0);
  };

  const updatePartQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removePart(index);
      return;
    }

    const updatedParts = [...formData.partsUsed];
    const part = updatedParts[index];
    const originalPart = getItemById(part.partId);
    
    if (!originalPart) return;

    if (newQuantity > originalPart.current_stock) {
      alert(`المخزون غير كافي. المتوفر: ${originalPart.current_stock} ${translateUnit(originalPart.unit_of_measure)}`);
      return;
    }

    updatedParts[index] = {
      ...part,
      quantity: newQuantity,
      totalCost: newQuantity * part.unitCost,
      stockAfter: originalPart.current_stock - newQuantity
    };

    setFormData(prev => ({ ...prev, partsUsed: updatedParts }));
    setTimeout(onCalculateCosts, 0);
  };

  const getStockStatus = (stock: number, minStock: number = 5) => {
    if (stock === 0) return { label: 'نفد المخزون', variant: 'destructive' as const };
    if (stock <= minStock) return { label: 'مخزون منخفض', variant: 'secondary' as const };
    return { label: 'متوفر', variant: 'default' as const };
  };

  const selectedPart = getItemById(selectedPartId);

  return (
    <div className="space-y-6">
      {/* Add Parts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            إضافة قطع غيار
          </CardTitle>
          <CardDescription>
            اختر قطع الغيار المستخدمة في الصيانة من المخزون
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم، الماركة، أو الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Part Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>قطعة الغيار</Label>
                <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر قطعة الغيار" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredParts.map((part) => {
                      const status = getStockStatus(part.current_stock);
                      const unitPrice = part.selling_price || part.unit_cost;
                      return (
                        <SelectItem key={part.id} value={part.id} disabled={part.current_stock === 0}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{part.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {part.suppliers?.name || 'غير محدد'} - {unitPrice.toFixed(2)} ر.س - {part.sku || 'بدون كود'}
                              </div>
                            </div>
                            <Badge variant={status.variant} className="mr-2">
                              {part.current_stock} {translateUnit(part.unit_of_measure)}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الكمية</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Selected Part Info */}
            {selectedPart && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">المخزون المتوفر:</span>
                      <div className="font-medium">{selectedPart.current_stock} {translateUnit(selectedPart.unit_of_measure)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">سعر الوحدة:</span>
                      <div className="font-medium">{(selectedPart.selling_price || selectedPart.unit_cost).toFixed(2)} ر.س</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الإجمالي:</span>
                      <div className="font-medium">{((selectedPart.selling_price || selectedPart.unit_cost) * quantity).toFixed(2)} ر.س</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الموقع:</span>
                      <div className="font-medium font-mono">{selectedPart.location || 'غير محدد'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={addPart} disabled={!selectedPartId || quantity <= 0}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة إلى القائمة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parts List */}
      {formData.partsUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>قطع الغيار المحددة</CardTitle>
            <CardDescription>
              إجمالي قطع الغيار: {formData.partsUsed.length} قطعة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم القطعة</TableHead>
                  <TableHead className="text-center">الكمية</TableHead>
                  <TableHead className="text-center">سعر الوحدة</TableHead>
                  <TableHead className="text-center">الإجمالي</TableHead>
                  <TableHead className="text-center">المخزون المتبقي</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.partsUsed.map((part, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{part.partName}</div>
                        <div className="text-sm text-muted-foreground">
                          كان متوفر: {part.stockBefore}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePartQuantity(index, part.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 font-medium">{part.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updatePartQuantity(index, part.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{part.unitCost} ر.س</TableCell>
                    <TableCell className="text-center font-medium">{part.totalCost.toFixed(2)} ر.س</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={part.stockAfter <= 5 ? 'secondary' : 'default'}>
                        {part.stockAfter}
                        {part.stockAfter <= 5 && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
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

            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">
                إجمالي تكلفة قطع الغيار: {formData.partsCost.toFixed(2)} ر.س
              </div>
              <div className="text-sm text-muted-foreground">
                {formData.partsUsed.reduce((sum, part) => sum + part.quantity, 0)} قطعة إجمالي
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {formData.partsUsed.some(part => part.stockAfter <= 5) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">تنبيه: بعض قطع الغيار ستصل لحد المخزون المنخفض</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}