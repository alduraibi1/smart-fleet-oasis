/**
 * معالج أخطاء التكرار في قاعدة البيانات
 * يحول أخطاء PostgreSQL إلى رسائل واضحة بالعربية
 */

interface PostgresError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

const duplicateFieldNames: Record<string, string> = {
  'customers_phone_unique': 'رقم الهاتف',
  'customers_national_id_key': 'رقم الهوية',
  'vehicles_plate_number_unique': 'رقم اللوحة',
  'vehicles_vin_unique': 'رقم الشاسيه (VIN)',
  'vehicle_owners_commercial_registration_key': 'السجل التجاري',
  'vehicle_owners_tax_number_key': 'الرقم الضريبي',
  'vehicle_owners_national_id_key': 'رقم الهوية',
  'vehicle_owners_phone_key': 'رقم الهاتف',
};

/**
 * التحقق من أن الخطأ هو خطأ تكرار في قاعدة البيانات
 */
export function isDuplicateError(error: any): boolean {
  return error?.code === '23505' || error?.message?.includes('duplicate key value');
}

/**
 * استخراج اسم الحقل من رسالة خطأ PostgreSQL
 */
function extractFieldFromError(error: PostgresError): string | null {
  const message = error.message || error.details || '';
  
  // البحث عن اسم القيد في الرسالة
  for (const [constraint, fieldName] of Object.entries(duplicateFieldNames)) {
    if (message.includes(constraint)) {
      return fieldName;
    }
  }
  
  // محاولة استخراج اسم الحقل من الرسالة
  const match = message.match(/Key \((\w+)\)=/);
  if (match && match[1]) {
    // تحويل أسماء الحقول الإنجليزية إلى عربية
    const fieldMap: Record<string, string> = {
      'phone': 'رقم الهاتف',
      'national_id': 'رقم الهوية',
      'plate_number': 'رقم اللوحة',
      'vin': 'رقم الشاسيه',
      'commercial_registration': 'السجل التجاري',
      'tax_number': 'الرقم الضريبي',
    };
    return fieldMap[match[1]] || match[1];
  }
  
  return null;
}

/**
 * تحويل خطأ التكرار إلى رسالة واضحة بالعربية
 */
export function getDuplicateErrorMessage(error: any): string {
  if (!isDuplicateError(error)) {
    return 'حدث خطأ غير متوقع';
  }
  
  const fieldName = extractFieldFromError(error);
  
  if (fieldName) {
    return `${fieldName} مستخدم مسبقاً. يرجى استخدام قيمة أخرى.`;
  }
  
  return 'هذه القيمة مستخدمة مسبقاً. يرجى استخدام قيمة أخرى.';
}

/**
 * معالج شامل لأخطاء حفظ البيانات
 */
export function handleSaveError(error: any): { title: string; message: string } {
  console.error('Save error:', error);
  
  if (isDuplicateError(error)) {
    return {
      title: 'بيانات مكررة',
      message: getDuplicateErrorMessage(error),
    };
  }
  
  // أخطاء أخرى
  if (error?.message) {
    return {
      title: 'خطأ',
      message: error.message,
    };
  }
  
  return {
    title: 'خطأ',
    message: 'حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.',
  };
}
