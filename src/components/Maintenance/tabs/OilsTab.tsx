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
  Droplets, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  AlertTriangle, 
  Calendar,
  Thermometer
} from "lucide-react";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";
import { useMaintenanceInventory } from "@/hooks/useMaintenanceInventory";
import { translateUnit } from "@/utils/unitTranslations";

interface OilsTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData | ((prev: MaintenanceFormData) => MaintenanceFormData)) => void;
  onCalculateCosts: () => void;
}

export function OilsTab({ formData, setFormData, onCalculateCosts }: OilsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOilId, setSelectedOilId] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const { getOilsInventory, searchOils, getItemById } = useMaintenanceInventory();
  
  const filteredOils = searchOils(searchTerm);

  const addOil = () => {
    const selectedOil = getItemById(selectedOilId);
    if (!selectedOil || quantity <= 0) return;

    if (quantity > selectedOil.current_stock) {
      alert(`المخزون غير كافي. المتوفر: ${selectedOil.current_stock} ${translateUnit(selectedOil.unit_of_measure)}`);
      return;
    }

    const existingOilIndex = formData.oilsUsed.findIndex(o => o.oilId === selectedOilId);
    
    if (existingOilIndex >= 0) {
      // Update existing oil
      const updatedOils = [...formData.oilsUsed];
      const newQuantity = updatedOils[existingOilIndex].quantity + quantity;
      updatedOils[existingOilIndex] = {
        ...updatedOils[existingOilIndex],
        quantity: newQuantity,
        totalCost: newQuantity * (selectedOil.selling_price || selectedOil.unit_cost),
        stockAfter: selectedOil.current_stock - newQuantity
      };
      
      setFormData(prev => ({ ...prev, oilsUsed: updatedOils }));
    } else {
      // Add new oil
      const unitPrice = selectedOil.selling_price || selectedOil.unit_cost;
      const newOil = {
        oilId: selectedOil.id,
        oilName: selectedOil.name,
        viscosity: selectedOil.description || 'غير محدد',
        quantity,
        unitCost: unitPrice,
        totalCost: quantity * unitPrice,
        stockBefore: selectedOil.current_stock,
        stockAfter: selectedOil.current_stock - quantity
      };
      
      setFormData(prev => ({ ...prev, oilsUsed: [...prev.oilsUsed, newOil] }));
    }

    // Reset form
    setSelectedOilId("");
    setQuantity(1);
    setTimeout(onCalculateCosts, 0);
  };

  const removeOil = (index: number) => {
    const updatedOils = formData.oilsUsed.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, oilsUsed: updatedOils }));
    setTimeout(onCalculateCosts, 0);
  };

  const updateOilQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeOil(index);
      return;
    }

    const updatedOils = [...formData.oilsUsed];
    const oil = updatedOils[index];
    const originalOil = getItemById(oil.oilId);
    
    if (!originalOil) return;

    if (newQuantity > originalOil.current_stock) {
      alert(`المخزون غير كافي. المتوفر: ${originalOil.current_stock} ${translateUnit(originalOil.unit_of_measure)}`);
      return;
    }

    updatedOils[index] = {
      ...oil,
      quantity: newQuantity,
      totalCost: newQuantity * oil.unitCost,
      stockAfter: originalOil.current_stock - newQuantity
    };

    setFormData(prev => ({ ...prev, oilsUsed: updatedOils }));
    setTimeout(onCalculateCosts, 0);
  };

  const getStockStatus = (stock: number, minStock: number = 10) => {
    if (stock === 0) return { label: 'نفد المخزون', variant: 'destructive' as const };
    if (stock <= minStock) return { label: 'مخزون منخفض', variant: 'secondary' as const };
    return { label: 'متوفر', variant: 'default' as const };
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'engine': 'محرك',
      'transmission': 'ناقل حركة',
      'brake': 'فرامل',
      'hydraulic': 'هيدروليك',
      'coolant': 'تبريد'
    };
    return types[type] || type;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'منتهي الصلاحية', variant: 'destructive' as const };
    if (daysUntilExpiry <= 90) return { status: 'ينتهي قريباً', variant: 'secondary' as const };
    return { status: 'صالح', variant: 'default' as const };
  };

  const selectedOil = getItemById(selectedOilId);

  return (
    <div className="space-y-6">
      {/* Add Oils Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            إضافة زيوت وسوائل
          </CardTitle>
          <CardDescription>
            اختر الزيوت والسوائل المستخدمة في الصيانة من المخزون
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم، الماركة، النوع، أو اللزوجة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Oil Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label>الزيت أو السائل</Label>
                <Select value={selectedOilId} onValueChange={setSelectedOilId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الزيت أو السائل" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredOils.map((oil) => {
                      const status = getStockStatus(oil.current_stock);
                      const unitPrice = oil.selling_price || oil.unit_cost;
                      return (
                        <SelectItem key={oil.id} value={oil.id} disabled={oil.current_stock === 0}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{oil.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {oil.suppliers?.name || 'غير محدد'} - {oil.inventory_categories?.name || 'زيوت'} - {unitPrice.toFixed(2)} ر.س/{translateUnit(oil.unit_of_measure)}
                              </div>
                            </div>
                            <div className="flex gap-1 mr-2">
                              <Badge variant={status.variant}>
                                {oil.current_stock} {translateUnit(oil.unit_of_measure)}
                              </Badge>
                              {oil.expiry_date && getExpiryStatus(oil.expiry_date).variant !== 'default' && (
                                <Badge variant={getExpiryStatus(oil.expiry_date).variant}>
                                  {getExpiryStatus(oil.expiry_date).status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الكمية ({selectedOil ? translateUnit(selectedOil.unit_of_measure) : 'وحدة'})</Label>
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
                    step="0.5"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
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

            {/* Selected Oil Info */}
            {selectedOil && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">المخزون المتوفر:</span>
                      <div className="font-medium">{selectedOil.current_stock} {translateUnit(selectedOil.unit_of_measure)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">سعر الوحدة:</span>
                      <div className="font-medium">{(selectedOil.selling_price || selectedOil.unit_cost).toFixed(2)} ر.س</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الإجمالي:</span>
                      <div className="font-medium">{((selectedOil.selling_price || selectedOil.unit_cost) * quantity).toFixed(2)} ر.س</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                      <div className="font-medium">{selectedOil.expiry_date || 'غير محدد'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الموقع:</span>
                      <div className="font-medium">{selectedOil.location || 'غير محدد'}</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Thermometer className="h-4 w-4" />
                      <span>الوصف: {selectedOil.description || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Droplets className="h-4 w-4" />
                      <span>الفئة: {selectedOil.inventory_categories?.name || 'زيوت'}</span>
                    </div>
                    {selectedOil.expiry_date && (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        <Badge variant={getExpiryStatus(selectedOil.expiry_date).variant}>
                          {getExpiryStatus(selectedOil.expiry_date).status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={addOil} disabled={!selectedOilId || quantity <= 0}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة إلى القائمة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Oils List */}
      {formData.oilsUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الزيوت والسوائل المحددة</CardTitle>
            <CardDescription>
              إجمالي الزيوت: {formData.oilsUsed.length} نوع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الزيت/السائل</TableHead>
                  <TableHead className="text-center">اللزوجة</TableHead>
                  <TableHead className="text-center">الكمية (لتر)</TableHead>
                  <TableHead className="text-center">سعر اللتر</TableHead>
                  <TableHead className="text-center">الإجمالي</TableHead>
                  <TableHead className="text-center">المخزون المتبقي</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.oilsUsed.map((oil, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{oil.oilName}</div>
                        <div className="text-sm text-muted-foreground">
                          كان متوفر: {oil.stockBefore} لتر
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{oil.viscosity}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOilQuantity(index, oil.quantity - 0.5)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 font-medium">{oil.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOilQuantity(index, oil.quantity + 0.5)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{oil.unitCost} ر.س</TableCell>
                    <TableCell className="text-center font-medium">{oil.totalCost.toFixed(2)} ر.س</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={oil.stockAfter <= 10 ? 'secondary' : 'default'}>
                        {oil.stockAfter}L
                        {oil.stockAfter <= 10 && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
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

            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">
                إجمالي تكلفة الزيوت والسوائل: {formData.oilsCost.toFixed(2)} ر.س
              </div>
              <div className="text-sm text-muted-foreground">
                {formData.oilsUsed.reduce((sum, oil) => sum + oil.quantity, 0)} لتر إجمالي
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {formData.oilsUsed.some(oil => oil.stockAfter <= 10) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">تنبيه: بعض الزيوت ستصل لحد المخزون المنخفض</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}