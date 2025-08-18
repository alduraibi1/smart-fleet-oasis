
import { useCallback } from 'react';
import { useToast } from './use-toast';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'حدث خطأ غير متوقع'
    } = options;

    // Extract error message
    let errorMessage = fallbackMessage;
    if (error instanceof Error) {
      errorMessage = error.message || fallbackMessage;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Log error
    if (logError) {
      console.error('Error handled:', error);
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: 'خطأ',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    // Report to error tracking if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: errorMessage,
        fatal: false
      });
    }

    return errorMessage;
  }, [toast]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      throw error; // Re-throw for caller to handle if needed
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
}
