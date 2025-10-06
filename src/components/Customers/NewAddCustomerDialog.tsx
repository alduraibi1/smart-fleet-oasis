
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAddCustomer } from '@/hooks/useCustomersQuery';
import { Customer, CustomerFormData, defaultCustomerFormData } from '@/types/customer';
import { BasicInfoSection } from './CustomerFormSections/BasicInfoSection';
import { LicenseInfoSection } from './CustomerFormSections/LicenseInfoSection';
import { AddressInfoSection } from './CustomerFormSections/AddressInfoSection';
import { CreditInfoSection } from './CustomerFormSections/CreditInfoSection';
import { BankingInfoSection } from './CustomerFormSections/BankingInfoSection';
import { PreferencesSection } from './CustomerFormSections/PreferencesSection';
import { EmergencyContactSection } from './CustomerFormSections/EmergencyContactSection';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useToast } from '@/hooks/use-toast';
import { useCustomerDuplicateCheck } from '@/hooks/useCustomerDuplicateCheck';
import { handleSaveError } from '@/lib/duplicateErrorHandler';

interface NewAddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer?: Customer | null;
  onClose: () => void;
}

export function NewAddCustomerDialog({ 
  open, 
  onOpenChange, 
  editingCustomer, 
  onClose 
}: NewAddCustomerDialogProps) {
  const { toast } = useToast();
  const { settings } = useSystemSettings();
  const addCustomerMutation = useAddCustomer();
  const { phoneDuplicate, idDuplicate, checkPhone, checkNationalId } = useCustomerDuplicateCheck(editingCustomer?.id);
  
  const [formData, setFormData] = useState<CustomerFormData>({
    ...defaultCustomerFormData,
    credit_limit: 0
  });

  // تطبيق الحد الائتماني الافتراضي من الإعدادات
  useEffect(() => {
    if (settings?.defaultCreditLimit && !editingCustomer) {
      setFormData(prev => ({
        ...prev,
        credit_limit: settings.defaultCreditLimit
      }));
    }
  }, [settings?.defaultCreditLimit, editingCustomer]);

  // التحقق من تكرار رقم الهاتف
  useEffect(() => {
    if (formData.phone) {
      checkPhone(formData.phone);
    }
  }, [formData.phone, checkPhone]);

  // التحقق من تكرار رقم الهوية
  useEffect(() => {
    if (formData.national_id) {
      checkNationalId(formData.national_id);
    }
  }, [formData.national_id, checkNationalId]);

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.national_id) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    // التحقق من التكرارات قبل الحفظ
    if (phoneDuplicate.isDuplicate) {
      toast({
        title: "بيانات مكررة",
        description: "رقم الهاتف مستخدم مسبقاً",
        variant: "destructive",
      });
      return;
    }
    
    if (idDuplicate.isDuplicate) {
      toast({
        title: "بيانات مكررة",
        description: "رقم الهوية مستخدم مسبقاً",
        variant: "destructive",
      });
      return;
    }

    try {
      // تنظيف البيانات قبل الحفظ
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      const cleanedNationalId = formData.national_id.trim();
      
      const customerData = {
        ...formData,
        phone: cleanedPhone,
        national_id: cleanedNationalId,
        // تحويل الحقول المطلوبة
        nationalId: cleanedNationalId,
        licenseNumber: formData.license_number,
        licenseExpiry: formData.license_expiry ? new Date(formData.license_expiry) : new Date(),
        totalRentals: 0,
        blacklistReason: '',
        blacklistDate: undefined,
        documents: [],
        is_active: true,
        blacklisted: false,
        rating: 5,
        total_rentals: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await addCustomerMutation.mutateAsync(customerData as any);
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة العميل بنجاح",
      });
      
      onClose();
      setFormData(defaultCustomerFormData);
    } catch (error) {
      console.error('Error adding customer:', error);
      const errorInfo = handleSaveError(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="basic">أساسي</TabsTrigger>
              <TabsTrigger value="license">الرخصة</TabsTrigger>
              <TabsTrigger value="address">العنوان</TabsTrigger>
              <TabsTrigger value="emergency">الطوارئ</TabsTrigger>
              <TabsTrigger value="credit">الائتمان</TabsTrigger>
              <TabsTrigger value="banking">البنكية</TabsTrigger>
              <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfoSection 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
            </TabsContent>

            <TabsContent value="license">
              <LicenseInfoSection 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
            </TabsContent>

            <TabsContent value="address">
              <AddressInfoSection 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
            </TabsContent>

            <TabsContent value="emergency">
              <EmergencyContactSection 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
            </TabsContent>

            <TabsContent value="credit">
              <CreditInfoSection 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
            </TabsContent>

            <TabsContent value="banking">
              <BankingInfoSection 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesSection 
                formData={formData} 
                onInputChange={handleInputChange} 
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={
                addCustomerMutation.isPending || 
                phoneDuplicate.isDuplicate || 
                idDuplicate.isDuplicate || 
                phoneDuplicate.checking || 
                idDuplicate.checking
              }
            >
              {addCustomerMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
