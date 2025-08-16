
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerFormData } from '@/types/customer';

interface BasicInfoSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function BasicInfoSection({ formData, onInputChange }: BasicInfoSectionProps) {
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
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            required
            placeholder="05xxxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="example@email.com"
          />
        </div>

        <div>
          <Label htmlFor="national_id">رقم الهوية *</Label>
          <Input
            id="national_id"
            value={formData.national_id}
            onChange={(e) => onInputChange('national_id', e.target.value)}
            required
            placeholder="1xxxxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="nationality">الجنسية</Label>
          <Select 
            value={formData.nationality} 
            onValueChange={(value) => onInputChange('nationality', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="سعودي">سعودي</SelectItem>
              <SelectItem value="مصري">مصري</SelectItem>
              <SelectItem value="يمني">يمني</SelectItem>
              <SelectItem value="سوري">سوري</SelectItem>
              <SelectItem value="أردني">أردني</SelectItem>
              <SelectItem value="أخرى">أخرى</SelectItem>
            </SelectContent>
          </Select>
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
