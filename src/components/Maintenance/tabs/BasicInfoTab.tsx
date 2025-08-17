
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, User, Wrench, AlertCircle, Clock } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import { useMaintenance } from "@/hooks/useMaintenance";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface BasicInfoTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData) => void;
  onCalculateCosts: () => void;
}

export function BasicInfoTab({ formData, setFormData, onCalculateCosts }: BasicInfoTabProps) {
  const { vehicles } = useVehicles();
  const { mechanics } = useMaintenance();

  const handleFieldChange = (field: keyof MaintenanceFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Auto-calculate costs when relevant fields change
    if (field === 'laborHours' || field === 'hourlyRate') {
      setTimeout(onCalculateCosts, 100);
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

  return (
    <div className="space-y-4">
      {/* Vehicle and Mechanic Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            معلومات المركبة والميكانيكي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">المركبة *</Label>
              <Select value={formData.vehicleId} onValueChange={(value) => handleFieldChange('vehicleId', value)}>
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
              <Label htmlFor="mechanic">الميكانيكي المسؤول *</Label>
              <Select value={formData.mechanicId} onValueChange={(value) => handleFieldChange('mechanicId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الميكانيكي" />
                </SelectTrigger>
                <SelectContent>
                  {mechanics.map((mechanic) => (
                    <SelectItem key={mechanic.id} value={mechanic.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {mechanic.name}
                        {mechanic.hourly_rate && (
                          <span className="text-xs text-muted-foreground">
                            ({mechanic.hourly_rate} ر.س/ساعة)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            تفاصيل الصيانة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">نوع الصيانة *</Label>
              <Select value={formData.type} onValueChange={(value) => handleFieldChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الصيانة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="periodic">صيانة دورية</SelectItem>
                  <SelectItem value="corrective">صيانة إصلاحية</SelectItem>
                  <SelectItem value="preventive">صيانة وقائية</SelectItem>
                  <SelectItem value="emergency">صيانة طوارئ</SelectItem>
                  <SelectItem value="inspection">فحص</SelectItem>
                  <SelectItem value="oil_change">تغيير زيت</SelectItem>
                  <SelectItem value="tire_change">تغيير إطارات</SelectItem>
                  <SelectItem value="brake_service">خدمة الفرامل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <Select value={formData.priority} onValueChange={(value: any) => handleFieldChange('priority', value)}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المشكلة المبلغ عنها *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="اكتب وصفاً مفصلاً للمشكلة أو نوع الصيانة المطلوبة..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule and Odometer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            الجدولة وقراءة العداد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">تاريخ الصيانة *</Label>
              <DatePicker
                date={formData.date}
                onSelect={(date) => handleFieldChange('date', date)}
                placeholder="اختر التاريخ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometerIn">قراءة العداد عند الدخول</Label>
              <Input
                id="odometerIn"
                type="number"
                value={formData.odometerIn || ''}
                onChange={(e) => handleFieldChange('odometerIn', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="كم"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">الساعات المتوقعة</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => handleFieldChange('estimatedHours', parseFloat(e.target.value) || 0)}
                placeholder="ساعات"
                min="0"
                step="0.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            جدولة العمل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workStartTime">وقت بداية العمل</Label>
              <Input
                id="workStartTime"
                type="datetime-local"
                value={formData.workStartTime ? formData.workStartTime.toISOString().slice(0, 16) : ''}
                onChange={(e) => handleFieldChange('workStartTime', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEndTime">وقت انتهاء العمل</Label>
              <Input
                id="workEndTime"
                type="datetime-local"
                value={formData.workEndTime ? formData.workEndTime.toISOString().slice(0, 16) : ''}
                onChange={(e) => handleFieldChange('workEndTime', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ملخص سريع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getPriorityColor(formData.priority)}>
              {formData.priority === 'urgent' && 'عاجل'}
              {formData.priority === 'high' && 'عالي'}
              {formData.priority === 'medium' && 'متوسط'}
              {formData.priority === 'low' && 'منخفض'}
            </Badge>
            {formData.type && (
              <Badge variant="outline">{formData.type}</Badge>
            )}
            {formData.estimatedHours > 0 && (
              <Badge variant="secondary">{formData.estimatedHours} ساعة</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
