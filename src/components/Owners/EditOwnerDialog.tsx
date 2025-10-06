import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, MapPin, CreditCard, Building2 } from "lucide-react";
import { Owner } from "@/hooks/useOwners";
import { useOwnerDuplicateCheck } from "@/hooks/useOwnerDuplicateCheck";
import { IdentityVerificationInput } from "@/components/ui/identity-verification-input";

interface EditOwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: Owner | null;
  onUpdate: (id: string, owner: Partial<Owner>) => void;
}

export const EditOwnerDialog = ({ open, onOpenChange, owner, onUpdate }: EditOwnerDialogProps) => {
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
  } = useOwnerDuplicateCheck(owner?.id);

  useEffect(() => {
    if (owner) {
      setFormData({
        owner_type: owner.owner_type || 'individual',
        name: owner.name || "",
        email: owner.email || "",
        phone: owner.phone || "",
        national_id: owner.national_id || "",
        commercial_registration: owner.commercial_registration || "",
        tax_number: owner.tax_number || "",
        address: owner.address || "",
        is_active: owner.is_active,
      });
    }
  }, [owner]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!owner) return;

    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: formData.owner_type === 'individual' ? "اسم المالك مطلوب" : "اسم المؤسسة مطلوب",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone && phoneDuplicate.isDuplicate) {
      toast({
        title: "خطأ في البيانات",
        description: `رقم الهاتف مستخدم من قبل: ${phoneDuplicate.owner?.name}`,
        variant: "destructive",
      });
      return;
    }

    // Validation for individuals
    if (formData.owner_type === 'individual') {
      if (formData.national_id && idDuplicate.isDuplicate) {
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
      phone: formData.phone ? formData.phone.replace(/\D/g, '') : undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      is_active: formData.is_active,
    };

    if (formData.owner_type === 'individual') {
      cleanedData.national_id = formData.national_id.trim() || undefined;
      cleanedData.commercial_registration = null;
      cleanedData.tax_number = null;
    } else {
      cleanedData.commercial_registration = formData.commercial_registration.trim();
      cleanedData.tax_number = formData.tax_number.trim();
      cleanedData.national_id = null;
    }

    onUpdate(owner.id, cleanedData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">تعديل بيانات المالك</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            قم بتعديل البيانات وحفظ التغييرات
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <RadioGroupItem value="individual" id="edit-individual" />
                <Label htmlFor="edit-individual" className="flex items-center gap-2 cursor-pointer font-normal">
                  <User className="h-4 w-4" />
                  فرد
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="company" id="edit-company" />
                <Label htmlFor="edit-company" className="flex items-center gap-2 cursor-pointer font-normal">
                  <Building2 className="h-4 w-4" />
                  مؤسسة
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              {formData.owner_type === 'individual' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              {formData.owner_type === 'individual' ? 'اسم المالك *' : 'اسم المؤسسة *'}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.owner_type === 'individual' ? 'أدخل اسم المالك' : 'أدخل اسم المؤسسة'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {formData.owner_type === 'company' ? 'البريد الإلكتروني *' : 'البريد الإلكتروني'}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="owner@example.com"
              required={formData.owner_type === 'company'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <IdentityVerificationInput
              id="phone"
              validationType="mobileNumber"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="05xxxxxxxx"
              showValidationIcon
              showSuggestions
              onValidationChange={(isValid) => setIsPhoneValid(isValid)}
              isDuplicate={phoneDuplicate.isDuplicate}
              isChecking={phoneDuplicate.checking}
              duplicateOwner={phoneDuplicate.owner ? {
                id: phoneDuplicate.owner.id,
                name: phoneDuplicate.owner.name,
                phone: phoneDuplicate.owner.phone,
                owner_type: phoneDuplicate.owner.owner_type
              } : undefined}
              verificationType="owner"
              ownerFieldType="phone"
              onSuggestionClick={(value) => setFormData({ ...formData, phone: value })}
            />
          </div>

          {formData.owner_type === 'individual' && (
            <IdentityVerificationInput
              label="رقم الهوية"
              validationType="nationalId"
              nationality="سعودي"
              value={formData.national_id}
              onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
              onValidationChange={(isValid) => setIsNationalIdValid(isValid)}
              isDuplicate={idDuplicate.isDuplicate}
              isChecking={idDuplicate.checking}
              duplicateOwner={idDuplicate.owner ? {
                id: idDuplicate.owner.id,
                name: idDuplicate.owner.name,
                phone: idDuplicate.owner.phone,
                national_id: idDuplicate.owner.national_id,
                owner_type: idDuplicate.owner.owner_type
              } : undefined}
              verificationType="owner"
              ownerFieldType="national_id"
              showValidationIcon
              showSuggestions
            />
          )}

          {formData.owner_type === 'company' && (
            <>
              <IdentityVerificationInput
                label="السجل التجاري *"
                value={formData.commercial_registration}
                onChange={(e) => setFormData({ ...formData, commercial_registration: e.target.value })}
                onValidationChange={(isValid) => setIsCommercialRegValid(isValid)}
                isDuplicate={commercialRegDuplicate.isDuplicate}
                isChecking={commercialRegDuplicate.checking}
                duplicateOwner={commercialRegDuplicate.owner ? {
                  id: commercialRegDuplicate.owner.id,
                  name: commercialRegDuplicate.owner.name,
                  phone: commercialRegDuplicate.owner.phone,
                  commercial_registration: commercialRegDuplicate.owner.commercial_registration,
                  owner_type: commercialRegDuplicate.owner.owner_type
                } : undefined}
                verificationType="owner"
                ownerFieldType="commercial_registration"
                placeholder="أدخل رقم السجل التجاري"
                showValidationIcon
                showSuggestions
              />

              <IdentityVerificationInput
                label="الرقم الضريبي *"
                value={formData.tax_number}
                onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                onValidationChange={(isValid) => setIsTaxNumberValid(isValid)}
                isDuplicate={taxNumberDuplicate.isDuplicate}
                isChecking={taxNumberDuplicate.checking}
                duplicateOwner={taxNumberDuplicate.owner ? {
                  id: taxNumberDuplicate.owner.id,
                  name: taxNumberDuplicate.owner.name,
                  phone: taxNumberDuplicate.owner.phone,
                  tax_number: taxNumberDuplicate.owner.tax_number,
                  owner_type: taxNumberDuplicate.owner.owner_type
                } : undefined}
                verificationType="owner"
                ownerFieldType="tax_number"
                placeholder="أدخل الرقم الضريبي (15 رقم)"
                showValidationIcon
                showSuggestions
              />
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {formData.owner_type === 'company' ? 'العنوان *' : 'العنوان'}
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={formData.owner_type === 'company' ? 'أدخل عنوان المؤسسة' : 'أدخل العنوان الكامل'}
              rows={3}
              required={formData.owner_type === 'company'}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">الحالة النشطة</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              حفظ التغييرات
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
