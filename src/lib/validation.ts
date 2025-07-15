import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Smart validation utilities for Saudi Arabia context
export const SaudiValidation = {
  // National ID validation for Saudi citizens (starts with 1) and residents (starts with 2)
  nationalId: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length !== 10) return false;
      
      const firstDigit = cleaned[0];
      if (firstDigit !== '1' && firstDigit !== '2') return false;
      
      // Correct Saudi ID checksum validation algorithm
      let sum = 0;
      for (let i = 0; i < 10; i++) {
        const digit = parseInt(cleaned[i]);
        if (i % 2 === 0) {
          const doubled = digit * 2;
          const doubledStr = `00${doubled}`.slice(-2);
          sum += parseInt(doubledStr[0]) + parseInt(doubledStr[1]);
        } else {
          sum += digit;
        }
      }
      
      return sum % 10 === 0;
    },
    
    format: (value: string): string => {
      return value.replace(/\D/g, '').slice(0, 10);
    },
    
    getErrorMessage: (value: string): string => {
      const cleaned = value.replace(/\D/g, '');
      
      if (cleaned.length === 0) return '';
      if (cleaned.length < 10) return 'رقم الهوية يجب أن يكون 10 أرقام';
      if (cleaned.length > 10) return 'رقم الهوية يجب أن يكون 10 أرقام فقط';
      
      const firstDigit = cleaned[0];
      if (firstDigit !== '1' && firstDigit !== '2') {
        return 'رقم الهوية يجب أن يبدأ بـ 1 (مواطن) أو 2 (مقيم)';
      }
      
      if (!SaudiValidation.nationalId.validate(cleaned)) {
        return 'رقم الهوية غير صحيح';
      }
      
      return '';
    }
  },

  // Saudi mobile number validation (starts with 5, 10 digits total)
  mobileNumber: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length === 10 && cleaned.startsWith('5');
    },
    
    format: (value: string): string => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    },
    
    getErrorMessage: (value: string): string => {
      const cleaned = value.replace(/\D/g, '');
      
      if (cleaned.length === 0) return '';
      if (!cleaned.startsWith('5')) return 'رقم الجوال يجب أن يبدأ بـ 5';
      if (cleaned.length < 10) return 'رقم الجوال يجب أن يكون 10 أرقام';
      if (cleaned.length > 10) return 'رقم الجوال يجب أن يكون 10 أرقام فقط';
      
      return '';
    }
  },

  // Saudi vehicle plate number validation (new format: 3 Arabic letters + 4 numbers)
  plateNumber: {
    validate: (value: string): boolean => {
      // New Saudi format: 3 Arabic letters + 4 numbers (e.g., أ ب ج 1234)
      const arabicLettersPattern = /^[أ-ي]{3}\s*\d{4}$/;
      const englishLettersPattern = /^[A-Z]{3}\s*\d{4}$/i;
      
      return arabicLettersPattern.test(value.trim()) || englishLettersPattern.test(value.trim());
    },
    
    format: (value: string): string => {
      // Remove all spaces and special characters
      const cleaned = value.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '');
      
      // Extract letters and numbers
      const letters = cleaned.replace(/[0-9]/g, '').slice(0, 3);
      const numbers = cleaned.replace(/[^\d]/g, '').slice(0, 4);
      
      if (letters.length === 0 && numbers.length === 0) return '';
      if (letters.length > 0 && numbers.length === 0) return letters;
      if (letters.length === 0 && numbers.length > 0) return numbers;
      
      return `${letters} ${numbers}`;
    },
    
    getErrorMessage: (value: string): string => {
      if (value.trim().length === 0) return '';
      
      if (!SaudiValidation.plateNumber.validate(value)) {
        return 'رقم اللوحة يجب أن يكون بالشكل: 3 أحرف + 4 أرقام (مثال: أ ب ج 1234)';
      }
      
      return '';
    }
  },

  // VIN validation (17 characters, alphanumeric)
  vin: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
      return cleaned.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(cleaned);
    },
    
    format: (value: string): string => {
      return value.replace(/[^A-Za-z0-9]/g, '').slice(0, 17).toUpperCase();
    },
    
    getErrorMessage: (value: string): string => {
      if (value.trim().length === 0) return '';
      
      const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
      
      if (cleaned.length < 17) return 'رقم VIN يجب أن يكون 17 حرف/رقم';
      if (cleaned.length > 17) return 'رقم VIN يجب أن يكون 17 حرف/رقم فقط';
      if (!/^[A-HJ-NPR-Z0-9]+$/i.test(cleaned)) return 'رقم VIN يحتوي على أحرف غير مسموحة';
      
      return '';
    }
  },

  // Saudi IBAN validation (24 characters: SA + 22 digits)
  iban: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\s/g, '').toUpperCase();
      
      if (!cleaned.startsWith('SA')) return false;
      if (cleaned.length !== 24) return false;
      
      const accountNumber = cleaned.slice(2);
      return /^\d{22}$/.test(accountNumber);
    },
    
    format: (value: string): string => {
      const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      
      if (!cleaned.startsWith('SA')) {
        const numbers = cleaned.replace(/[^0-9]/g, '');
        return numbers.length > 0 ? `SA${numbers.slice(0, 22)}` : 'SA';
      }
      
      const formatted = cleaned.slice(0, 24);
      
      // Add spaces for better readability: SA00 0000 0000 0000 0000 00
      if (formatted.length > 4) {
        return formatted.replace(/(.{4})/g, '$1 ').trim();
      }
      
      return formatted;
    },
    
    getErrorMessage: (value: string): string => {
      if (value.trim().length === 0) return '';
      
      const cleaned = value.replace(/\s/g, '').toUpperCase();
      
      if (!cleaned.startsWith('SA')) return 'رقم IBAN يجب أن يبدأ بـ SA';
      if (cleaned.length < 24) return 'رقم IBAN يجب أن يكون 24 رقم/حرف (SA + 22 رقم)';
      if (cleaned.length > 24) return 'رقم IBAN يجب أن يكون 24 رقم/حرف فقط';
      
      const accountNumber = cleaned.slice(2);
      if (!/^\d{22}$/.test(accountNumber)) return 'رقم IBAN يجب أن يحتوي على SA متبوعة بـ 22 رقم';
      
      return '';
    }
  },

  // Saudi postal code validation (5 digits)
  postalCode: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length === 5;
    },
    
    format: (value: string): string => {
      return value.replace(/\D/g, '').slice(0, 5);
    },
    
    getErrorMessage: (value: string): string => {
      if (value.trim().length === 0) return '';
      
      const cleaned = value.replace(/\D/g, '');
      
      if (cleaned.length < 5) return 'الرمز البريدي يجب أن يكون 5 أرقام';
      if (cleaned.length > 5) return 'الرمز البريدي يجب أن يكون 5 أرقام فقط';
      
      return '';
    }
  },

  // Saudi driver license validation
  driverLicense: {
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length >= 8 && cleaned.length <= 10;
    },
    
    format: (value: string): string => {
      return value.replace(/\D/g, '').slice(0, 10);
    },
    
    getErrorMessage: (value: string): string => {
      if (value.trim().length === 0) return '';
      
      const cleaned = value.replace(/\D/g, '');
      
      if (cleaned.length < 8) return 'رقم رخصة القيادة يجب أن يكون 8-10 أرقام';
      if (cleaned.length > 10) return 'رقم رخصة القيادة يجب أن يكون 8-10 أرقام';
      
      return '';
    }
  },

  // Date validation (not in the past for expiry dates)
  expiryDate: {
    validate: (value: string): boolean => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    
    getErrorMessage: (value: string): string => {
      if (value.trim().length === 0) return '';
      
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(date.getTime())) return 'تاريخ غير صحيح';
      if (date < today) return 'تاريخ انتهاء الصلاحية لا يمكن أن يكون في الماضي';
      
      return '';
    }
  },

  // Email validation
  email: {
    validate: (value: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    
    getErrorMessage: (value: string): string => {
      if (value.trim().length === 0) return '';
      
      if (!SaudiValidation.email.validate(value)) {
        return 'البريد الإلكتروني غير صحيح';
      }
      
      return '';
    }
  }
};

