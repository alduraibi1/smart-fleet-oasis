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

interface PartsTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData | ((prev: MaintenanceFormData) => MaintenanceFormData)) => void;
  onCalculateCosts: () => void;
}

// Mock inventory data
const mockPartsInventory = [
  { id: 'p1', name: 'فلتر الهواء', brand: 'Mann Filter', stock: 25, unitCost: 45, sellingPrice: 65, category: 'filter', barcode: '1234567890' },
  { id: 'p2', name: 'فلتر الزيت', brand: 'Bosch', stock: 30, unitCost: 35, sellingPrice: 50, category: 'filter', barcode: '1234567891' },
  { id: 'p3', name: 'أقراص الفرامل الأمامية', brand: 'Brembo', stock: 8, unitCost: 180, sellingPrice: 250, category: 'brake', barcode: '1234567892' },
  { id: 'p4', name: 'أقراص الفرامل الخلفية', brand: 'Brembo', stock: 12, unitCost: 150, sellingPrice: 210, category: 'brake', barcode: '1234567893' },
  { id: 'p5', name: 'بطارية 12V 70Ah', brand: 'ACDelco', stock: 5, unitCost: 320, sellingPrice: 450, category: 'battery', barcode: '1234567894' },
  { id: 'p6', name: 'شمعات الإشعال', brand: 'NGK', stock: 40, unitCost: 25, sellingPrice: 40, category: 'spark_plug', barcode: '1234567895' },
  { id: 'p7', name: 'حزام التوقيت', brand: 'Gates', stock: 3, unitCost: 120, sellingPrice: 180, category: 'belt', barcode: '1234567896' },
  { id: 'p8', name: 'إطار 195/65R15', brand: 'Bridgestone', stock: 16, unitCost: 280, sellingPrice: 380, category: 'tire', barcode: '1234567897' },
];

export function PartsTab({ formData, setFormData, onCalculateCosts }: PartsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const filteredParts = mockPartsInventory.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.barcode.includes(searchTerm)
  );

  const addPart = () => {
    const selectedPart = mockPartsInventory.find(p => p.id === selectedPartId);
    if (!selectedPart || quantity <= 0) return;

    if (quantity > selectedPart.stock) {
      alert(`المخزون غير كافي. المتوفر: ${selectedPart.stock}`);
      return;
    }

    const existingPartIndex = formData.partsUsed.findIndex(p => p.partId === selectedPartId);
    
    if (existingPartIndex >= 0) {
      // Update existing part
      const updatedParts = [...formData.partsUsed];
      updatedParts[existingPartIndex] = {
        ...updatedParts[existingPartIndex],
        quantity: updatedParts[existingPartIndex].quantity + quantity,
        totalCost: (updatedParts[existingPartIndex].quantity + quantity) * selectedPart.sellingPrice,
        stockAfter: selectedPart.stock - (updatedParts[existingPartIndex].quantity + quantity)
      };
      
      setFormData(prev => ({ ...prev, partsUsed: updatedParts }));
    } else {
      // Add new part
      const newPart = {
        partId: selectedPart.id,
        partName: selectedPart.name,
        quantity,
        unitCost: selectedPart.sellingPrice,
        totalCost: quantity * selectedPart.sellingPrice,
        stockBefore: selectedPart.stock,
        stockAfter: selectedPart.stock - quantity
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
    const originalPart = mockPartsInventory.find(p => p.id === part.partId);
    
    if (!originalPart) return;

    if (newQuantity > originalPart.stock) {
      alert(`المخزون غير كافي. المتوفر: ${originalPart.stock}`);
      return;
    }

    updatedParts[index] = {
      ...part,
      quantity: newQuantity,
      totalCost: newQuantity * part.unitCost,
      stockAfter: originalPart.stock - newQuantity
    };

    setFormData(prev => ({ ...prev, partsUsed: updatedParts }));
    setTimeout(onCalculateCosts, 0);
  };

  const getStockStatus = (stock: number, minStock: number = 5) => {
    if (stock === 0) return { label: 'نفد المخزون', variant: 'destructive' as const };
    if (stock <= minStock) return { label: 'مخزون منخفض', variant: 'secondary' as const };
    return { label: 'متوفر', variant: 'default' as const };
  };

  const selectedPart = mockPartsInventory.find(p => p.id === selectedPartId);

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
                      const status = getStockStatus(part.stock);
                      return (
                        <SelectItem key={part.id} value={part.id} disabled={part.stock === 0}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{part.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {part.brand} - {part.sellingPrice} ر.س
                              </div>
                            </div>
                            <Badge variant={status.variant} className="mr-2">
                              {part.stock}
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
                      <div className="font-medium">{selectedPart.stock} قطعة</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">سعر الوحدة:</span>
                      <div className="font-medium">{selectedPart.sellingPrice} ر.س</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الإجمالي:</span>
                      <div className="font-medium">{(selectedPart.sellingPrice * quantity).toFixed(2)} ر.س</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الباركود:</span>
                      <div className="font-medium font-mono">{selectedPart.barcode}</div>
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