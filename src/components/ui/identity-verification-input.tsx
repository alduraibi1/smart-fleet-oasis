
import * as React from "react"
import { cn } from "@/lib/utils"
import { SmartInput, SmartInputProps } from "@/components/ui/smart-input"
import { ValidationBadge } from "@/components/ui/validation-badge"
import { SmartSuggestions, Suggestion } from "@/components/ui/smart-suggestions"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

export interface IdentityVerificationInputProps extends SmartInputProps {
  isDuplicate?: boolean
  isChecking?: boolean
  duplicateCustomer?: { id: string; name: string; phone?: string; national_id?: string } | null
  onSuggestionClick?: (suggestion: string) => void
}

const IdentityVerificationInput = React.forwardRef<HTMLInputElement, IdentityVerificationInputProps>(
  ({ 
    isDuplicate = false,
    isChecking = false,
    duplicateCustomer,
    onSuggestionClick,
    validationType,
    nationality,
    className,
    ...props 
  }, ref) => {
    const [validationStatus, setValidationStatus] = React.useState<'valid' | 'invalid' | 'empty'>('empty')
    const [errorMessage, setErrorMessage] = React.useState("")

    const handleValidationChange = (isValid: boolean, error: string) => {
      if (props.value?.toString().trim().length === 0) {
        setValidationStatus('empty')
      } else {
        setValidationStatus(isValid ? 'valid' : 'invalid')
      }
      setErrorMessage(error)
      props.onValidationChange?.(isValid, error)
    }

    const getSuggestions = (): Suggestion[] => {
      const suggestions: Suggestion[] = []

      if (isDuplicate && duplicateCustomer) {
        suggestions.push({
          type: 'warning',
          message: `هذا ${validationType === 'nationalId' ? 'رقم الهوية' : 'الرقم'} مستخدم من قبل: ${duplicateCustomer.name}`,
        })
      }

      if (validationType === 'nationalId' && validationStatus === 'invalid' && props.value) {
        const value = props.value.toString()
        if (value.length > 0) {
          if (nationality === 'سعودي' && !value.startsWith('1')) {
            suggestions.push({
              type: 'tip',
              message: 'رقم الهوية السعودية يجب أن يبدأ بـ 1',
              action: () => onSuggestionClick?.('1' + value.slice(1))
            })
          } else if (nationality && nationality !== 'سعودي' && !value.startsWith('2')) {
            suggestions.push({
              type: 'tip',
              message: 'رقم الإقامة يجب أن يبدأ بـ 2',
              action: () => onSuggestionClick?.('2' + value.slice(1))
            })
          }
          if (value.length < 10) {
            suggestions.push({
              type: 'info',
              message: `أدخل ${10 - value.length} أرقام إضافية`
            })
          }
        }
      }

      if (validationType === 'mobileNumber' && validationStatus === 'invalid' && props.value) {
        const value = props.value.toString().replace(/\D/g, '')
        if (value.length > 0) {
          if (!value.startsWith('5')) {
            suggestions.push({
              type: 'tip',
              message: 'رقم الجوال يجب أن يبدأ بـ 5',
              action: () => onSuggestionClick?.('5' + value.slice(1))
            })
          }
          if (value.length < 9) {
            suggestions.push({
              type: 'info',
              message: `أدخل ${9 - value.length} أرقام إضافية`
            })
          }
        }
      }

      return suggestions
    }

    const getBadgeStatus = () => {
      if (isChecking) return 'checking'
      if (isDuplicate) return 'warning'
      if (validationStatus === 'empty') return 'empty'
      return validationStatus
    }

    const getBadgeMessage = () => {
      if (isChecking) return 'جاري التحقق من التكرار...'
      if (isDuplicate) return 'مكرر'
      if (validationStatus === 'valid') return 'صحيح'
      if (validationStatus === 'invalid') return 'خطأ في التنسيق'
      return undefined
    }

    return (
      <div className="space-y-2">
        <div className="relative">
          <SmartInput
            ref={ref}
            validationType={validationType}
            nationality={nationality}
            onValidationChange={handleValidationChange}
            className={cn(
              isDuplicate && "border-orange-300 focus-visible:ring-orange-500",
              isChecking && "border-blue-300 focus-visible:ring-blue-500",
              className
            )}
            {...props}
          />
          
          {/* Status indicators */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isChecking && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
            {isDuplicate && <AlertCircle className="h-4 w-4 text-orange-500" />}
            {!isChecking && !isDuplicate && validationStatus === 'valid' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <ValidationBadge
            status={getBadgeStatus()}
            message={getBadgeMessage()}
          />
          {errorMessage && validationStatus === 'invalid' && (
            <span className="text-xs text-destructive">{errorMessage}</span>
          )}
        </div>

        {/* Smart suggestions */}
        <SmartSuggestions suggestions={getSuggestions()} />
      </div>
    )
  }
)

IdentityVerificationInput.displayName = "IdentityVerificationInput"

export { IdentityVerificationInput }
