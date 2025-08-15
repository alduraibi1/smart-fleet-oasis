
import { useToast } from '@/hooks/use-toast'
import { useCallback } from 'react'

export const useErrorHandler = () => {
  const { toast } = useToast()

  const handleError = useCallback((error: Error | string, title?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    
    console.error('Error:', error)
    
    toast({
      title: title || 'حدث خطأ',
      description: errorMessage,
      variant: 'destructive',
    })
  }, [toast])

  const handleSuccess = useCallback((message: string, title?: string) => {
    toast({
      title: title || 'تم بنجاح',
      description: message,
      variant: 'default',
    })
  }, [toast])

  const handleWarning = useCallback((message: string, title?: string) => {
    toast({
      title: title || 'تحذير',
      description: message,
      variant: 'default',
    })
  }, [toast])

  return {
    handleError,
    handleSuccess,
    handleWarning,
  }
}
