import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useToast } from "@/hooks/use-toast";

interface AddMechanicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMechanicDialog = ({ open, onOpenChange }: AddMechanicDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    employee_id: "",
    phone: "",
    email: "",
    specializations: "",
    hourly_rate: "",
    hire_date: undefined as Date | undefined
  });
  const [loading, setLoading] = useState(false);

  const { addMechanic } = useMaintenance();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "خطأ",
        description: "اسم الميكانيكي مطلوب",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const specializations = formData.specializations
        ? formData.specializations.split(',').map(s => s.trim()).filter(s => s)
        : [];

      await addMechanic({
        name: formData.name,
        employee_id: formData.employee_id || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        specializations: specializations.length > 0 ? specializations : undefined,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        hire_date: formData.hire_date ? formData.hire_date.toISOString().split('T')[0] : undefined
      });

      // Reset form
      setFormData({
        name: "",
        employee_id: "",
        phone: "",
        email: "",
        specializations: "",
        hourly_rate: "",
        hire_date: undefined
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding mechanic:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة ميكانيكي جديد</DialogTitle>
          <DialogDescription>
            إضافة ميكانيكي أو فني جديد إلى الفريق
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="أدخل اسم الميكانيكي"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee_id">كود الموظف</Label>
            <Input
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
              placeholder="أدخل كود الموظف"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specializations">التخصصات (مفصولة بفاصلة)</Label>
            <Input
              id="specializations"
              value={formData.specializations}
              onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
              placeholder="مثال: محركات، فرامل، كهرباء"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_rate">الأجر بالساعة (ريال)</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
              placeholder="أدخل الأجر بالساعة"
            />
          </div>

          <div className="space-y-2">
            <Label>تاريخ التوظيف</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.hire_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.hire_date ? (
                    format(formData.hire_date, "PPP", { locale: ar })
                  ) : (
                    <span>اختر تاريخ التوظيف</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.hire_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, hire_date: date }))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري الحفظ..." : "إضافة الميكانيكي"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};