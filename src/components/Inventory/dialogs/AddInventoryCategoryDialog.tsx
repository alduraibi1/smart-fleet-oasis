
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInventory } from "@/hooks/useInventory";

type InventoryHook = ReturnType<typeof useInventory>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryHook;
}

const AddInventoryCategoryDialog = ({ open, onOpenChange, inventory }: Props) => {
  const { addCategory } = inventory;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
  };

  const onSubmit = async () => {
    await addCategory({ name, description: description || undefined });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة فئة جديدة</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الفئة</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: قطع غيار" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">الوصف (اختياري)</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر للفئة" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>إلغاء</Button>
            <Button disabled={!name.trim()} onClick={onSubmit}>حفظ</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryCategoryDialog;
