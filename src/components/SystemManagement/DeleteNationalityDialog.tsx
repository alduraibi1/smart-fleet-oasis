
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNationalities, Nationality } from '@/hooks/useNationalities';

interface DeleteNationalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nationality: Nationality;
  onSuccess: () => void;
}

export const DeleteNationalityDialog = ({ open, onOpenChange, nationality, onSuccess }: DeleteNationalityDialogProps) => {
  const { deleteNationality } = useNationalities();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    
    const result = await deleteNationality(nationality.id);
    
    if (result.success) {
      onSuccess();
    }
    
    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف الجنسية</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف الجنسية "{nationality.name_ar}"؟
            <br />
            <strong>تحذير:</strong> لا يمكن التراجع عن هذا الإجراء وقد يؤثر على العملاء الموجودين.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'جاري الحذف...' : 'حذف'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
