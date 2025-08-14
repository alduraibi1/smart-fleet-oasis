import React from 'react';
import { z } from 'zod';
import { AlertTriangle, CheckCircle, X, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Enhanced contract validation schema with payment fields
export const contractValidationSchema = z.object({
  // Required fields
  customer_id: z.string().min(1, 'يجب اختيار العميل - حقل إلزامي'),
  vehicle_id: z.string().min(1, 'يجب اختيار المركبة - حقل إلزامي'),
  start_date: z.string().min(1, 'يجب تحديد تاريخ البداية - حقل إلزامي'),
  end_date: z.string().min(1, 'يجب تحديد تاريخ النهاية - حقل إلزامي'),
  daily_rate: z.number().min(1, 'يجب تحديد السعر اليومي - حقل إلزامي'),
  
  // Optional fields
  total_amount: z.number().min(0).optional(),
  paid_amount: z.number().min(0).optional(),
  remaining_balance: z.number().optional(),
  deposit_amount: z.number().min(0).optional(),
  security_deposit: z.number().min(0).optional(),
  payment_date: z.string().optional(),
  payment_due_date: z.string().optional(),
  payment_reference: z.string().optional(),
  payment_terms: z.string().optional(),
  deposit_status: z.enum(['pending', 'received', 'refunded']).optional().default('pending'),
  insurance_type: z.enum(['none', 'percentage', 'fixed']).optional().default('none'),
  insurance_amount: z.number().min(0).optional(),
  insurance_percentage: z.number().min(0).max(100).optional(),
  vat_enabled: z.boolean().optional().default(false),
  vat_rate: z.number().min(0).max(100).optional(),
  additional_charges: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
  delegation_fee: z.number().min(0).optional(),
  payment_method: z.string().optional(),
  payment_status: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate > startDate;
}, {
  message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
  path: ['end_date']
}).refine((data) => {
  // If insurance type is percentage, percentage must be provided
  if (data.insurance_type === 'percentage' && (!data.insurance_percentage || data.insurance_percentage <= 0)) {
    return false;
  }
  // If insurance type is fixed, amount must be provided
  if (data.insurance_type === 'fixed' && (!data.insurance_amount || data.insurance_amount <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'يجب تحديد مبلغ أو نسبة التأمين عند اختيار نوع التأمين',
  path: ['insurance_amount']
}).refine((data) => {
  // Validate paid amount doesn't exceed total amount
  if (data.paid_amount && data.total_amount && data.paid_amount > data.total_amount) {
    return false;
  }
  return true;
}, {
  message: 'المبلغ المدفوع لا يمكن أن يتجاوز المبلغ الإجمالي',
  path: ['paid_amount']
});

// Vehicle return validation schema
export const vehicleReturnValidationSchema = z.object({
  contractId: z.string().min(1, 'يجب اختيار العقد'),
  returnDate: z.string().min(1, 'يجب تحديد تاريخ الإرجاع'),
  returnTime: z.string().min(1, 'يجب تحديد وقت الإرجاع'),
  currentMileage: z.number().min(0, 'قراءة العداد غير صحيحة'),
  fuelLevel: z.number().min(0).max(100, 'مستوى الوقود يجب أن يكون بين 0 و 100'),
  inspectorName: z.string().min(1, 'يجب إدخال اسم المفتش'),
  customerSignature: z.boolean().refine(val => val === true, 'يجب موافقة العميل والتوقيع'),
});

export type ContractValidationErrors = z.ZodError<z.infer<typeof contractValidationSchema>>['issues'];
export type VehicleReturnValidationErrors = z.ZodError<z.infer<typeof vehicleReturnValidationSchema>>['issues'];

interface ValidationDisplayProps {
  errors: ContractValidationErrors | VehicleReturnValidationErrors;
  title?: string;
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({ 
  errors, 
  title = 'يرجى تصحيح الأخطاء التالية:' 
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <X className="h-4 w-4" />
        {title}
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              <strong>{error.path.join('.')}: </strong>
              {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

interface ValidationBadgeProps {
  isValid: boolean;
  validText?: string;
  invalidText?: string;
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({
  isValid,
  validText = 'صحيح',
  invalidText = 'غير صحيح'
}) => {
  return (
    <Badge 
      variant={isValid ? 'default' : 'destructive'}
      className={`flex items-center gap-1 ${
        isValid ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
      }`}
    >
      {isValid ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}
      {isValid ? validText : invalidText}
    </Badge>
  );
};

// Field requirement indicator component
interface FieldRequirementProps {
  required?: boolean;
  optional?: boolean;
  recommended?: boolean;
}

export const FieldRequirement: React.FC<FieldRequirementProps> = ({
  required = false,
  optional = false,
  recommended = false
}) => {
  if (required) {
    return <span className="text-red-500 text-sm ml-1">*</span>;
  }
  
  if (recommended) {
    return (
      <Badge variant="secondary" className="text-xs ml-2">
        <Info className="h-3 w-3 ml-1" />
        مستحسن
      </Badge>
    );
  }
  
  if (optional) {
    return (
      <Badge variant="outline" className="text-xs ml-2">
        اختياري
      </Badge>
    );
  }
  
  return null;
};

// Custom validation hooks
export const useContractValidation = () => {
  const validateContract = (data: any) => {
    try {
      contractValidationSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: error.issues };
      }
      return { isValid: false, errors: [] };
    }
  };

  return { validateContract };
};

export const useVehicleReturnValidation = () => {
  const validateReturn = (data: any) => {
    try {
      vehicleReturnValidationSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, errors: error.issues };
      }
      return { isValid: false, errors: [] };
    }
  };

  return { validateReturn };
};
