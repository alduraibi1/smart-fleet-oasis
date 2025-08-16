
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Customer, CustomerFormData, defaultCustomerFormData } from '@/types/customer';
import { convertCustomerToFormData } from '@/utils/customerUtils';
import { useCustomersNew } from '@/hooks/useCustomersNew';

interface NewAddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer?: Customer | null;
  onClose?: () => void;
}

export function NewAddCustomerDialog({ 
  open, 
  onOpenChange, 
  editingCustomer = null, 
  onClose 
}: NewAddCustomerDialogProps) {
  const { addCustomer, updateCustomer } = useCustomersNew();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(defaultCustomerFormData);

  console.log('🎭 Dialog render:', { open, editingCustomer: !!editingCustomer });

  // Load customer data when editing
  useEffect(() => {
    if (editingCustomer && open) {
      console.log('📝 Loading customer for editing:', editingCustomer);
      const customerFormData = convertCustomerToFormData(editingCustomer);
      setFormData(customerFormData);
    } else if (!editingCustomer && open) {
      console.log('🆕 Resetting form for new customer');
      setFormData(defaultCustomerFormData);
    }
  }, [editingCustomer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📤 Form submission:', { formData, editingCustomer: !!editingCustomer });
    
    setLoading(true);

    try {
      let result;
      
      if (editingCustomer) {
        console.log('🔄 Updating existing customer:', editingCustomer.id);
        result = await updateCustomer(editingCustomer.id, formData);
      } else {
        console.log('🆕 Adding new customer');
        result = await addCustomer(formData);
      }

      if (result?.success) {
        console.log('✅ Operation successful, closing dialog');
        handleClose();
      } else {
        console.error('❌ Operation failed:', result?.error);
      }
    } catch (error) {
      console.error('💥 Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('🔒 Closing dialog');
    setFormData(defaultCustomerFormData);
    onOpenChange(false);
    if (onClose) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCustomer ? 'تحرير بيانات العميل' : 'إضافة عميل جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="الاسم الكامل"
                />
              </div>

              <div>
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <Label htmlFor="national_id">رقم الهوية *</Label>
                <Input
                  id="national_id"
                  value={formData.national_id}
                  onChange={(e) => handleInputChange('national_id', e.target.value)}
                  required
                  placeholder="1xxxxxxxxx"
                />
              </div>

              <div>
                <Label htmlFor="nationality">الجنسية</Label>
                <Select 
                  value={formData.nationality} 
                  onValueChange={(value) => handleInputChange('nationality', value)}
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
                  onValueChange={(value) => handleInputChange('gender', value)}
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

          {/* License Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">معلومات الرخصة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license_number">رقم رخصة القيادة</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  placeholder="رقم الرخصة"
                />
              </div>

              <div>
                <Label htmlFor="license_expiry">تاريخ انتهاء الرخصة</Label>
                <Input
                  id="license_expiry"
                  type="date"
                  value={formData.license_expiry}
                  onChange={(e) => handleInputChange('license_expiry', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="license_type">نوع الرخصة</Label>
                <Select 
                  value={formData.license_type} 
                  onValueChange={(value) => handleInputChange('license_type', value)}
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
                  onChange={(e) => handleInputChange('license_issue_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">معلومات العنوان</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="اسم المدينة"
                />
              </div>

              <div>
                <Label htmlFor="district">الحي</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="اسم الحي"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">العنوان التفصيلي</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="العنوان التفصيلي..."
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">جهة الاتصال للطوارئ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">اسم جهة الاتصال</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  placeholder="اسم جهة الاتصال"
                />
              </div>

              <div>
                <Label htmlFor="emergency_contact_phone">رقم الهاتف</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  placeholder="05xxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">التفضيلات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms_notifications"
                  checked={formData.sms_notifications}
                  onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
                />
                <Label htmlFor="sms_notifications" className="mr-2">إشعارات SMS</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email_notifications"
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                />
                <Label htmlFor="email_notifications" className="mr-2">إشعارات البريد الإلكتروني</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing_consent"
                  checked={formData.marketing_consent}
                  onCheckedChange={(checked) => handleInputChange('marketing_consent', checked)}
                />
                <Label htmlFor="marketing_consent" className="mr-2">الموافقة على التسويق</Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="أي ملاحظات إضافية عن العميل..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : (editingCustomer ? 'تحديث' : 'إضافة')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
