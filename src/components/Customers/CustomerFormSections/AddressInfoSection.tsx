
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomerFormData } from '@/types/customer';

interface AddressInfoSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function AddressInfoSection({ formData, onInputChange }: AddressInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">معلومات العنوان</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">المدينة</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => onInputChange('city', e.target.value)}
            placeholder="اسم المدينة"
          />
        </div>

        <div>
          <Label htmlFor="district">الحي</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => onInputChange('district', e.target.value)}
            placeholder="اسم الحي"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address">العنوان التفصيلي</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="العنوان التفصيلي..."
          />
        </div>
      </div>
    </div>
  );
}
