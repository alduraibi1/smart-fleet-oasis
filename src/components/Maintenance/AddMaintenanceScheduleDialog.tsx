import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useVehicles } from "@/hooks/useVehicles";
import { useToast } from "@/hooks/use-toast";

interface AddMaintenanceScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMaintenanceScheduleDialog = ({ open, onOpenChange }: AddMaintenanceScheduleDialogProps) => {
  const [formData, setFormData] = useState({
    vehicle_id: "",
    template_id: "",
    maintenance_type: "",
    scheduled_date: undefined as Date | undefined,
    scheduled_mileage: "",
    priority: "medium",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const { templates, addMaintenanceSchedule } = useMaintenance();
  const { vehicles } = useVehicles();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicle_id || !formData.maintenance_type || !formData.scheduled_date) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await addMaintenanceSchedule({
        vehicle_id: formData.vehicle_id,
        template_id: formData.template_id || undefined,
        maintenance_type: formData.maintenance_type,
        scheduled_date: formData.scheduled_date.toISOString().split('T')[0],
        scheduled_mileage: formData.scheduled_mileage ? parseInt(formData.scheduled_mileage) : undefined,
        priority: formData.priority,
        notes: formData.notes || undefined
      });

      // Reset form
      setFormData({
        vehicle_id: "",
        template_id: "",
        maintenance_type: "",
        scheduled_date: undefined,
        scheduled_mileage: "",
        priority: "medium",
        notes: ""
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding maintenance schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setFormData(prev => ({ ...prev, template_id: templateId }));
    
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          maintenance_type: template.maintenance_type
        }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>جدولة صيانة جديدة</DialogTitle>
          <DialogDescription>
            إضافة موعد صيانة جديد للمركبة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">المركبة *</Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المركبة" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number} - {vehicle.brand} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_id">قالب الصيانة (اختياري)</Label>
            <Select
              value={formData.template_id}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر قالب الصيانة" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance_type">نوع الصيانة *</Label>
            <Input
              id="maintenance_type"
              value={formData.maintenance_type}
              onChange={(e) => setFormData(prev => ({ ...prev, maintenance_type: e.target.value }))}
              placeholder="أدخل نوع الصيانة"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>التاريخ المجدول *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduled_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_date ? (
                    format(formData.scheduled_date, "PPP", { locale: ar })
                  ) : (
                    <span>اختر التاريخ</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.scheduled_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, scheduled_date: date }))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_mileage">العداد المجدول (اختياري)</Label>
            <Input
              id="scheduled_mileage"
              type="number"
              value={formData.scheduled_mileage}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_mileage: e.target.value }))}
              placeholder="أدخل قراءة العداد"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">الأولوية</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="urgent">عاجلة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="أدخل أي ملاحظات إضافية"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "جاري الحفظ..." : "جدولة الصيانة"}
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