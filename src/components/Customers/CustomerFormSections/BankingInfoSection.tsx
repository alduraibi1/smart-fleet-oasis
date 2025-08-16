
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CustomerFormData } from '@/types/customer';

interface BankingInfoSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function BankingInfoSection({ formData, onInputChange }: BankingInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">المعلومات البنكية</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bank_name">اسم البنك</Label>
          <Input
            id="bank_name"
            value={formData.bank_name}
            onChange={(e) => onInputChange('bank_name', e.target.value)}
            placeholder="اسم البنك"
          />
        </div>

        <div>
          <Label htmlFor="bank_account_number">رقم الحساب البنكي</Label>
          <Input
            id="bank_account_number"
            value={formData.bank_account_number}
            onChange={(e) => onInputChange('bank_account_number', e.target.value)}
            placeholder="رقم الحساب"
          />
        </div>
      </div>
    </div>
  );
}
