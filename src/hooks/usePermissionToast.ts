import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PermissionError {
  status?: number;
  message?: string;
  operation?: string;
}

export function usePermissionToast() {
  const { toast } = useToast();
  const { user } = useAuth();

  const showPermissionError = useCallback((error: PermissionError) => {
    const { status, message, operation = 'العملية المطلوبة' } = error;

    // Handle 403 Forbidden errors
    if (status === 403) {
      toast({
        variant: "destructive",
        title: "غير مصرح بهذا الإجراء",
        description: `ليس لديك الصلاحية اللازمة لـ ${operation}. يرجى التواصل مع مدير النظام.`,
        duration: 5000
      });
      return;
    }

    // Handle 401 Unauthorized errors
    if (status === 401) {
      toast({
        variant: "destructive", 
        title: "جلسة منتهية الصلاحية",
        description: "يرجى تسجيل الدخول مرة أخرى للمتابعة.",
        duration: 5000
      });
      return;
    }

    // Handle RLS policy violations
    if (message?.includes('row-level security policy') || 
        message?.includes('permission denied') ||
        message?.includes('insufficient privileges')) {
      toast({
        variant: "destructive",
        title: "غير مصرح بالوصول",
        description: `لا يمكنك الوصول إلى هذه البيانات. ${operation} غير مسموح لدورك الحالي.`,
        duration: 5000
      });
      return;
    }

    // Handle JWT/Auth token errors
    if (message?.includes('JWT') || message?.includes('token')) {
      toast({
        variant: "destructive",
        title: "خطأ في المصادقة",
        description: "حدث خطأ في التحقق من هويتك. يرجى تسجيل الدخول مرة أخرى.",
        duration: 5000
      });
      return;
    }

    // Generic permission error
    toast({
      variant: "destructive",
      title: "خطأ في الصلاحيات",
      description: message || `فشل في تنفيذ ${operation}. يرجى التحقق من صلاحياتك.`,
      duration: 5000
    });
  }, [toast]);

  const showSuccessMessage = useCallback((message: string, operation?: string) => {
    toast({
      title: "تم بنجاح",
      description: operation ? `تم ${operation} بنجاح` : message,
      duration: 3000
    });
  }, [toast]);

  const showWarningMessage = useCallback((message: string, title: string = "تحذير") => {
    toast({
      variant: "destructive",
      title,
      description: message,
      duration: 4000
    });
  }, [toast]);

  const showInfoMessage = useCallback((message: string, title: string = "معلومات") => {
    toast({
      title,
      description: message,
      duration: 3000
    });
  }, [toast]);

  // Helper function to wrap API calls with permission error handling
  const withPermissionHandling = useCallback(async <T>(
    apiCall: () => Promise<T>,
    operation?: string
  ): Promise<T | null> => {
    try {
      return await apiCall();
    } catch (error: any) {
      console.error(`Permission error in ${operation}:`, error);
      
      showPermissionError({
        status: error?.status || error?.code,
        message: error?.message || error?.msg || error?.error_description,
        operation
      });
      
      return null;
    }
  }, [showPermissionError]);

  return {
    showPermissionError,
    showSuccessMessage,
    showWarningMessage,
    showInfoMessage,
    withPermissionHandling
  };
}

// Global error handler for permission errors
export function handleSupabaseError(error: any, operation?: string) {
  if (!error) return false;

  const isPermissionError = 
    error.code === '42501' || // insufficient_privilege
    error.code === 'PGRST301' || // row level security
    error.message?.includes('row-level security policy') ||
    error.message?.includes('permission denied') ||
    error.message?.includes('insufficient privileges') ||
    (error.status && [401, 403].includes(error.status));

  if (isPermissionError) {
    // Use the hook in components, but for utility functions, 
    // you might want to emit an event or use a different approach
    console.warn('Permission error detected:', error, 'for operation:', operation);
    return true;
  }

  return false;
}