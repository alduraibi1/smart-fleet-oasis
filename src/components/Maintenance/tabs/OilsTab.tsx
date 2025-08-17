
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Droplets, Plus, Trash2, Search, AlertCircle } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface OilsTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData) => void;
  onCalculateCosts: () => void;
}

export function OilsTab({ formData, setFormData, onCalculateCosts }: OilsTabProps) {
  const { items } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOilId, setSelectedOilId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // تصفية الزيوت حسب البحث (افتراض أن الزيوت لها فئة معينة أو كلمة في الاسم)
  const filteredOils = items.filter(item => 
    (item.name.toLowerCase().includes('زيت') || 
     item.name.toLowerCase().includes('oil') ||
     item.description?.toLowerCase().includes('زيت') ||
     item.description?.toLowerCase().includes('oil')) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.part_number?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addOil = () => {
    if (!selectedOilId || quantity <= 0) return;
    
    const selectedOil = items.find(item => item.id === selectedOilId);
    if (!selectedOil) return;

    // التحقق من توفر الكمية في المخزون
    if (selectedOil.current_stock < quantity) {
      alert(`الكمية المتاحة في المخزون: ${selectedOil.current_stock}`);
      return;
    }

    const newOil = {
      oilId: selectedOil.id,
      oilName: selectedOil.name,
      viscosity: selectedOil.description || "غير محدد",
      quantity: quantity,
      unitCost: selectedOil.unit_cost,
      totalCost: quantity * selectedOil.unit_cost,
      stockBefore: selectedOil.current_stock,
      stockAfter: selectedOil.current_stock - quantity
    };

    const updatedOils = [...formData.oilsUsed, newOil];
    setFormData({ ...formData, oilsUsed: updatedOils });
    
    // إعادة تعيين الحقول
    setSelectedOilId("");
    setQuantity(1);
    setSearchTerm("");
    
    // حساب التكاليف
    setTimeout(onCalculateCosts, 100);
  };

  const removeOil = (index: number) => {
    const updatedOils = formData.oilsUsed.filter((_, i) => i !== index);
    setFormData({ ...formData, oilsUsed: updatedOils });
    onCalculateCosts();
  };

  const updateOilQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    const updatedOils = [...formData.oilsUsed];
    const oil = updatedOils[index];
    
    // التحقق من توفر الكمية الجديدة
    const originalItem = items.find(item => item.id === oil.oilId);
    if (originalItem && originalItem.current_stock < newQuantity) {
      alert(`الكمية المتاحة في المخزون: ${originalItem.current_stock}`);
      return;
    }
    
    oil.quantity = newQuantity;
    oil.totalCost = newQuantity * oil.unitCost;
    oil.stockAfter = oil.stockBefore - newQuantity;
    
    setFormData({ ...formData, oilsUsed: updatedOils });
    onCalculateCosts();
  };

  const getTotalOilsValue = () => {
    return formData.oilsUsed.reduce((sum, oil) => sum + oil.totalCost, 0);
  };

  const getStockStatusColor = (currentStock: number, minStock: number) => {
    if (currentStock <= 0) return 'destructive';
    if (currentStock <= minStock) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-4">
      {/* إضافة زيت جديد */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            إضافة زيت
          </CardTitle>
          <CardDescription>
            ابحث واختر الزيوت المطلوبة للصيانة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن زيت (الاسم، رقم القطعة، SKU)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="oil">نوع الزيت</Label>
              <Select value={selectedOilId} onValueChange={setSelectedOilId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الزيت" />
                </SelectTrigger>
                <SelectContent>
                  {filteredOils.map((oil) => (
                    <SelectItem key={oil.id} value={oil.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{oil.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {oil.description && `الوصف: ${oil.description}`}
                            {oil.sku && ` | SKU: ${oil.sku}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStockStatusColor(oil.current_stock, oil.minimum_stock)}>
                            {oil.current_stock}
                          </Badge>
                          <span className="text-xs">{oil.unit_cost} ر.س</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">الكمية (لتر)</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                placeholder="الكمية"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={addOil} disabled={!selectedOilId} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                إضافة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الزيوت المضافة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            الزيوت المستخدمة ({formData.oilsUsed.length})
          </CardTitle>
          <CardDescription>
            إجمالي قيمة الزيوت: {getTotalOilsValue().toFixed(2)} ر.س
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.oilsUsed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لم يتم إضافة أي زيوت بعد</p>
              <p className="text-sm">استخدم النموذج أعلاه لإضافة الزيوت</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نوع الزيت</TableHead>
                    <TableHead>اللزوجة/الوصف</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.oilsUsed.map((oil, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{oil.oilName}</div>
                          <div className="text-xs text-muted-foreground">ID: {oil.oilId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{oil.viscosity}</span>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          step="0.1"
                          value={oil.quantity}
                          onChange={(e) => updateOilQuantity(index, parseFloat(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{oil.unitCost.toFixed(2)} ر.س</TableCell>
                      <TableCell className="font-medium">{oil.totalCost.toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>قبل: {oil.stockBefore}</div>
                          <div className="flex items-center gap-1">
                            بعد: {oil.stockAfter}
                            {oil.stockAfter <= 0 && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOil(index)}
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
      {formData.oilsUsed.some(oil => oil.stockAfter <= 0) && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">تحذير: نقص في مخزون الزيوت</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              بعض الزيوت المحددة ستؤدي إلى نفاد المخزون. تأكد من توفر البدائل أو تحديث المخزون.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
