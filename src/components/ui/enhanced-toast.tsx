import React from "react"
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const toastStyles = {
  success: "border-success/20 bg-success/10 text-success-foreground",
  error: "border-destructive/20 bg-destructive/10 text-destructive-foreground",
  warning: "border-warning/20 bg-warning/10 text-warning-foreground",
  info: "border-info/20 bg-info/10 text-info-foreground"
}

export const enhancedToast = {
  success: (message: string, options?: ToastOptions) => {
    const Icon = toastIcons.success
    return toast.success(message, {
      duration: options?.duration || 4000,
      className: cn("border-success/20 bg-success/10"),
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      icon: <Icon className="w-4 h-4 text-success" />
    })
  },

  error: (message: string, options?: ToastOptions) => {
    const Icon = toastIcons.error
    return toast.error(message, {
      duration: options?.duration || 6000,
      className: cn("border-destructive/20 bg-destructive/10"),
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      icon: <Icon className="w-4 h-4 text-destructive" />
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    const Icon = toastIcons.warning
    return toast.warning(message, {
      duration: options?.duration || 5000,
      className: cn("border-warning/20 bg-warning/10"),
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      icon: <Icon className="w-4 h-4 text-warning" />
    })
  },

  info: (message: string, options?: ToastOptions) => {
    const Icon = toastIcons.info
    return toast.info(message, {
      duration: options?.duration || 4000,
      className: cn("border-info/20 bg-info/10"),
      description: options?.description,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined,
      icon: <Icon className="w-4 h-4 text-info" />
    })
  },

  loading: (message: string) => {
    return toast.loading(message, {
      className: cn("border-primary/20 bg-primary/10")
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
      className: cn("border-primary/20 bg-primary/10")
    })
  }
}