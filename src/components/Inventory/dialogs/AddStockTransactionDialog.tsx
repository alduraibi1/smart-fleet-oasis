
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory } from "@/hooks/useInventory";

type InventoryHook = ReturnType<typeof useInventory>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryHook;
}

const AddStockTransactionDialog = ({ open, onOpenChange, inventory }: Props) => {
  const { items, addStockTransaction } = inventory;

  const [itemId, setItemId] = useState<string>("");
  const [type, setType] = useState<"in" | "out" | "adjustment">("in");
  const [quantity, setQuantity] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<string>("");

  const selectedItem = useMemo(() => items.find(i => i.id === itemId), [items, itemId]);

  const onSubmit = async () => {
    const total_cost = unitCost && quantity ? unitCost * quantity : undefined;
    console.log("Adding stock transaction", { itemId, type, quantity, unitCost, total_cost });

    await addStockTransaction({
      item_id: itemId,
      transaction_type: type,
      quantity,
      unit_cost: unitCost,
      total_cost,
      notes: notes || undefined,
      transaction_date: date || undefined,
    });

    // reset
    setItemId("");
    setType("in");
    setQuantity(0);
    setUnitCost(undefined);
    setNotes("");
    setDate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>إضافة حركة مخزون</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>العنصر</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العنصر" />
              </SelectTrigger>
              <SelectContent>
                {items.map(i => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}{i.sku ? ` (${i.sku})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedItem && (
              <div className="text-xs text-muted-foreground mt-1">
                الرصيد الحالي: {selectedItem.current_stock} | التكلفة: {selectedItem.unit_cost}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع الحركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">إدخال</SelectItem>
                  <SelectItem value="out">إخراج</SelectItem>
                  <SelectItem value="adjustment">تسوية (تعيين الرصيد)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">الكمية</Label>
              <Input id="qty" type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value || "0"))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ucost">تكلفة الوحدة (اختياري)</Label>
              <Input id="ucost" type="number" value={unitCost ?? ""} onChange={(e) => setUnitCost(e.target.value ? parseFloat(e.target.value) : undefined)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ (اختياري)</Label>
              <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات الحركة (اختياري)" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button disabled={!itemId || quantity === 0} onClick={onSubmit}>حفظ</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStockTransactionDialog;
