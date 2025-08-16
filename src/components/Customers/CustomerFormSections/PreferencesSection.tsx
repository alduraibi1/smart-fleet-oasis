
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomerFormData } from '@/types/customer';

interface PreferencesSectionProps {
  formData: CustomerFormData;
  onInputChange: (field: keyof CustomerFormData, value: any) => void;
}

export function PreferencesSection({ formData, onInputChange }: PreferencesSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">التفضيلات</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sms_notifications"
            checked={formData.sms_notifications}
            onCheckedChange={(checked) => onInputChange('sms_notifications', checked)}
          />
          <Label htmlFor="sms_notifications" className="mr-2">إشعارات SMS</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="email_notifications"
            checked={formData.email_notifications}
            onCheckedChange={(checked) => onInputChange('email_notifications', checked)}
          />
          <Label htmlFor="email_notifications" className="mr-2">إشعارات البريد الإلكتروني</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="marketing_consent"
            checked={formData.marketing_consent}
            onCheckedChange={(checked) => onInputChange('marketing_consent', checked)}
          />
          <Label htmlFor="marketing_consent" className="mr-2">الموافقة على التسويق</Label>
        </div>
      </div>
    </div>
  );
}
