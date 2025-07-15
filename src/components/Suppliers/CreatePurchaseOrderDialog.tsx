import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePurchaseOrderDialog = ({ open, onOpenChange }: CreatePurchaseOrderDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء أمر شراء جديد</DialogTitle>
          <DialogDescription>
            إنشاء أمر شراء جديد من أحد الموردين
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-8">
          <p className="text-muted-foreground">قريباً - نموذج أمر الشراء</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};