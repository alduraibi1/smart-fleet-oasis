import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IdentityVerificationInput } from "@/components/ui/identity-verification-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, MapPin } from "lucide-react";
import { Owner } from "@/hooks/useOwners";
import { useOwnerDuplicateCheck } from "@/hooks/useOwnerDuplicateCheck";

interface AddOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (owner: Omit<Owner, 'id' | 'created_at' | 'updated_at' | 'vehicle_count'>) => void;
}

export const AddOwnerDialog = ({ open, onOpenChange, onAdd }: AddOwnerDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    owner_type: 'individual' as 'individual' | 'company',
    name: "",
    email: "",
    phone: "",
    national_id: "",
    commercial_registration: "",
    tax_number: "",
    address: "",
    is_active: true,
  });
  
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isNationalIdValid, setIsNationalIdValid] = useState(false);
  const [isCommercialRegValid, setIsCommercialRegValid] = useState(false);
  const [isTaxNumberValid, setIsTaxNumberValid] = useState(false);
  
  const { 
    phoneDuplicate, 
    idDuplicate, 
    commercialRegDuplicate,
    taxNumberDuplicate,
    checkPhone, 
    checkNationalId,
    checkCommercialRegistration,
    checkTaxNumber
  } = useOwnerDuplicateCheck();

  // Check phone for duplicates when valid
  useEffect(() => {
    if (formData.phone && isPhoneValid) {
      checkPhone(formData.phone);
    }
  }, [formData.phone, isPhoneValid, checkPhone]);

  // Check national ID for duplicates when valid (only for individuals)
  useEffect(() => {
    if (formData.national_id && isNationalIdValid && formData.owner_type === 'individual') {
      checkNationalId(formData.national_id);
    }
  }, [formData.national_id, isNationalIdValid, formData.owner_type, checkNationalId]);

  // Check commercial registration for duplicates when valid (only for companies)
  useEffect(() => {
    if (formData.commercial_registration && isCommercialRegValid && formData.owner_type === 'company') {
      checkCommercialRegistration(formData.commercial_registration);
    }
  }, [formData.commercial_registration, isCommercialRegValid, formData.owner_type, checkCommercialRegistration]);

  // Check tax number for duplicates when valid (only for companies)
  useEffect(() => {
    if (formData.tax_number && isTaxNumberValid && formData.owner_type === 'company') {
      checkTaxNumber(formData.tax_number);
    }
  }, [formData.tax_number, isTaxNumberValid, formData.owner_type, checkTaxNumber]);

  // Show toast when duplicate phone is detected
  useEffect(() => {
    if (phoneDuplicate.isDuplicate && phoneDuplicate.owner) {
      toast({
        title: "⚠️ رقم هاتف مكرر",
        description: `رقم الهاتف مستخدم من قبل: ${phoneDuplicate.owner.name}`,
        variant: "destructive",
      });
    }
  }, [phoneDuplicate.isDuplicate, phoneDuplicate.owner, toast]);

  // Show toast when duplicate national ID is detected
  useEffect(() => {
    if (idDuplicate.isDuplicate && idDuplicate.owner && formData.owner_type === 'individual') {
      toast({
        title: "⚠️ رقم هوية مكرر",
        description: `رقم الهوية مستخدم من قبل: ${idDuplicate.owner.name}`,
        variant: "destructive",
      });
    }
  }, [idDuplicate.isDuplicate, idDuplicate.owner, formData.owner_type, toast]);

  // Show toast when duplicate commercial registration is detected
  useEffect(() => {
    if (commercialRegDuplicate.isDuplicate && commercialRegDuplicate.owner && formData.owner_type === 'company') {
      toast({
        title: "⚠️ سجل تجاري مكرر",
        description: `السجل التجاري مستخدم من قبل: ${commercialRegDuplicate.owner.name}`,
        variant: "destructive",
      });
    }
  }, [commercialRegDuplicate.isDuplicate, commercialRegDuplicate.owner, formData.owner_type, toast]);

  // Show toast when duplicate tax number is detected
  useEffect(() => {
    if (taxNumberDuplicate.isDuplicate && taxNumberDuplicate.owner && formData.owner_type === 'company') {
      toast({
        title: "⚠️ رقم ضريبي مكرر",
        description: `الرقم الضريبي مستخدم من قبل: ${taxNumberDuplicate.owner.name}`,
        variant: "destructive",
      });
    }
  }, [taxNumberDuplicate.isDuplicate, taxNumberDuplicate.owner, formData.owner_type, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: formData.owner_type === 'individual' ? "اسم المالك مطلوب" : "اسم المؤسسة مطلوب",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "رقم الهاتف مطلوب",
        variant: "destructive",
      });
      return;
    }

    // Check for phone duplicate
    if (phoneDuplicate.isDuplicate) {
      toast({
        title: "خطأ في البيانات",
        description: `رقم الهاتف مستخدم من قبل: ${phoneDuplicate.owner?.name}`,
        variant: "destructive",
      });
      return;
    }

    // Validation for individuals
    if (formData.owner_type === 'individual') {
      if (!formData.national_id.trim()) {
        toast({
          title: "خطأ في البيانات",
          description: "رقم الهوية مطلوب للأفراد",
          variant: "destructive",
        });
        return;
      }

      if (idDuplicate.isDuplicate) {
        toast({
          title: "خطأ في البيانات",
          description: `رقم الهوية مستخدم من قبل: ${idDuplicate.owner?.name}`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validation for companies
    if (formData.owner_type === 'company') {
      if (!formData.commercial_registration.trim()) {
        toast({
          title: "خطأ في البيانات",
          description: "السجل التجاري مطلوب للمؤسسات",
          variant: "destructive",
        });
        return;
      }

      if (!formData.tax_number.trim()) {
        toast({
          title: "خطأ في البيانات",
          description: "الرقم الضريبي مطلوب للمؤسسات",
          variant: "destructive",
        });
        return;
      }

      if (!formData.email.trim()) {
        toast({
          title: "خطأ في البيانات",
          description: "البريد الإلكتروني مطلوب للمؤسسات",
          variant: "destructive",
        });
        return;
      }

      if (!formData.address.trim()) {
        toast({
          title: "خطأ في البيانات",
          description: "العنوان مطلوب للمؤسسات",
          variant: "destructive",
        });
        return;
      }

      if (commercialRegDuplicate.isDuplicate) {
        toast({
          title: "خطأ في البيانات",
          description: `السجل التجاري مستخدم من قبل: ${commercialRegDuplicate.owner?.name}`,
          variant: "destructive",
        });
        return;
      }

      if (taxNumberDuplicate.isDuplicate) {
        toast({
          title: "خطأ في البيانات",
          description: `الرقم الضريبي مستخدم من قبل: ${taxNumberDuplicate.owner?.name}`,
          variant: "destructive",
        });
        return;
      }
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "خطأ في البيانات",
        description: "البريد الإلكتروني غير صحيح",
        variant: "destructive",
      });
      return;
    }

    // Clean data before saving
    const cleanedData: any = {
      owner_type: formData.owner_type,
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ''),
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      is_active: formData.is_active,
    };

    if (formData.owner_type === 'individual') {
      cleanedData.national_id = formData.national_id.trim();
    } else {
      cleanedData.commercial_registration = formData.commercial_registration.trim();
      cleanedData.tax_number = formData.tax_number.trim();
    }

    onAdd(cleanedData);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      owner_type: 'individual',
      name: "",
      email: "",
      phone: "",
      national_id: "",
      commercial_registration: "",
      tax_number: "",
      address: "",
      is_active: true,
    });
    setIsPhoneValid(false);
    setIsNationalIdValid(false);
    setIsCommercialRegValid(false);
    setIsTaxNumberValid(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm md:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">إضافة مالك جديد</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            قم بملء البيانات المطلوبة لإضافة مالك جديد للنظام
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label>نوع المالك *</Label>
            <RadioGroup 
              value={formData.owner_type} 
              onValueChange={(value: 'individual' | 'company') => 
                setFormData({ ...formData, owner_type: value })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer font-normal">
                  <User className="h-4 w-4" />
                  فرد
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Building2 className="h-4 w-4" />
                  مؤسسة
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm">
              {formData.owner_type === 'individual' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              {formData.owner_type === 'individual' ? 'اسم المالك *' : 'اسم المؤسسة *'}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.owner_type === 'individual' ? 'أدخل اسم المالك' : 'أدخل اسم المؤسسة'}
              required
              className="text-sm"
            />
          </div>

          <IdentityVerificationInput
            label={formData.owner_type === 'company' ? 'البريد الإلكتروني *' : 'البريد الإلكتروني'}
            validationType="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            showValidationIcon
          />

          <IdentityVerificationInput
            label="رقم الهاتف *"
            validationType="mobileNumber"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            onValidationChange={(isValid) => setIsPhoneValid(isValid)}
            isDuplicate={phoneDuplicate.isDuplicate}
            isChecking={phoneDuplicate.checking}
            duplicateCustomer={phoneDuplicate.owner ? {
              id: phoneDuplicate.owner.id,
              name: phoneDuplicate.owner.name,
              phone: phoneDuplicate.owner.phone
            } : undefined}
            showValidationIcon
            showSuggestions
          />

          {formData.owner_type === 'individual' && (
            <IdentityVerificationInput
              label="رقم الهوية *"
              validationType="nationalId"
              nationality="سعودي"
              value={formData.national_id}
              onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
              onValidationChange={(isValid) => setIsNationalIdValid(isValid)}
              isDuplicate={idDuplicate.isDuplicate}
              isChecking={idDuplicate.checking}
              duplicateCustomer={idDuplicate.owner ? {
                id: idDuplicate.owner.id,
                name: idDuplicate.owner.name,
                national_id: idDuplicate.owner.national_id
              } : undefined}
              showValidationIcon
              showSuggestions
            />
          )}

          {formData.owner_type === 'company' && (
            <>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="commercial_registration" className="text-sm">
                  السجل التجاري *
                </Label>
                <Input
                  id="commercial_registration"
                  value={formData.commercial_registration}
                  onChange={(e) => {
                    setFormData({ ...formData, commercial_registration: e.target.value });
                    setIsCommercialRegValid(e.target.value.trim().length > 0);
                  }}
                  placeholder="أدخل رقم السجل التجاري"
                  required
                  className="text-sm"
                />
                {commercialRegDuplicate.isDuplicate && (
                  <p className="text-xs text-destructive">
                    السجل التجاري مستخدم من قبل: {commercialRegDuplicate.owner?.name}
                  </p>
                )}
                {commercialRegDuplicate.checking && (
                  <p className="text-xs text-muted-foreground">جاري التحقق...</p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="tax_number" className="text-sm">
                  الرقم الضريبي *
                </Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => {
                    setFormData({ ...formData, tax_number: e.target.value });
                    setIsTaxNumberValid(e.target.value.trim().length > 0);
                  }}
                  placeholder="أدخل الرقم الضريبي (15 رقم)"
                  required
                  className="text-sm"
                />
                {taxNumberDuplicate.isDuplicate && (
                  <p className="text-xs text-destructive">
                    الرقم الضريبي مستخدم من قبل: {taxNumberDuplicate.owner?.name}
                  </p>
                )}
                {taxNumberDuplicate.checking && (
                  <p className="text-xs text-muted-foreground">جاري التحقق...</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {formData.owner_type === 'company' ? 'العنوان *' : 'العنوان'}
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={formData.owner_type === 'company' ? 'أدخل عنوان المؤسسة' : 'أدخل العنوان الكامل'}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="is_active" className="text-sm">الحالة النشطة</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" className="flex-1 text-sm">
              إضافة المالك
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 text-sm"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
