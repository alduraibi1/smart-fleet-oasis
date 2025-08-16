
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
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useToast } from '@/hooks/use-toast';

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
  
  const [formData, setFormData] = useState<CustomerFormData>({
    ...defaultCustomerFormData,
    credit_limit: 0
  });

  // تطبيق الحد الائتماني الافتراضي من الإعدادات
  useEffect(() => {
    if (settings.defaultCreditLimit && !editingCustomer) {
      setFormData(prev => ({
        ...prev,
        credit_limit: settings.defaultCreditLimit
      }));
    }
  }, [settings.defaultCreditLimit, editingCustomer]);

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

    try {
      const customerData = {
        ...formData,
        // تحويل الحقول المطلوبة
        nationalId: formData.national_id,
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
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العميل",
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">أساسي</TabsTrigger>
              <TabsTrigger value="license">الرخصة</TabsTrigger>
              <TabsTrigger value="address">العنوان</TabsTrigger>
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
              disabled={addCustomerMutation.isPending}
            >
              {addCustomerMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
