import { supabase } from '@/integrations/supabase/client';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface VehicleImportData {
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  chassis_number?: string;
  engine_number?: string;
  fuel_type?: string;
  transmission?: string;
  seating_capacity?: number;
  daily_rate?: number;
  mileage?: number;
  status?: string;
  registration_type?: string;
  owner_name?: string;
  inspection_expiry?: string;
  inspection_status?: string;
  insurance_status?: string;
  insurance_expiry?: string;
  renewal_fees?: number;
  renewal_status?: string;
  registration_expiry?: string;
}

// تنسيق رقم اللوحة
export const normalizePlateNumber = (plate: string): string => {
  return plate.trim().toUpperCase().replace(/\s+/g, '-');
};

// التحقق من صحة السنة
export const validateYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1980 && year <= currentYear + 1;
};

// التحقق من صحة التاريخ
export const validateDate = (dateStr: string | undefined, fieldName: string): ValidationError | null => {
  if (!dateStr) return null;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return {
      row: 0,
      field: fieldName,
      message: `تاريخ غير صالح: ${fieldName}`,
      severity: 'error'
    };
  }
  
  return null;
};

// التحقق من انتهاء التواريخ
export const checkExpiryWarnings = (data: VehicleImportData, rowIndex: number): ValidationError[] => {
  const warnings: ValidationError[] = [];
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // التحقق من تاريخ انتهاء التأمين
  if (data.insurance_expiry) {
    const insuranceDate = new Date(data.insurance_expiry);
    if (insuranceDate < today) {
      warnings.push({
        row: rowIndex,
        field: 'insurance_expiry',
        message: 'التأمين منتهي',
        severity: 'error'
      });
    } else if (insuranceDate < thirtyDaysFromNow) {
      warnings.push({
        row: rowIndex,
        field: 'insurance_expiry',
        message: 'التأمين سينتهي خلال 30 يوم',
        severity: 'warning'
      });
    }
  }

  // التحقق من تاريخ انتهاء الفحص
  if (data.inspection_expiry) {
    const inspectionDate = new Date(data.inspection_expiry);
    if (inspectionDate < today) {
      warnings.push({
        row: rowIndex,
        field: 'inspection_expiry',
        message: 'الفحص منتهي',
        severity: 'error'
      });
    } else if (inspectionDate < thirtyDaysFromNow) {
      warnings.push({
        row: rowIndex,
        field: 'inspection_expiry',
        message: 'الفحص سينتهي خلال 30 يوم',
        severity: 'warning'
      });
    }
  }

  // التحقق من تاريخ انتهاء رخصة السير
  if (data.registration_expiry) {
    const registrationDate = new Date(data.registration_expiry);
    if (registrationDate < today) {
      warnings.push({
        row: rowIndex,
        field: 'registration_expiry',
        message: 'رخصة السير منتهية',
        severity: 'error'
      });
    } else if (registrationDate < thirtyDaysFromNow) {
      warnings.push({
        row: rowIndex,
        field: 'registration_expiry',
        message: 'رخصة السير ستنتهي خلال 30 يوم',
        severity: 'warning'
      });
    }
  }

  return warnings;
};

// التحقق من البيانات المطلوبة
export const validateRequiredFields = (data: VehicleImportData, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.plate_number || data.plate_number.trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'plate_number',
      message: 'رقم اللوحة مطلوب',
      severity: 'error'
    });
  }

  if (!data.brand || data.brand.trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'brand',
      message: 'الماركة مطلوبة',
      severity: 'error'
    });
  }

  if (!data.model || data.model.trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'model',
      message: 'الطراز مطلوب',
      severity: 'error'
    });
  }

  if (!validateYear(data.year)) {
    errors.push({
      row: rowIndex,
      field: 'year',
      message: 'سنة الصنع غير منطقية',
      severity: 'error'
    });
  }

  return errors;
};

// التحقق من التكرار في قاعدة البيانات
export const checkDuplicates = async (data: VehicleImportData): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];

  // التحقق من رقم اللوحة
  const { data: existingPlate } = await supabase
    .from('vehicles')
    .select('id')
    .eq('plate_number', normalizePlateNumber(data.plate_number))
    .maybeSingle();

  if (existingPlate) {
    errors.push({
      row: 0,
      field: 'plate_number',
      message: `رقم اللوحة ${data.plate_number} موجود مسبقاً`,
      severity: 'error'
    });
  }

  // التحقق من VIN إذا تم إدخاله
  if (data.vin && data.vin.trim() !== '') {
    const { data: existingVin } = await supabase
      .from('vehicles')
      .select('id')
      .eq('vin', data.vin)
      .maybeSingle();

    if (existingVin) {
      errors.push({
        row: 0,
        field: 'vin',
        message: `الرقم التسلسلي ${data.vin} موجود مسبقاً`,
        severity: 'error'
      });
    }
  }

  return errors;
};

// تنسيق أسماء الماركات
const brandMapping: Record<string, string> = {
  'تويوتا': 'Toyota',
  'هونداي': 'Hyundai',
  'نيسان': 'Nissan',
  'فورد': 'Ford',
  'شيفروليه': 'Chevrolet',
  'مرسيدس': 'Mercedes',
  'بي ام دبليو': 'BMW',
  'كيا': 'Kia',
  'مازدا': 'Mazda',
};

export const normalizeBrand = (brand: string): string => {
  const trimmed = brand.trim();
  return brandMapping[trimmed] || trimmed;
};

// معالجة وإيجاد أو إنشاء المالك
export const findOrCreateOwner = async (ownerName: string): Promise<string | null> => {
  if (!ownerName || ownerName.trim() === '') {
    return null;
  }

  // البحث عن المالك
  const { data: existingOwner } = await supabase
    .from('vehicle_owners')
    .select('id')
    .eq('name', ownerName.trim())
    .maybeSingle();

  if (existingOwner) {
    return existingOwner.id;
  }

  // إنشاء مالك جديد
  const { data: newOwner, error } = await supabase
    .from('vehicle_owners')
    .insert({
      name: ownerName.trim(),
      owner_type: 'individual',
      is_active: true
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating owner:', error);
    return null;
  }

  return newOwner?.id || null;
};
