
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/types';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer?: Customer | null;
  onClose?: () => void;
}

export function AddCustomerDialog({ 
  open, 
  onOpenChange, 
  editingCustomer = null, 
  onClose 
}: AddCustomerDialogProps) {
  const { toast } = useToast();
  const { addCustomer, updateCustomer } = useCustomers();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    national_id: '',
    nationality: 'سعودي',
    city: '',
    address: '',
    license_number: '',
    license_expiry: '',
    gender: 'male',
    marital_status: 'single',
    date_of_birth: '',
    license_type: 'private',
    license_issue_date: '',
    international_license: false,
    international_license_expiry: '',
    country: 'السعودية',
    district: '',
    postal_code: '',
    address_type: 'residential',
    preferred_language: 'ar',
    marketing_consent: false,
    sms_notifications: true,
    email_notifications: true,
    customer_source: 'website',
    job_title: '',
    company: '',
    work_phone: '',
    monthly_income: 0,
    bank_name: '',
    account_number: '',
    credit_limit: 0,
    payment_terms: 'immediate',
    preferred_payment_method: 'cash',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    has_insurance: false,
    insurance_company: '',
    insurance_policy_number: '',
    insurance_expiry: '',
    notes: ''
  });

  // Load editing customer data when dialog opens
  useEffect(() => {
    if (editingCustomer && open) {
      setFormData({
        name: editingCustomer.name || '',
        phone: editingCustomer.phone || '',
        email: editingCustomer.email || '',
        national_id: editingCustomer.national_id || '',
        nationality: editingCustomer.nationality || 'سعودي',
        city: editingCustomer.city || '',
        address: editingCustomer.address || '',
        license_number: editingCustomer.license_number || '',
        license_expiry: editingCustomer.license_expiry ? 
          new Date(editingCustomer.license_expiry).toISOString().split('T')[0] : '',
        gender: editingCustomer.gender || 'male',
        marital_status: editingCustomer.marital_status || 'single',
        date_of_birth: editingCustomer.date_of_birth ? 
          new Date(editingCustomer.date_of_birth).toISOString().split('T')[0] : '',
        license_type: editingCustomer.license_type || 'private',
        license_issue_date: editingCustomer.license_issue_date ? 
          new Date(editingCustomer.license_issue_date).toISOString().split('T')[0] : '',
        international_license: editingCustomer.international_license || false,
        international_license_expiry: editingCustomer.international_license_expiry ? 
          new Date(editingCustomer.international_license_expiry).toISOString().split('T')[0] : '',
        country: editingCustomer.country || 'السعودية',
        district: editingCustomer.district || '',
        postal_code: editingCustomer.postal_code || '',
        address_type: editingCustomer.address_type || 'residential',
        preferred_language: editingCustomer.preferred_language || 'ar',
        marketing_consent: editingCustomer.marketing_consent || false,
        sms_notifications: editingCustomer.sms_notifications !== false,
        email_notifications: editingCustomer.email_notifications !== false,
        customer_source: editingCustomer.customer_source || 'website',
        job_title: editingCustomer.job_title || '',
        company: editingCustomer.company || '',
        work_phone: editingCustomer.work_phone || '',
        monthly_income: editingCustomer.monthly_income || 0,
        bank_name: editingCustomer.bank_name || '',
        account_number: editingCustomer.account_number || '',
        credit_limit: editingCustomer.credit_limit || 0,
        payment_terms: editingCustomer.payment_terms || 'immediate',
        preferred_payment_method: editingCustomer.preferred_payment_method || 'cash',
        emergency_contact_name: editingCustomer.emergency_contact_name || '',
        emergency_contact_phone: editingCustomer.emergency_contact_phone || '',
        emergency_contact_relation: editingCustomer.emergency_contact_relation || '',
        has_insurance: editingCustomer.has_insurance || false,
        insurance_company: editingCustomer.insurance_company || '',
        insurance_policy_number: editingCustomer.insurance_policy_number || '',
        insurance_expiry: editingCustomer.insurance_expiry ? 
          new Date(editingCustomer.insurance_expiry).toISOString().split('T')[0] : '',
        notes: editingCustomer.notes || ''
      });
    } else if (!editingCustomer && open) {
      // Reset form for new customer
      setFormData({
        name: '',
        phone: '',
        email: '',
        national_id: '',
        nationality: 'سعودي',
        city: '',
        address: '',
        license_number: '',
        license_expiry: '',
        gender: 'male',
        marital_status: 'single',
        date_of_birth: '',
        license_type: 'private',
        license_issue_date: '',
        international_license: false,
        international_license_expiry: '',
        country: 'السعودية',
        district: '',
        postal_code: '',
        address_type: 'residential',
        preferred_language: 'ar',
        marketing_consent: false,
        sms_notifications: true,
        email_notifications: true,
        customer_source: 'website',
        job_title: '',
        company: '',
        work_phone: '',
        monthly_income: 0,
        bank_name: '',
        account_number: '',
        credit_limit: 0,
        payment_terms: 'immediate',
        preferred_payment_method: 'cash',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        has_insurance: false,
        insurance_company: '',
        insurance_policy_number: '',
        insurance_expiry: '',
        notes: ''
      });
    }
  }, [editingCustomer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.national_id) {
      toast({
        title: "بيانات مفقودة",
        description: "يرجى ملء الحقول الأساسية (الاسم، الهاتف، رقم الهوية)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (editingCustomer) {
        // Update existing customer
        result = await updateCustomer(editingCustomer.id, formData);
      } else {
        // Add new customer
        result = await addCustomer(formData);
      }

      if (result.success) {
        toast({
          title: editingCustomer ? "تم التحديث" : "تم الإضافة",
          description: editingCustomer ? 
            "تم تحديث بيانات العميل بنجاح" : 
            "تم إضافة العميل الجديد بنجاح"
        });
        
        handleClose();
      } else {
        throw new Error(result.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "خطأ",
        description: editingCustomer ? 
          "حدث خطأ أثناء تحديث بيانات العميل" : 
          "حدث خطأ أثناء إضافة العميل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (onClose) {
      onClose();
    }
  };

  const handleInputChange = (field: string, value: any) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">الاسم الكامل *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="national_id">رقم الهوية *</Label>
              <Input
                id="national_id"
                value={formData.national_id}
                onChange={(e) => handleInputChange('national_id', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="nationality">الجنسية</Label>
              <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="سعودي">سعودي</SelectItem>
                  <SelectItem value="مصري">مصري</SelectItem>
                  <SelectItem value="يمني">يمني</SelectItem>
                  <SelectItem value="سوري">سوري</SelectItem>
                  <SelectItem value="أردني">أردني</SelectItem>
                  <SelectItem value="لبناني">لبناني</SelectItem>
                  <SelectItem value="فلسطيني">فلسطيني</SelectItem>
                  <SelectItem value="باكستاني">باكستاني</SelectItem>
                  <SelectItem value="بنغلاديشي">بنغلاديشي</SelectItem>
                  <SelectItem value="هندي">هندي</SelectItem>
                  <SelectItem value="فلبيني">فلبيني</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gender">الجنس</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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

          {/* License Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="license_number">رقم رخصة القيادة</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
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
              <Select value={formData.license_type} onValueChange={(value) => handleInputChange('license_type', value)}>
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

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="district">الحي</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">العنوان التفصيلي</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency_contact_name">اسم جهة الاتصال للطوارئ</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone">رقم هاتف الطوارئ</Label>
              <Input
                id="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms_notifications"
                checked={formData.sms_notifications}
                onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
              />
              <Label htmlFor="sms_notifications">إشعارات SMS</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="email_notifications"
                checked={formData.email_notifications}
                onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
              />
              <Label htmlFor="email_notifications">إشعارات البريد الإلكتروني</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketing_consent"
                checked={formData.marketing_consent}
                onCheckedChange={(checked) => handleInputChange('marketing_consent', checked)}
              />
              <Label htmlFor="marketing_consent">الموافقة على التسويق</Label>
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
            <Button type="button" variant="outline" onClick={handleClose}>
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

export default AddCustomerDialog;
