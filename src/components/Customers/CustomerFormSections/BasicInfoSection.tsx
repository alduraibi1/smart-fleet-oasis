
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartInput } from '@/components/ui/smart-input';
import { CustomerFormData } from '@/types/customer';
import { useNationalities } from '@/hooks/useNationalities';

interface BasicInfoSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function BasicInfoSection({ formData, onInputChange }: BasicInfoSectionProps) {
  const { getActiveNationalities, loading } = useNationalities();
  const activeNationalities = getActiveNationalities();

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
          <SmartInput
            id="national_id"
            validationType="nationalId"
            nationality={formData.nationality}
            value={formData.national_id}
            onChange={(e) => onInputChange('national_id', e.target.value)}
            required
            showValidationIcon
            showSuggestions
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
