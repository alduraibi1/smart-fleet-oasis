import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, User, Car, Wrench, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface BasicInfoTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData | ((prev: MaintenanceFormData) => MaintenanceFormData)) => void;
  onCalculateCosts: () => void;
}

export function BasicInfoTab({ formData, setFormData, onCalculateCosts }: BasicInfoTabProps) {
  const handleInputChange = (field: keyof MaintenanceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'laborHours' || field === 'hourlyRate') {
      setTimeout(onCalculateCosts, 0);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  // Mock data for vehicles and mechanics
  const vehicles = [
    { id: 'v1', plate: 'أ ب ج 1234', brand: 'تويوتا', model: 'كامري', year: 2020, mileage: 85000 },
    { id: 'v2', plate: 'د هـ و 5678', brand: 'نيسان', model: 'التيما', year: 2019, mileage: 92000 },
    { id: 'v3', plate: 'ز ح ط 9012', brand: 'هيونداي', model: 'إلنترا', year: 2021, mileage: 45000 },
    { id: 'v4', plate: 'ي ك ل 3456', brand: 'كيا', model: 'أوبتيما', year: 2022, mileage: 32000 },
  ];

  const mechanics = [
    { id: 'm1', name: 'أحمد محمد', specialization: 'محركات وناقل الحركة', rate: 45, experience: 8 },
    { id: 'm2', name: 'خالد عبدالله', specialization: 'فرامل وتعليق', rate: 50, experience: 12 },
    { id: 'm3', name: 'محمد علي', specialization: 'كهرباء ونظام التبريد', rate: 55, experience: 10 },
    { id: 'm4', name: 'سعد الشمري', specialization: 'صيانة شاملة', rate: 40, experience: 6 },
  ];

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
  const selectedMechanic = mechanics.find(m => m.id === formData.mechanicId);

  return (
    <div className="space-y-4">
      {/* Vehicle & Mechanic Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vehicle Selection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-4 w-4" />
              اختيار المركبة
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange("vehicleId", value)}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{vehicle.plate}</span>
                        <span className="text-muted-foreground text-xs">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedVehicle && (
                <div className="bg-muted/50 p-2 rounded text-xs">
                  <div className="grid grid-cols-2 gap-1">
                    <div>الطراز: {selectedVehicle.brand} {selectedVehicle.model}</div>
                    <div>السنة: {selectedVehicle.year}</div>
                    <div>المسافة: {selectedVehicle.mileage.toLocaleString()} كم</div>
                    <div>اللوحة: {selectedVehicle.plate}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mechanic Selection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              اختيار الميكانيكي
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <Select 
                value={formData.mechanicId} 
                onValueChange={(value) => {
                  const mechanic = mechanics.find(m => m.id === value);
                  handleInputChange("mechanicId", value);
                  if (mechanic) {
                    handleInputChange("hourlyRate", mechanic.rate);
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="اختر الميكانيكي" />
                </SelectTrigger>
                <SelectContent>
                  {mechanics.map((mechanic) => (
                    <SelectItem key={mechanic.id} value={mechanic.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mechanic.name}</span>
                        <span className="text-muted-foreground text-xs">({mechanic.rate} ر.س/ساعة)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedMechanic && (
                <div className="bg-muted/50 p-2 rounded text-xs">
                  <div className="space-y-1">
                    <div>التخصص: {selectedMechanic.specialization}</div>
                    <div>الخبرة: {selectedMechanic.experience} سنوات</div>
                    <div>الأجرة: {selectedMechanic.rate} ر.س/ساعة</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4" />
            تفاصيل الصيانة
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Maintenance Type */}
            <div className="space-y-1">
              <Label className="text-xs">نوع الصيانة *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="اختر نوع الصيانة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">صيانة دورية</SelectItem>
                  <SelectItem value="breakdown">صيانة طارئة</SelectItem>
                  <SelectItem value="inspection">فحص دوري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label className="text-xs">الأولوية</Label>
              <Select value={formData.priority} onValueChange={(value: any) => handleInputChange("priority", value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="urgent">عاجل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label className="text-xs">تاريخ الصيانة *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-8 text-xs",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {formData.date ? format(formData.date, "PPP") : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleInputChange("date", date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-1">
              <Label className="text-xs">الساعات المقدرة</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                className="h-8"
                value={formData.estimatedHours || ""}
                onChange={(e) => handleInputChange("estimatedHours", parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Actual Hours */}
            <div className="space-y-1">
              <Label className="text-xs">ساعات العمل الفعلية</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                className="h-8"
                value={formData.laborHours || ""}
                onChange={(e) => handleInputChange("laborHours", parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Hourly Rate */}
            <div className="space-y-1">
              <Label className="text-xs">أجرة الساعة (ر.س)</Label>
              <Input
                type="number"
                min="0"
                placeholder="50"
                className="h-8"
                value={formData.hourlyRate || ""}
                onChange={(e) => handleInputChange("hourlyRate", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 mt-3 col-span-full">
            <Label className="text-xs">وصف الصيانة *</Label>
            <Textarea
              placeholder="اكتب تفاصيل أعمال الصيانة المطلوبة..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1 mt-2 col-span-full">
            <Label className="text-xs">ملاحظات إضافية</Label>
            <Textarea
              placeholder="أي ملاحظات أو تفاصيل إضافية..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={1}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Priority Alert */}
      {formData.priority === 'urgent' && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium text-sm">صيانة عاجلة - يتطلب معالجة فورية</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}