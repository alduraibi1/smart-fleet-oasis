import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IdentityVerificationInput } from "@/components/ui/identity-verification-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin } from "lucide-react";
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
    name: "",
    email: "",
    phone: "",
    national_id: "",
    address: "",
    is_active: true,
  });
  
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isNationalIdValid, setIsNationalIdValid] = useState(false);
  const { phoneDuplicate, idDuplicate, checkPhone, checkNationalId } = useOwnerDuplicateCheck();

  // Check phone for duplicates when valid
  useEffect(() => {
    if (formData.phone && isPhoneValid) {
      checkPhone(formData.phone);
    }
  }, [formData.phone, isPhoneValid, checkPhone]);

  // Check national ID for duplicates when valid
  useEffect(() => {
    if (formData.national_id && isNationalIdValid) {
      checkNationalId(formData.national_id);
    }
  }, [formData.national_id, isNationalIdValid, checkNationalId]);

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
    if (idDuplicate.isDuplicate && idDuplicate.owner) {
      toast({
        title: "⚠️ رقم هوية مكرر",
        description: `رقم الهوية مستخدم من قبل: ${idDuplicate.owner.name}`,
        variant: "destructive",
      });
    }
  }, [idDuplicate.isDuplicate, idDuplicate.owner, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "اسم المالك مطلوب",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    if (phoneDuplicate.isDuplicate) {
      toast({
        title: "خطأ في البيانات",
        description: `رقم الهاتف مستخدم من قبل: ${phoneDuplicate.owner?.name}`,
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

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "خطأ في البيانات",
        description: "البريد الإلكتروني غير صحيح",
        variant: "destructive",
      });
      return;
    }

    // Clean data before saving
    const cleanedData = {
      ...formData,
      phone: formData.phone.replace(/\D/g, ''),
      national_id: formData.national_id.trim(),
    };

    onAdd(cleanedData);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      national_id: "",
      address: "",
      is_active: true,
    });
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
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              اسم المالك *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم المالك"
              required
              className="text-sm"
            />
          </div>

          <IdentityVerificationInput
            label="البريد الإلكتروني"
            validationType="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            showValidationIcon
          />

          <IdentityVerificationInput
            label="رقم الهاتف"
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

          <IdentityVerificationInput
            label="رقم الهوية"
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

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              العنوان
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="أدخل العنوان الكامل"
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