import { useState } from 'react';
import { Vehicle } from '@/types/vehicle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteVehicleDialogProps {
  vehicle: Vehicle;
  onDelete: (id: string) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DeleteVehicleDialog = ({ vehicle, onDelete, trigger, open, onOpenChange }: DeleteVehicleDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(vehicle.id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const canDelete = vehicle.status !== 'rented';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
          <AlertDialogDescription>
            {!canDelete ? (
              <>
                لا يمكن حذف هذه المركبة لأنها حالياً <strong>مؤجرة</strong>.
                يجب إنهاء عقد الإيجار أولاً قبل حذف المركبة.
              </>
            ) : (
              <>
                هل أنت متأكد من رغبتك في حذف المركبة <strong>{vehicle.plate_number}</strong>؟
                <br />
                <span className="text-destructive font-medium">
                  هذا الإجراء لا يمكن التراجع عنه.
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
