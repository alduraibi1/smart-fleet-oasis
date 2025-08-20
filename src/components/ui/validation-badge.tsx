
import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"

export interface ValidationBadgeProps {
  status: 'valid' | 'invalid' | 'checking' | 'warning' | 'empty'
  message?: string
  showIcon?: boolean
  className?: string
}

const ValidationBadge = React.forwardRef<HTMLDivElement, ValidationBadgeProps>(
  ({ status, message, showIcon = true, className, ...props }, ref) => {
    const getStatusConfig = () => {
      switch (status) {
        case 'valid':
          return {
            variant: 'default' as const,
            icon: CheckCircle,
            color: 'text-green-600 bg-green-50 border-green-200',
            text: message || 'صحيح'
          }
        case 'invalid':
          return {
            variant: 'destructive' as const,
            icon: XCircle,
            color: 'text-red-600 bg-red-50 border-red-200',
            text: message || 'غير صحيح'
          }
        case 'checking':
          return {
            variant: 'secondary' as const,
            icon: Clock,
            color: 'text-blue-600 bg-blue-50 border-blue-200',
            text: message || 'جاري التحقق...'
          }
        case 'warning':
          return {
            variant: 'secondary' as const,
            icon: AlertTriangle,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            text: message || 'تحذير'
          }
        default:
          return null
      }
    }

    const config = getStatusConfig()
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        className={cn(
          "flex items-center gap-1 text-xs font-medium",
          config.color,
          className
        )}
        {...props}
      >
        {showIcon && <Icon className="h-3 w-3" />}
        {config.text}
      </Badge>
    )
  }
)

ValidationBadge.displayName = "ValidationBadge"

export { ValidationBadge }
