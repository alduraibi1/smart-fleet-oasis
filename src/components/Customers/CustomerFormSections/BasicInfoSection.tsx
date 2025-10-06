
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IdentityVerificationInput } from '@/components/ui/identity-verification-input';
import { SmartInput } from '@/components/ui/smart-input';
import { CustomerFormData } from '@/types/customer';
import { useNationalities } from '@/hooks/useNationalities';
import { useCustomerDuplicateCheck } from '@/hooks/useCustomerDuplicateCheck';
import { useToast } from '@/hooks/use-toast';
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
    // Only check if field is valid AND has a value (not empty)
    if (isPhoneValid && value.length > 0) {
      checkPhone(value);
    }
  }, [formData.phone, isPhoneValid, checkPhone]);

  // Trigger national ID duplicate check when valid and non-empty
  React.useEffect(() => {
    const value = (formData.national_id || '').toString().trim();
    // Only check if field is valid AND has a value (not empty)
    if (isIdValid && value.length > 0) {
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

  const handleSuggestionClick = (field: keyof CustomerFormData, value: string) => {
    onInputChange(field, value);
  };

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
          <IdentityVerificationInput
            id="phone"
            validationType="mobileNumber"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            required
            placeholder="05xxxxxxxx"
            showValidationIcon
            showSuggestions
            onValidationChange={(valid) => setIsPhoneValid(!!valid)}
            isDuplicate={phoneDuplicate.isDuplicate}
            isChecking={phoneDuplicate.checking}
            duplicateCustomer={phoneDuplicate.customer}
            onSuggestionClick={(value) => handleSuggestionClick('phone', value)}
          />
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
          <IdentityVerificationInput
            id="national_id"
            validationType="nationalId"
            nationality={formData.nationality}
            value={formData.national_id}
            onChange={(e) => onInputChange('national_id', e.target.value)}
            required
            showValidationIcon
            showSuggestions
            onValidationChange={(valid) => setIsIdValid(!!valid)}
            isDuplicate={idDuplicate.isDuplicate}
            isChecking={idDuplicate.checking}
            duplicateCustomer={idDuplicate.customer}
            onSuggestionClick={(value) => handleSuggestionClick('national_id', value)}
          />
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
