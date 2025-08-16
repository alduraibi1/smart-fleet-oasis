
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer, CustomerFormData, defaultCustomerFormData } from '@/types/customer';
import { convertCustomerToFormData } from '@/utils/customerUtils';
import { useCustomersNew } from '@/hooks/useCustomersNew';
import { BasicInfoSection } from './CustomerFormSections/BasicInfoSection';
import { LicenseInfoSection } from './CustomerFormSections/LicenseInfoSection';
import { AddressInfoSection } from './CustomerFormSections/AddressInfoSection';
import { PreferencesSection } from './CustomerFormSections/PreferencesSection';

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
          <BasicInfoSection 
            formData={formData} 
            onInputChange={handleInputChange} 
          />

          <LicenseInfoSection 
            formData={formData} 
            onInputChange={handleInputChange} 
          />

          <AddressInfoSection 
            formData={formData} 
            onInputChange={handleInputChange} 
          />

          <PreferencesSection 
            formData={formData} 
            onInputChange={handleInputChange} 
          />

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
