
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CustomerFormData } from '@/types/customer';

interface GuarantorSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function GuarantorSection({ formData, onInputChange }: GuarantorSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">معلومات الكفيل</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="guarantor_name">اسم الكفيل</Label>
          <Input
            id="guarantor_name"
            value={formData.guarantor_name || ''}
            onChange={(e) => onInputChange('guarantor_name', e.target.value)}
            placeholder="الاسم الكامل للكفيل"
          />
        </div>

        <div>
          <Label htmlFor="guarantor_national_id">رقم هوية الكفيل</Label>
          <Input
            id="guarantor_national_id"
            value={formData.guarantor_national_id || ''}
            onChange={(e) => onInputChange('guarantor_national_id', e.target.value)}
            placeholder="رقم الهوية"
          />
        </div>

        <div>
          <Label htmlFor="guarantor_phone">رقم جوال الكفيل</Label>
          <Input
            id="guarantor_phone"
            value={formData.guarantor_phone || ''}
            onChange={(e) => onInputChange('guarantor_phone', e.target.value)}
            placeholder="05xxxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="guarantor_relation">صلة القرابة</Label>
          <Select 
            value={formData.guarantor_relation || ''} 
            onValueChange={(value) => onInputChange('guarantor_relation', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر صلة القرابة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="father">الأب</SelectItem>
              <SelectItem value="mother">الأم</SelectItem>
              <SelectItem value="spouse">الزوج/الزوجة</SelectItem>
              <SelectItem value="brother">الأخ</SelectItem>
              <SelectItem value="sister">الأخت</SelectItem>
              <SelectItem value="son">الابن</SelectItem>
              <SelectItem value="daughter">الابنة</SelectItem>
              <SelectItem value="friend">صديق</SelectItem>
              <SelectItem value="colleague">زميل عمل</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="guarantor_job_title">المهنة</Label>
          <Input
            id="guarantor_job_title"
            value={formData.guarantor_job_title || ''}
            onChange={(e) => onInputChange('guarantor_job_title', e.target.value)}
            placeholder="مهنة الكفيل"
          />
        </div>

        <div>
          <Label htmlFor="guarantor_monthly_income">الراتب الشهري</Label>
          <Input
            id="guarantor_monthly_income"
            type="number"
            value={formData.guarantor_monthly_income || ''}
            onChange={(e) => onInputChange('guarantor_monthly_income', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="guarantor_address">عنوان الكفيل</Label>
          <Textarea
            id="guarantor_address"
            value={formData.guarantor_address || ''}
            onChange={(e) => onInputChange('guarantor_address', e.target.value)}
            placeholder="العنوان الكامل للكفيل"
          />
        </div>
      </div>
    </div>
  );
}
