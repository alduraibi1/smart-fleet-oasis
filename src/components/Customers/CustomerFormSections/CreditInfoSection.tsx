
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerFormData } from '@/types/customer';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface CreditInfoSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function CreditInfoSection({ formData, onInputChange }: CreditInfoSectionProps) {
  const { settings } = useSystemSettings();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">المعلومات الائتمانية</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="credit_limit">الحد الائتماني (ريال)</Label>
          <Input
            id="credit_limit"
            type="number"
            value={formData.credit_limit}
            onChange={(e) => onInputChange('credit_limit', Number(e.target.value))}
            placeholder={`الافتراضي: ${settings.defaultCreditLimit || 0}`}
          />
          <p className="text-xs text-muted-foreground mt-1">
            الحد الافتراضي: {settings.defaultCreditLimit || 0} ريال
          </p>
        </div>

        <div>
          <Label htmlFor="payment_terms">شروط الدفع</Label>
          <Select 
            value={formData.payment_terms} 
            onValueChange={(value) => onInputChange('payment_terms', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">دفع فوري</SelectItem>
              <SelectItem value="7_days">7 أيام</SelectItem>
              <SelectItem value="15_days">15 يوم</SelectItem>
              <SelectItem value="30_days">30 يوم</SelectItem>
              <SelectItem value="custom">مخصص</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preferred_payment_method">طريقة الدفع المفضلة</Label>
          <Select 
            value={formData.preferred_payment_method} 
            onValueChange={(value) => onInputChange('preferred_payment_method', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">نقدي</SelectItem>
              <SelectItem value="bank_transfer">حوالة بنكية</SelectItem>
              <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
              <SelectItem value="check">شيك</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="monthly_income">الراتب الشهري (ريال)</Label>
          <Input
            id="monthly_income"
            type="number"
            value={formData.monthly_income}
            onChange={(e) => onInputChange('monthly_income', Number(e.target.value))}
            placeholder="الراتب الشهري"
          />
        </div>
      </div>
    </div>
  );
}
