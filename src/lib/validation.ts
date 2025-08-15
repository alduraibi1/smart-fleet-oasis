
import { z } from 'zod'

// Common validation schemas
export const phoneSchema = z
  .string()
  .min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل')
  .regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح')

export const emailSchema = z
  .string()
  .email('البريد الإلكتروني غير صحيح')
  .optional()
  .or(z.literal(''))

export const nationalIdSchema = z
  .string()
  .min(10, 'رقم الهوية يجب أن يكون 10 أرقام')
  .max(10, 'رقم الهوية يجب أن يكون 10 أرقام')
  .regex(/^[0-9]+$/, 'رقم الهوية يجب أن يحتوي على أرقام فقط')

export const licenseNumberSchema = z
  .string()
  .min(8, 'رقم الرخصة يجب أن يكون 8 أرقام على الأقل')
  .regex(/^[0-9]+$/, 'رقم الرخصة يجب أن يحتوي على أرقام فقط')

export const plateNumberSchema = z
  .string()
  .min(3, 'رقم اللوحة يجب أن يكون 3 أحرف/أرقام على الأقل')
  .max(10, 'رقم اللوحة لا يمكن أن يتجاوز 10 أحرف/أرقام')

export const positiveNumberSchema = z
  .number()
  .positive('القيمة يجب أن تكون أكبر من صفر')

export const nonNegativeNumberSchema = z
  .number()
  .min(0, 'القيمة لا يمكن أن تكون سالبة')

// Customer validation schema
export const customerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  name_english: z.string().optional(),
  phone: phoneSchema,
  phone_secondary: phoneSchema.optional(),
  email: emailSchema,
  email_secondary: emailSchema,
  national_id: nationalIdSchema,
  nationality: z.string().default('سعودي'),
  gender: z.enum(['male', 'female']).default('male'),
  date_of_birth: z.string().optional(),
  license_number: licenseNumberSchema,
  license_expiry: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postal_code: z.string().optional(),
})

// Vehicle validation schema
export const vehicleSchema = z.object({
  plate_number: plateNumberSchema,
  brand: z.string().min(2, 'الماركة مطلوبة'),
  model: z.string().min(2, 'الموديل مطلوب'),
  year: z.number().min(1990, 'السنة يجب أن تكون 1990 أو أحدث').max(new Date().getFullYear() + 1),
  color: z.string().min(2, 'اللون مطلوب'),
  daily_rate: positiveNumberSchema,
  seating_capacity: z.number().min(1).max(50),
  fuel_type: z.enum(['gasoline', 'diesel', 'hybrid', 'electric']).default('gasoline'),
  transmission: z.enum(['manual', 'automatic']).default('manual'),
})

// Contract validation schema
export const contractSchema = z.object({
  customer_id: z.string().uuid('عميل غيرصحيح'),
  vehicle_id: z.string().uuid('مركبة غير صحيحة'),
  start_date: z.string(),
  end_date: z.string(),
  daily_rate: positiveNumberSchema,
  total_amount: positiveNumberSchema,
  payment_method: z.enum(['cash', 'card', 'transfer', 'check']).default('cash'),
})

// Helper function to format validation errors
export const formatValidationErrors = (error: z.ZodError) => {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }))
}

// Helper function to validate data with better error handling
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    return {
      success: true as const,
      data: schema.parse(data)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        errors: formatValidationErrors(error)
      }
    }
    return {
      success: false as const,
      errors: [{ field: 'unknown', message: 'حدث خطأ في التحقق من البيانات' }]
    }
  }
}

// Validation status type
export type ValidationStatus = 'empty' | 'valid' | 'invalid'

