import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory, InventoryItem } from "@/hooks/useInventory";

type InventoryHook = ReturnType<typeof useInventory>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryHook;
  item: InventoryItem | null;
}

const EditInventoryItemDialog = ({ open, onOpenChange, inventory, item }: Props) => {
  const { categories, updateItem } = inventory;

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("piece");
  const [unitCost, setUnitCost] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number | undefined>(undefined);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minimumStock, setMinimumStock] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setSku("");
    setCategoryId("");
    setUnitOfMeasure("piece");
    setUnitCost(0);
    setSellingPrice(undefined);
    setCurrentStock(0);
    setMinimumStock(0);
    setLocation("");
    setDescription("");
  };

  // تحديث القيم عند تغيير العنصر
  useEffect(() => {
    if (item) {
      setName(item.name);
      setSku(item.sku || "");
      setCategoryId(item.category_id || "");
      setUnitOfMeasure(item.unit_of_measure);
      setUnitCost(item.unit_cost);
      setSellingPrice(item.selling_price || undefined);
      setCurrentStock(item.current_stock);
      setMinimumStock(item.minimum_stock);
      setLocation(item.location || "");
      setDescription(item.description || "");
    } else {
      reset();
    }
  }, [item]);

  const onSubmit = async () => {
    if (!item) return;
    
    await updateItem(item.id, {
      name,
      sku: sku || undefined,
      category_id: categoryId || undefined,
      unit_of_measure: unitOfMeasure,
      unit_cost: unitCost,
      selling_price: sellingPrice,
      current_stock: currentStock,
      minimum_stock: minimumStock,
      location: location || undefined,
      description: description || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>تعديل عنصر المخزون</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم العنصر</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="فلتر زيت" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">رمز العنصر (SKU)</Label>
              <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="FLT-001" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>وحدة القياس</Label>
              <Select value={unitOfMeasure} onValueChange={setUnitOfMeasure}>
                <SelectTrigger>
                  <SelectValue placeholder="الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">قطعة</SelectItem>
                  <SelectItem value="liter">لتر</SelectItem>
                  <SelectItem value="box">علبة</SelectItem>
                  <SelectItem value="set">طقم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">الموقع</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="A-1-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitCost">تكلفة الشراء</Label>
              <Input id="unitCost" type="number" value={unitCost} onChange={(e) => setUnitCost(parseFloat(e.target.value || "0"))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">سعر البيع</Label>
              <Input id="sellingPrice" type="number" value={sellingPrice ?? ""} onChange={(e) => setSellingPrice(e.target.value ? parseFloat(e.target.value) : undefined)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentStock">الرصيد الحالي</Label>
              <Input id="currentStock" type="number" value={currentStock} onChange={(e) => setCurrentStock(parseFloat(e.target.value || "0"))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumStock">الحد الأدنى</Label>
              <Input id="minimumStock" type="number" value={minimumStock} onChange={(e) => setMinimumStock(parseFloat(e.target.value || "0"))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف العنصر (اختياري)" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>إلغاء</Button>
            <Button onClick={onSubmit}>حفظ التعديلات</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryItemDialog;