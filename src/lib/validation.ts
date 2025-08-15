
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
  customer_id: z.string().uuid('عميل غير صحيح'),
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
