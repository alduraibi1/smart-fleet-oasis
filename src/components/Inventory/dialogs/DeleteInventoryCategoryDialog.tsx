import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useInventory, InventoryCategory } from "@/hooks/useInventory";
import { useToast } from "@/hooks/use-toast";

type InventoryHook = ReturnType<typeof useInventory>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryHook;
  category: InventoryCategory | null;
}

const DeleteInventoryCategoryDialog = ({ open, onOpenChange, inventory, category }: Props) => {
  const { deleteCategory, items } = inventory;
  const { toast } = useToast();

  // عدد العناصر المرتبطة بهذه الفئة
  const itemsCount = category ? items.filter(item => item.category_id === category.id).length : 0;

  const onConfirmDelete = async () => {
    if (!category) return;
    
    try {
      await deleteCategory(category.id);
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف الفئة "${category.name}" من المخزون`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الفئة. حاول مرة أخرى.",
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
              <DialogTitle>حذف فئة المخزون</DialogTitle>
              <DialogDescription>
                هذا الإجراء لا يمكن التراجع عنه
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف الفئة التالية؟
          </p>
          {category && (
            <div className="mt-3 p-4 bg-muted rounded-lg">
              <div className="font-medium">{category.name}</div>
              {category.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </div>
              )}
              <div className="text-sm text-muted-foreground mt-2">
                عدد العناصر المرتبطة: {itemsCount}
              </div>
            </div>
          )}
          
          {itemsCount > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ تحذير: هناك {itemsCount} عنصر مرتبط بهذه الفئة. سيتم إلغاء ربطها بالفئة عند الحذف.
              </p>
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

export default DeleteInventoryCategoryDialog;