// Saudi-specific validation utilities
export const SaudiValidation = {
  nationalId: {
    validate: (value: string): boolean => {
      if (!value || value.length !== 10) return false
      const digits = value.split('').map(Number)
      
      // Check if starts with 1 (Saudi) or 2 (Resident)
      if (digits[0] !== 1 && digits[0] !== 2) return false
      
      // Luhn algorithm for validation
      let sum = 0
      for (let i = 0; i < 9; i++) {
        let digit = digits[i]
        if (i % 2 === 0) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
      }
      
      const checkDigit = (10 - (sum % 10)) % 10
      return checkDigit === digits[9]
    },
    getErrorMessage: (value: string): string => {
      if (!value) return 'رقم الهوية مطلوب'
      if (value.length !== 10) return 'رقم الهوية يجب أن يكون 10 أرقام'
      if (!/^\d+$/.test(value)) return 'رقم الهوية يجب أن يحتوي على أرقام فقط'
      return 'رقم الهوية غير صحيح'
    },
    format: (value: string): string => {
      return value.replace(/\D/g, '').slice(0, 10)
    }
  },

  mobileNumber: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\D/g, '')
      return cleaned.length === 10 && cleaned.startsWith('5')
    },
    getErrorMessage: (value: string): string => {
      if (!value) return 'رقم الجوال مطلوب'
      const cleaned = value.replace(/\D/g, '')
      if (cleaned.length !== 10) return 'رقم الجوال يجب أن يكون 10 أرقام'
      if (!cleaned.startsWith('5')) return 'رقم الجوال يجب أن يبدأ بـ 5'
      return 'رقم الجوال غير صحيح'
    },
    format: (value: string): string => {
      const digits = value.replace(/\D/g, '').slice(0, 10)
      if (digits.length >= 3) {
        return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
      }
      return digits
    }
  },

  plateNumber: {
    validate: (value: string): boolean => {
      // New Saudi plate format: 3 Arabic letters + 4 digits
      return /^[أ-ي]{3}\s*\d{4}$/.test(value.trim())
    },
    getErrorMessage: (value: string): string => {
      if (!value) return 'رقم اللوحة مطلوب'
      return 'رقم اللوحة يجب أن يكون بالشكل الجديد: 3 أحرف + 4 أرقام'
    },
    format: (value: string): string => {
      return value.trim()
    }
  },

  vin: {
    validate: (value: string): boolean => {
      if (!value || value.length !== 17) return false
      // VIN should not contain I, O, Q
      return !/[IOQ]/.test(value.toUpperCase()) && /^[A-HJ-NPR-Z0-9]{17}$/.test(value.toUpperCase())
    },
    getErrorMessage: (value: string): string => {
      if (!value) return 'رقم الشاسيه مطلوب'
      if (value.length !== 17) return 'رقم الشاسيه يجب أن يكون 17 رمز'
      return 'رقم الشاسيه غير صحيح'
    },
    format: (value: string): string => {
      return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17)
    }
  },

  iban: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\s/g, '').toUpperCase()
      return cleaned.length === 24 && cleaned.startsWith('SA') && /^SA\d{22}$/.test(cleaned)
    },
    getErrorMessage: (value: string): string => {
      if (!value) return 'رقم الآيبان مطلوب'
      const cleaned = value.replace(/\s/g, '').toUpperCase()
      if (!cleaned.startsWith('SA')) return 'رقم الآيبان يجب أن يبدأ بـ SA'
      if (cleaned.length !== 24) return 'رقم الآيبان يجب أن يكون 24 رمز'
      return 'رقم الآيبان غير صحيح'
    },
    format: (value: string): string => {
      const cleaned = value.replace(/\s/g, '').toUpperCase().slice(0, 24)
      return cleaned.replace(/(.{4})/g, '$1 ').trim()
    }
  },

  postalCode: {
    validate: (value: string): boolean => {
      return /^\d{5}$/.test(value)
    },
    getErrorMessage: (value: string): string => {
      if (!value) return 'الرمز البريدي مطلوب'
      return 'الرمز البريدي يجب أن يكون 5 أرقام'
    },
    format: (value: string): string => {
      return value.replace(/\D/g, '').slice(0, 5)
    }
  },

  driverLicense: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\D/g, '')
      return cleaned.length >= 8 && cleaned.length <= 10
    },
    getErrorMessage: (value: string): string => {
      if (!value) return 'رقم رخصة القيادة مطلوب'
      const cleaned = value.replace(/\D/g, '')
      if (cleaned.length < 8) return 'رقم رخصة القيادة يجب أن يكون 8 أرقام على الأقل'
      if (cleaned.length > 10) return 'رقم رخصة القيادة لا يمكن أن يتجاوز 10 أرقام'
      return 'رقم رخصة القيادة غير صحيح'
    },
    format: (value: string): string => {
      return value.replace(/\D/g, '').slice(0, 10)
    }
  },

  email: {
    validate: (value: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    getErrorMessage: (value: string): string => {
      if (!value) return 'البريد الإلكتروني مطلوب'
      return 'البريد الإلكتروني غير صحيح'
    },
    format: (value: string): string => {
      return value.toLowerCase().trim()
    }
  },

  // Enhanced national ID validation with nationality context
  validateNationalIdWithNationality: (value: string, nationality: string) => {
    if (!value || value.length !== 10) {
      return {
        isValid: false,
        errorMessage: 'رقم الهوية يجب أن يكون 10 أرقام'
      }
    }

    const digits = value.split('').map(Number)
    
    // Check nationality-specific rules
    if (nationality === 'سعودي' && digits[0] !== 1) {
      return {
        isValid: false,
        errorMessage: 'رقم الهوية السعودية يجب أن يبدأ بـ 1'
      }
    }
    
    if (nationality !== 'سعودي' && digits[0] !== 2) {
      return {
        isValid: false,
        errorMessage: 'رقم الإقامة يجب أن يبدأ بـ 2'
      }
    }
    
    // Luhn algorithm validation
    let sum = 0
    for (let i = 0; i < 9; i++) {
      let digit = digits[i]
      if (i % 2 === 0) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    
    const checkDigit = (10 - (sum % 10)) % 10
    const isValid = checkDigit === digits[9]
    
    return {
      isValid,
      errorMessage: isValid ? '' : 'رقم الهوية غير صحيح'
    }
  }
}

// Validation icons (placeholder)
export const ValidationIcons = {
  valid: '✓',
  invalid: '✗',
  warning: '⚠'
}

// Get validation status
export const getValidationStatus = (value: string, validator: (value: string) => boolean): ValidationStatus => {
  if (!value || value.trim().length === 0) return 'empty'
  return validator(value) ? 'valid' : 'invalid'
}
