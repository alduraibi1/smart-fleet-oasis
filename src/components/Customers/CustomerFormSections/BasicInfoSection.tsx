
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartInput } from '@/components/ui/smart-input';
import { CustomerFormData } from '@/types/customer';
import { useNationalities } from '@/hooks/useNationalities';
import { useCustomerDuplicateCheck } from '@/hooks/useCustomerDuplicateCheck';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import * as React from 'react';

interface BasicInfoSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function BasicInfoSection({ formData, onInputChange }: BasicInfoSectionProps) {
  const { getActiveNationalities, loading } = useNationalities();
  const activeNationalities = getActiveNationalities();

  const { toast } = useToast();

  // Duplicate check hook
  const { phoneDuplicate, idDuplicate, checkPhone, checkNationalId } = useCustomerDuplicateCheck();

  // Track field validity to avoid querying while invalid
  const [isPhoneValid, setIsPhoneValid] = React.useState<boolean>(false);
  const [isIdValid, setIsIdValid] = React.useState<boolean>(false);

  // Prevent spamming toasts for same value
  const lastToastPhoneRef = React.useRef<string>('');
  const lastToastIdRef = React.useRef<string>('');

  // Trigger phone duplicate check when valid and non-empty
  React.useEffect(() => {
    const value = (formData.phone || '').toString().trim();
    if (isPhoneValid && value) {
      checkPhone(value);
    }
  }, [formData.phone, isPhoneValid, checkPhone]);

  // Trigger national ID duplicate check when valid and non-empty
  React.useEffect(() => {
    const value = (formData.national_id || '').toString().trim();
    if (isIdValid && value) {
      checkNationalId(value);
    }
  }, [formData.national_id, isIdValid, checkNationalId]);

  // Toast when duplicate detected
  React.useEffect(() => {
    if (phoneDuplicate.isDuplicate) {
      const key = (formData.phone || '').toString().trim();
      if (key && key !== lastToastPhoneRef.current) {
        lastToastPhoneRef.current = key;
        toast({
          title: "تنبيه تكرار رقم الجوال",
          description: `الرقم مستخدم من قبل${phoneDuplicate.customer?.name ? `: ${phoneDuplicate.customer.name}` : ''}`,
          duration: 3000,
          variant: "destructive",
        });
      }
    }
  }, [phoneDuplicate.isDuplicate, phoneDuplicate.customer, formData.phone, toast]);

  React.useEffect(() => {
    if (idDuplicate.isDuplicate) {
      const key = (formData.national_id || '').toString().trim();
      if (key && key !== lastToastIdRef.current) {
        lastToastIdRef.current = key;
        toast({
          title: "تنبيه تكرار رقم الهوية",
          description: `رقم الهوية مستخدم من قبل${idDuplicate.customer?.name ? `: ${idDuplicate.customer.name}` : ''}`,
          duration: 3000,
          variant: "destructive",
        });
      }
    }
  }, [idDuplicate.isDuplicate, idDuplicate.customer, formData.national_id, toast]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">الاسم الكامل *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            required
            placeholder="الاسم الكامل"
          />
        </div>

        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <SmartInput
            id="phone"
            validationType="mobileNumber"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            required
            placeholder="05xxxxxxxx"
            showValidationIcon
            showSuggestions
            onValidationChange={(valid) => setIsPhoneValid(!!valid)}
          />
          {phoneDuplicate.isDuplicate && (
            <div className="mt-1 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                هذا الرقم مستخدم من قبل
                {phoneDuplicate.customer?.name ? `: ${phoneDuplicate.customer.name}` : ''}
              </span>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <SmartInput
            id="email"
            type="email"
            validationType="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="example@email.com"
            showValidationIcon
          />
        </div>

        <div>
          <Label htmlFor="nationality">الجنسية *</Label>
          <Select 
            value={formData.nationality} 
            onValueChange={(value) => onInputChange('nationality', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={loading ? "جاري التحميل..." : "اختر الجنسية"} />
            </SelectTrigger>
            <SelectContent>
              {activeNationalities.map((nationality) => (
                <SelectItem key={nationality.id} value={nationality.name_ar}>
                  {nationality.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="national_id">رقم الهوية *</Label>
          <SmartInput
            id="national_id"
            validationType="nationalId"
            nationality={formData.nationality}
            value={formData.national_id}
            onChange={(e) => onInputChange('national_id', e.target.value)}
            required
            showValidationIcon
            showSuggestions
            onValidationChange={(valid) => setIsIdValid(!!valid)}
          />
          {idDuplicate.isDuplicate && (
            <div className="mt-1 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                رقم الهوية مستخدم من قبل
                {idDuplicate.customer?.name ? `: ${idDuplicate.customer.name}` : ''}
              </span>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="gender">الجنس</Label>
          <Select 
            value={formData.gender} 
            onValueChange={(value) => onInputChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
