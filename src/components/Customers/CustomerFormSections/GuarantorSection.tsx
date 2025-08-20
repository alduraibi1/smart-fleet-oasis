
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CustomerFormData } from '@/types/customer';
import { UserPlus, UserMinus } from 'lucide-react';

interface GuarantorSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function GuarantorSection({ formData, onInputChange }: GuarantorSectionProps) {
  const [hasGuarantor, setHasGuarantor] = useState(
    !!(formData.guarantor_name || formData.guarantor_national_id || formData.guarantor_phone)
  );

  const handleToggleGuarantor = (enabled: boolean) => {
    setHasGuarantor(enabled);
    
    // Clear guarantor data if disabled
    if (!enabled) {
      onInputChange('guarantor_name', '');
      onInputChange('guarantor_national_id', '');
      onInputChange('guarantor_phone', '');
      onInputChange('guarantor_relation', '');
      onInputChange('guarantor_job_title', '');
      onInputChange('guarantor_monthly_income', 0);
      onInputChange('guarantor_address', '');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">معلومات الكفيل</h3>
        <div className="flex items-center gap-3">
          <Label htmlFor="has-guarantor" className="text-sm">
            {hasGuarantor ? 'يوجد كفيل' : 'بدون كفيل'}
          </Label>
          <Switch
            id="has-guarantor"
            checked={hasGuarantor}
            onCheckedChange={handleToggleGuarantor}
          />
        </div>
      </div>

      {!hasGuarantor && (
        <div className="bg-muted/50 border border-dashed rounded-lg p-6 text-center">
          <UserMinus className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            تم إلغاء تفعيل معلومات الكفيل. يمكنك تفعيلها من خلال الزر أعلاه.
          </p>
        </div>
      )}

      {hasGuarantor && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                معلومات الكفيل مطلوبة
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              يرجى تعبئة المعلومات الأساسية للكفيل أدناه
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guarantor_name">اسم الكفيل *</Label>
              <Input
                id="guarantor_name"
                value={formData.guarantor_name || ''}
                onChange={(e) => onInputChange('guarantor_name', e.target.value)}
                placeholder="الاسم الكامل للكفيل"
                required={hasGuarantor}
              />
            </div>

            <div>
              <Label htmlFor="guarantor_national_id">رقم هوية الكفيل *</Label>
              <Input
                id="guarantor_national_id"
                value={formData.guarantor_national_id || ''}
                onChange={(e) => onInputChange('guarantor_national_id', e.target.value)}
                placeholder="رقم الهوية"
                required={hasGuarantor}
              />
            </div>

            <div>
              <Label htmlFor="guarantor_phone">رقم جوال الكفيل *</Label>
              <Input
                id="guarantor_phone"
                value={formData.guarantor_phone || ''}
                onChange={(e) => onInputChange('guarantor_phone', e.target.value)}
                placeholder="05xxxxxxxx"
                required={hasGuarantor}
              />
            </div>

            <div>
              <Label htmlFor="guarantor_relation">صلة القرابة *</Label>
              <Select 
                value={formData.guarantor_relation || ''} 
                onValueChange={(value) => onInputChange('guarantor_relation', value)}
                required={hasGuarantor}
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
              <Label htmlFor="guarantor_monthly_income">الراتب الشهري (ر.س)</Label>
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
      )}
    </div>
  );
}
