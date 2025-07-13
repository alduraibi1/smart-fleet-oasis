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
    <div className="space-y-6">
      {/* Vehicle & Mechanic Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              اختيار المركبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange("vehicleId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{vehicle.plate}</span>
                        <span className="text-muted-foreground">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedVehicle && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>الطراز: {selectedVehicle.brand} {selectedVehicle.model}</div>
                    <div>السنة: {selectedVehicle.year}</div>
                    <div>المسافة المقطوعة: {selectedVehicle.mileage.toLocaleString()} كم</div>
                    <div>رقم اللوحة: {selectedVehicle.plate}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mechanic Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              اختيار الميكانيكي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                <SelectTrigger>
                  <SelectValue placeholder="اختر الميكانيكي" />
                </SelectTrigger>
                <SelectContent>
                  {mechanics.map((mechanic) => (
                    <SelectItem key={mechanic.id} value={mechanic.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mechanic.name}</span>
                        <span className="text-muted-foreground">({mechanic.rate} ر.س/ساعة)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedMechanic && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div>التخصص: {selectedMechanic.specialization}</div>
                    <div>سنوات الخبرة: {selectedMechanic.experience} سنوات</div>
                    <div>أجرة الساعة: {selectedMechanic.rate} ر.س</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            تفاصيل الصيانة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Maintenance Type */}
            <div className="space-y-2">
              <Label>نوع الصيانة *</Label>
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

            {/* Priority */}
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select value={formData.priority} onValueChange={(value: any) => handleInputChange("priority", value)}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>تاريخ الصيانة *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
            <div className="space-y-2">
              <Label>الساعات المقدرة</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={formData.estimatedHours || ""}
                onChange={(e) => handleInputChange("estimatedHours", parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Actual Hours */}
            <div className="space-y-2">
              <Label>ساعات العمل الفعلية</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={formData.laborHours || ""}
                onChange={(e) => handleInputChange("laborHours", parseFloat(e.target.value) || 0)}
              />
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <Label>أجرة الساعة (ر.س)</Label>
              <Input
                type="number"
                min="0"
                placeholder="50"
                value={formData.hourlyRate || ""}
                onChange={(e) => handleInputChange("hourlyRate", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Work Time Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>وقت بداية العمل</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.workStartTime && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formData.workStartTime ? format(formData.workStartTime, "PPpp") : "اختر وقت البداية"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.workStartTime}
                    onSelect={(date) => handleInputChange("workStartTime", date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>وقت انتهاء العمل</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.workEndTime && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formData.workEndTime ? format(formData.workEndTime, "PPpp") : "اختر وقت الانتهاء"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.workEndTime}
                    onSelect={(date) => handleInputChange("workEndTime", date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 mt-4">
            <Label>وصف الصيانة *</Label>
            <Textarea
              placeholder="اكتب تفاصيل أعمال الصيانة المطلوبة..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2 mt-4">
            <Label>ملاحظات إضافية</Label>
            <Textarea
              placeholder="أي ملاحظات أو تفاصيل إضافية..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Priority Alert */}
      {formData.priority === 'urgent' && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">صيانة عاجلة - يتطلب معالجة فورية</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}