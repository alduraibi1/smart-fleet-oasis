import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInventory, InventoryCategory } from "@/hooks/useInventory";

type InventoryHook = ReturnType<typeof useInventory>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryHook;
  category: InventoryCategory | null;
}

const EditInventoryCategoryDialog = ({ open, onOpenChange, inventory, category }: Props) => {
  const { updateCategory } = inventory;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
  };

  // تحديث القيم عند تغيير الفئة
  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
    } else {
      reset();
    }
  }, [category]);

  const onSubmit = async () => {
    if (!category) return;
    
    await updateCategory(category.id, {
      name,
      description: description || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل فئة المخزون</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الفئة</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="قطع غيار" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="وصف الفئة" 
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
              إلغاء
            </Button>
            <Button onClick={onSubmit}>
              حفظ التعديلات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryCategoryDialog;