
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types";
import { AlertTriangle, Trash2, User, X } from "lucide-react";
import { useState } from "react";

interface DeleteCustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (customerId: string) => void;
}

export const DeleteCustomerDialog = ({ 
  customer, 
  open, 
  onOpenChange, 
  onDelete 
}: DeleteCustomerDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!customer) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(customer.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            حذف العميل
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
                {customer.email && (
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                )}
              </div>
              <div className="space-y-1">
                {customer.blacklisted && (
                  <Badge variant="destructive" className="text-xs">
                    قائمة سوداء
                  </Badge>
                )}
                <Badge variant={customer.is_active ? "default" : "secondary"} className="text-xs">
                  {customer.is_active ? "نشط" : "غير نشط"}
                </Badge>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-medium">تحذير: هذا الإجراء لا يمكن التراجع عنه!</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>سيتم حذف جميع بيانات العميل نهائياً</li>
                <li>ستفقد سجل العقود والمعاملات المرتبطة</li>
                <li>لن تتمكن من استرداد هذه البيانات</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>بديل مقترح:</strong> يمكنك إلغاء تفعيل العميل بدلاً من حذفه للاحتفاظ بالبيانات التاريخية.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleDelete}
              variant="destructive"
              className="flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جاري الحذف...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  تأكيد الحذف
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              <X className="h-4 w-4 ml-2" />
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
