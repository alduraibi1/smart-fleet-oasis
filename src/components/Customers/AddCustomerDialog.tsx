
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerFormData, defaultCustomerFormData } from '@/types/customer';
import { BasicInfoSection } from './CustomerFormSections/BasicInfoSection';
import { AddressInfoSection } from './CustomerFormSections/AddressInfoSection';
import { LicenseInfoSection } from './CustomerFormSections/LicenseInfoSection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, FileText } from 'lucide-react';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(defaultCustomerFormData);

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.phone || !formData.national_id || !formData.nationality) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تعبئة جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          nationality: formData.nationality,
          national_id: formData.national_id,
          gender: formData.gender || null,
          address: formData.address || null,
          city: formData.city || null,
          district: formData.district || null,
          postal_code: formData.postal_code || null,
          license_number: formData.license_number || null,
          license_expiry: formData.license_expiry || null,
          license_type: formData.license_type || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          notes: formData.notes || null,
          is_active: true,
          blacklisted: false,
          rating: 0,
          total_rentals: 0
        }])
        .select();

      if (error) throw error;

      toast({
        title: "تم إضافة العميل بنجاح",
        description: `تم إضافة العميل ${formData.name} بنجاح`,
      });

      // Reset form to default values
      setFormData(defaultCustomerFormData);

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast({
        title: "خطأ في إضافة العميل",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة عميل جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                المعلومات الأساسية
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                معلومات العنوان
              </TabsTrigger>
              <TabsTrigger value="license" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                معلومات الرخصة
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <BasicInfoSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <AddressInfoSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="license" className="space-y-4">
              <LicenseInfoSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? "جاري الإضافة..." : "إضافة العميل"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
