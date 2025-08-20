
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerFormData } from '@/types/customer';

interface EmergencyContactSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function EmergencyContactSection({ formData, onInputChange }: EmergencyContactSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">جهة الاتصال للطوارئ</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="emergency_contact_name">اسم جهة الاتصال</Label>
          <Input
            id="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={(e) => onInputChange('emergency_contact_name', e.target.value)}
            placeholder="الاسم الكامل لجهة الاتصال"
          />
        </div>

        <div>
          <Label htmlFor="emergency_contact_relation">صلة القرابة</Label>
          <Select 
            value={formData.emergency_contact_relation} 
            onValueChange={(value) => onInputChange('emergency_contact_relation', value)}
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
          <Label htmlFor="emergency_contact_phone">رقم الهاتف الأساسي</Label>
          <Input
            id="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={(e) => onInputChange('emergency_contact_phone', e.target.value)}
            placeholder="05xxxxxxxx"
          />
        </div>

        <div>
          <Label htmlFor="emergency_contact_phone_secondary">رقم الهاتف البديل</Label>
          <Input
            id="emergency_contact_phone_secondary"
            value={formData.emergency_contact_phone_secondary}
            onChange={(e) => onInputChange('emergency_contact_phone_secondary', e.target.value)}
            placeholder="05xxxxxxxx (اختياري)"
          />
        </div>
      </div>
    </div>
  );
}