// Status icons for validation
export const ValidationIcons = {
  valid: '✓',
  invalid: '✗',
  empty: ''
};

// Validation status type
export type ValidationStatus = 'valid' | 'invalid' | 'empty';

// Get validation status
export const getValidationStatus = (value: string, validator: (value: string) => boolean): ValidationStatus => {
  if (value.trim().length === 0) return 'empty';
  return validator(value) ? 'valid' : 'invalid';
};

// Check for duplicate data in arrays
export const checkDuplicate = <T>(
  array: T[], 
  value: string, 
  field: keyof T, 
  excludeId?: string
): boolean => {
  return array.some(item => 
    item[field] === value && 
    (excludeId ? (item as any).id !== excludeId : true)
  );
};

// Smart suggestions for common mistakes
export const SmartSuggestions = {
  nationalId: (value: string): string[] => {
    const suggestions: string[] = [];
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 9) {
      suggestions.push(`هل تقصد: 1${cleaned}؟`);
      suggestions.push(`هل تقصد: 2${cleaned}؟`);
    }
    
    if (cleaned.startsWith('0')) {
      suggestions.push(`هل تقصد: 1${cleaned.slice(1)}؟`);
    }
    
    return suggestions;
  },
  
  mobileNumber: (value: string): string[] => {
    const suggestions: string[] = [];
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.startsWith('05')) {
      suggestions.push(`هل تقصد: ${cleaned.slice(1)}؟`);
    }
    
    if (cleaned.startsWith('9665')) {
      suggestions.push(`هل تقصد: ${cleaned.slice(4)}؟`);
    }
    
    if (cleaned.length === 9 && !cleaned.startsWith('5')) {
      suggestions.push(`هل تقصد: 5${cleaned.slice(1)}؟`);
    }
    
    return suggestions;
  }
};