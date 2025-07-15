import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmartInput } from "@/components/ui/smart-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { Owner } from "@/hooks/useOwners";

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

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "خطأ في البيانات",
        description: "البريد الإلكتروني غير صحيح",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone && !formData.phone.match(/^\+?[\d\s-()]{10,}$/)) {
      toast({
        title: "خطأ في البيانات",
        description: "رقم الهاتف غير صحيح",
        variant: "destructive",
      });
      return;
    }

    onAdd(formData);
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">إضافة مالك جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              اسم المالك *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم المالك"
              required
            />
          </div>

          <SmartInput
            label="البريد الإلكتروني"
            validationType="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            showValidationIcon
          />

          <SmartInput
            label="رقم الهاتف"
            validationType="mobileNumber"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            showValidationIcon
            showSuggestions
          />

          <SmartInput
            label="رقم الهوية/الإقامة"
            validationType="nationalId"
            value={formData.national_id}
            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
            showValidationIcon
            showSuggestions
          />

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              العنوان
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="أدخل العنوان الكامل"
              rows={3}
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
              إضافة المالك
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