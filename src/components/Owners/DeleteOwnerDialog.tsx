import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Owner } from "@/hooks/useOwners";

interface DeleteOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: Owner | null;
  onDelete: (id: string) => void;
}

export const DeleteOwnerDialog = ({ open, onOpenChange, owner, onDelete }: DeleteOwnerDialogProps) => {
  const handleDelete = () => {
    if (owner) {
      onDelete(owner.id);
      onOpenChange(false);
    }
  };

  const hasVehicles = owner && owner.vehicle_count && owner.vehicle_count > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف المالك</AlertDialogTitle>
          <AlertDialogDescription>
            {hasVehicles ? (
              <>
                لا يمكن حذف المالك <strong>{owner?.name}</strong> لأن لديه{" "}
                <strong>{owner?.vehicle_count}</strong> مركبة مرتبطة.
                <br />
                يرجى نقل هذه المركبات إلى مالك آخر أو حذفها أولاً.
              </>
            ) : (
              <>
                هل أنت متأكد من حذف المالك <strong>{owner?.name}</strong>؟
                <br />
                هذا الإجراء لا يمكن التراجع عنه.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          {!hasVehicles && (
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};