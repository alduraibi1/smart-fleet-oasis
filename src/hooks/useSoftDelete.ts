
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SoftDeleteOptions {
  entityName: string;
  onDelete: (id: string) => Promise<void>;
  onRestore?: (id: string) => Promise<void>;
}

export const useSoftDelete = (options: SoftDeleteOptions) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { toast } = useToast();

  const softDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await options.onDelete(id);
      toast({
        title: 'تم الأرشفة بنجاح',
        description: `تم أرشفة ${options.entityName} بنجاح`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'خطأ في الأرشفة',
        description: `فشل في أرشفة ${options.entityName}`,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  }, [options, toast]);

  const restore = useCallback(async (id: string) => {
    if (!options.onRestore) return;
    
    setRestoringId(id);
    try {
      await options.onRestore(id);
      toast({
        title: 'تم الاستعادة بنجاح',
        description: `تم استعادة ${options.entityName} بنجاح`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'خطأ في الاستعادة',
        description: `فشل في استعادة ${options.entityName}`,
        variant: 'destructive',
      });
    } finally {
      setRestoringId(null);
    }
  }, [options, toast]);

  return {
    softDelete,
    restore,
    deletingId,
    restoringId,
    isDeleting: (id: string) => deletingId === id,
    isRestoring: (id: string) => restoringId === id,
  };
};
