import * as React from "react"
import { cn } from "@/lib/utils"
import { SaudiValidation, ValidationIcons, getValidationStatus, type ValidationStatus } from "@/lib/validation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

export interface SmartInputProps extends React.ComponentProps<"input"> {
  label?: string
  validationType?: 'nationalId' | 'mobileNumber' | 'plateNumber' | 'vin' | 'iban' | 'postalCode' | 'driverLicense' | 'email'
  showValidationIcon?: boolean
  showSuggestions?: boolean
  onValidationChange?: (isValid: boolean, errorMessage: string) => void
  required?: boolean
}

const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(
  ({ 
    className, 
    type, 
    label,
    validationType,
    showValidationIcon = true,
    showSuggestions = true,
    onValidationChange,
    required = false,
    onChange,
    value = "",
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value?.toString() || "")
    const [validationStatus, setValidationStatus] = React.useState<ValidationStatus>('empty')
    const [errorMessage, setErrorMessage] = React.useState("")
    const [suggestions, setSuggestions] = React.useState<string[]>([])

    // Get validator based on type
    const getValidator = () => {
      if (!validationType) return null
      return SaudiValidation[validationType]
    }

    // Update validation when value changes
    React.useEffect(() => {
      const currentValue = value?.toString() || internalValue
      
      if (!validationType) {
        setValidationStatus('empty')
        setErrorMessage("")
        setSuggestions([])
        onValidationChange?.(true, "")
        return
      }

      const validator = getValidator()
      if (!validator) return

      const status = getValidationStatus(currentValue, validator.validate)
      const error = validator.getErrorMessage ? validator.getErrorMessage(currentValue) : ""
      
      setValidationStatus(status)
      setErrorMessage(error)
      
      // Update suggestions for invalid inputs
      if (status === 'invalid' && showSuggestions) {
        // Add smart suggestions logic here if needed
        setSuggestions([])
      } else {
        setSuggestions([])
      }

      onValidationChange?.(status === 'valid' || status === 'empty', error)
    }, [value, internalValue, validationType, onValidationChange, showSuggestions])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value
      
      // Auto-format based on validation type
      if (validationType && SaudiValidation[validationType]) {
        const validator = SaudiValidation[validationType] as any
        if (validator && validator.format && typeof validator.format === 'function') {
          inputValue = validator.format(inputValue)
        }
      }

      setInternalValue(inputValue)
      
      // Call original onChange with formatted value
      if (onChange) {
        const modifiedEvent = {
          ...e,
          target: { ...e.target, value: inputValue }
        }
        onChange(modifiedEvent)
      }
    }

    const getValidationIcon = () => {
      if (!showValidationIcon || validationStatus === 'empty') return null

      switch (validationStatus) {
        case 'valid':
          return <CheckCircle className="h-4 w-4 text-success" />
        case 'invalid':
          return <XCircle className="h-4 w-4 text-destructive" />
        default:
          return null
      }
    }

    const getValidationColor = () => {
      switch (validationStatus) {
        case 'valid':
          return 'border-success focus-visible:ring-success'
        case 'invalid':
          return 'border-destructive focus-visible:ring-destructive'
        default:
          return ''
      }
    }

    const getInputHelperText = () => {
      if (!validationType) return ""
      
      const placeholders = {
        nationalId: "مثال: 1234567890",
        mobileNumber: "مثال: 512 345 678",
        plateNumber: "مثال: أ ب ج 1234", 
        vin: "مثال: WVW1J7A37CE123456",
        iban: "مثال: SA00 0000 0000 0000 0000 00",
        postalCode: "مثال: 12345",
        driverLicense: "مثال: 12345678",
        email: "مثال: user@example.com"
      }
      
      return placeholders[validationType] || ""
    }

    return (
      <div className="space-y-2">
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            type={type}
            className={cn(
              "transition-all duration-300",
              getValidationColor(),
              showValidationIcon && "pr-10",
              className
            )}
            ref={ref}
            value={value || internalValue}
            onChange={handleInputChange}
            placeholder={props.placeholder || getInputHelperText()}
            {...props}
          />
          
          {showValidationIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {getValidationIcon()}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && validationStatus === 'invalid' && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {/* Helper text based on validation type */}
        {validationType && validationStatus === 'empty' && (
          <div className="text-xs text-muted-foreground">
            {(() => {
              const helpTexts = {
                nationalId: "يجب أن يبدأ بـ 1 (مواطن) أو 2 (مقيم) ويتكون من 10 أرقام",
                mobileNumber: "يجب أن يبدأ بـ 5 ويتكون من 10 أرقام",
                plateNumber: "الشكل الجديد: 3 أحرف + 4 أرقام",
                vin: "17 حرف/رقم (لا يحتوي على I, O, Q)",
                iban: "SA + 22 رقم (إجمالي 24 رقم/حرف)",
                postalCode: "5 أرقام",
                driverLicense: "8-10 أرقام",
                email: "البريد الإلكتروني الصحيح"
              }
              return helpTexts[validationType] || ""
            })()}
          </div>
        )}
      </div>
    )
  }
)

SmartInput.displayName = "SmartInput"

export { SmartInput }