import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMaintenanceDialog({ open, onOpenChange }: AddMaintenanceDialogProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    vehicleId: "",
    mechanicId: "",
    type: "",
    description: "",
    laborCost: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.mechanicId || !formData.type || !formData.description) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to backend
    toast({
      title: "تم إضافة سجل الصيانة",
      description: "تم حفظ البيانات بنجاح"
    });
    
    // Reset form
    setFormData({
      vehicleId: "",
      mechanicId: "",
      type: "",
      description: "",
      laborCost: "",
      notes: ""
    });
    setSelectedDate(undefined);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إضافة سجل صيانة جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">المركبة *</Label>
              <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange("vehicleId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">أ ب ج 1234 - تويوتا كامري</SelectItem>
                  <SelectItem value="v2">د هـ و 5678 - نيسان التيما</SelectItem>
                  <SelectItem value="v3">ز ح ط 9012 - هيونداي إلنترا</SelectItem>
                  <SelectItem value="v4">ي ك ل 3456 - كيا أوبتيما</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mechanic Selection */}
            <div className="space-y-2">
              <Label htmlFor="mechanic">الميكانيكي المسؤول *</Label>
              <Select value={formData.mechanicId} onValueChange={(value) => handleInputChange("mechanicId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الميكانيكي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m1">أحمد محمد</SelectItem>
                  <SelectItem value="m2">خالد عبدالله</SelectItem>
                  <SelectItem value="m3">محمد علي</SelectItem>
                  <SelectItem value="m4">سعد الشمري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Maintenance Type */}
            <div className="space-y-2">
              <Label htmlFor="type">نوع الصيانة *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الصيانة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">صيانة دورية</SelectItem>
                  <SelectItem value="breakdown">صيانة طارئة</SelectItem>
                  <SelectItem value="inspection">فحص دوري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>تاريخ الصيانة *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Labor Cost */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="laborCost">تكلفة العمالة (ر.س)</Label>
              <Input
                id="laborCost"
                type="number"
                placeholder="0"
                value={formData.laborCost}
                onChange={(e) => handleInputChange("laborCost", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">وصف الصيانة *</Label>
            <Textarea
              id="description"
              placeholder="اكتب تفاصيل أعمال الصيانة المطلوبة..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات إضافية</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات أو تفاصيل إضافية..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              إلغاء
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              حفظ السجل
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}