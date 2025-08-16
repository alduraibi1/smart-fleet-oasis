
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerFormData } from '@/types/customer';

interface LicenseInfoSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function LicenseInfoSection({ formData, onInputChange }: LicenseInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">معلومات الرخصة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="license_number">رقم رخصة القيادة</Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) => onInputChange('license_number', e.target.value)}
            placeholder="رقم الرخصة"
          />
        </div>

        <div>
          <Label htmlFor="license_expiry">تاريخ انتهاء الرخصة</Label>
          <Input
            id="license_expiry"
            type="date"
            value={formData.license_expiry}
            onChange={(e) => onInputChange('license_expiry', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="license_type">نوع الرخصة</Label>
          <Select 
            value={formData.license_type} 
            onValueChange={(value) => onInputChange('license_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">خاص</SelectItem>
              <SelectItem value="commercial">تجاري</SelectItem>
              <SelectItem value="motorcycle">دراجة نارية</SelectItem>
              <SelectItem value="heavy">ثقيل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="license_issue_date">تاريخ إصدار الرخصة</Label>
          <Input
            id="license_issue_date"
            type="date"
            value={formData.license_issue_date}
            onChange={(e) => onInputChange('license_issue_date', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
