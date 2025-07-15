import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSupplierDialog = ({ open, onOpenChange }: AddSupplierDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مورد جديد</DialogTitle>
          <DialogDescription>
            إضافة مورد جديد إلى النظام
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-8">
          <p className="text-muted-foreground">قريباً - نموذج إضافة مورد</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};