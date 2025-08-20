
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerFormData, defaultCustomerFormData } from '@/types/customer';
import { BasicInfoSection } from './CustomerFormSections/BasicInfoSection';
import { AddressInfoSection } from './CustomerFormSections/AddressInfoSection';
import { LicenseInfoSection } from './CustomerFormSections/LicenseInfoSection';
import { EmergencyContactSection } from './CustomerFormSections/EmergencyContactSection';
import { GuarantorSection } from './CustomerFormSections/GuarantorSection';
import { DocumentsSection } from './CustomerFormSections/DocumentsSection';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, FileText, Phone, Shield, FolderOpen } from 'lucide-react';
import { convertFormDataToDatabase } from '@/utils/customerUtils';

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
      // Convert form data to database format
      const customerData = convertFormDataToDatabase(formData);

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة عميل جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-1 text-xs">
                <User className="h-3 w-3" />
                أساسي
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                العنوان
              </TabsTrigger>
              <TabsTrigger value="license" className="flex items-center gap-1 text-xs">
                <FileText className="h-3 w-3" />
                الرخصة
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3" />
                طوارئ
              </TabsTrigger>
              <TabsTrigger value="guarantor" className="flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3" />
                كفيل
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1 text-xs">
                <FolderOpen className="h-3 w-3" />
                مستندات
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

            <TabsContent value="emergency" className="space-y-4">
              <EmergencyContactSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="guarantor" className="space-y-4">
              <GuarantorSection 
                formData={formData}
                onInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <DocumentsSection 
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
