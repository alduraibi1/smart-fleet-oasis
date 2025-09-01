import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useInventory, InventoryItem } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";

type InventoryHook = ReturnType<typeof useInventory>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryHook;
  item: InventoryItem | null;
}

const DeleteInventoryItemDialog = ({ open, onOpenChange, inventory, item }: Props) => {
  const { deleteItem } = inventory;
  const { toast } = useToast();

  const onConfirmDelete = async () => {
    if (!item) return;
    
    try {
      await deleteItem(item.id);
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف العنصر "${item.name}" من المخزون`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف العنصر. حاول مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>حذف عنصر المخزون</DialogTitle>
              <DialogDescription>
                هذا الإجراء لا يمكن التراجع عنه
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف العنصر التالي؟
          </p>
          {item && (
            <div className="mt-3 p-4 bg-muted rounded-lg">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">
                الكود: {item.sku || "غير محدد"}
              </div>
              <div className="text-sm text-muted-foreground">
                الرصيد الحالي: {item.current_stock} {item.unit_of_measure}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            حذف نهائياً
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteInventoryItemDialog;