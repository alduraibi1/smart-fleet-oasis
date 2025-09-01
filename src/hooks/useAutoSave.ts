import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveProps<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({ 
  data, 
  onSave, 
  delay = 2000, 
  enabled = true 
}: UseAutoSaveProps<T>) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialData] = useState<T>(data);
  const { toast } = useToast();

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(initialData);
    setHasUnsavedChanges(hasChanges);
  }, [data, initialData]);

  // Auto-save functionality
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges || isSaving) return;

    const autoSaveTimer = setTimeout(async () => {
      await handleAutoSave();
    }, delay);

    return () => clearTimeout(autoSaveTimer);
  }, [data, hasUnsavedChanges, enabled, isSaving, delay]);

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(data);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "تم الحفظ التلقائي",
        description: "تم حفظ تغييراتك تلقائياً",
        duration: 2000,
      });
    } catch (error) {
      console.error('Auto-save error:', error);
      toast({
        title: "خطأ في الحفظ التلقائي",
        description: "حدث خطأ أثناء الحفظ التلقائي",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [data, hasUnsavedChanges, isSaving, onSave, toast]);

  const manualSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(data);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ التغييرات بنجاح",
      });
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [data, isSaving, onSave, toast]);

  return {
    hasUnsavedChanges,
    lastSaved,
    isSaving,
    save: manualSave,
    autoSave: handleAutoSave,
  };
}