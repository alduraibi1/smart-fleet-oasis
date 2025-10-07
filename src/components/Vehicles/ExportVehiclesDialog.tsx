import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileSpreadsheet, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToElmFormat, exportExpiringReport, exportCustomReport, exportFleetSummary } from '@/utils/vehicleExportUtils';
import type { Vehicle } from '@/types/vehicle';

interface ExportVehiclesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
}

export function ExportVehiclesDialog({ open, onOpenChange, vehicles }: ExportVehiclesDialogProps) {
  const { toast } = useToast();
  const [exportType, setExportType] = useState<'elm' | 'custom' | 'expiring' | 'summary'>('elm');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'plate_number',
    'brand',
    'model',
    'year',
    'status',
    'daily_rate'
  ]);

  const availableFields = [
    { id: 'plate_number', label: 'رقم اللوحة' },
    { id: 'brand', label: 'الماركة' },
    { id: 'model', label: 'الطراز' },
    { id: 'year', label: 'سنة الصنع' },
    { id: 'color', label: 'اللون' },
    { id: 'status', label: 'الحالة' },
    { id: 'daily_rate', label: 'السعر اليومي' },
    { id: 'mileage', label: 'الكيلومترات' },
    { id: 'vin', label: 'رقم الهيكل' },
    { id: 'owner_name', label: 'اسم المالك' },
    { id: 'registration_type', label: 'نوع التسجيل' },
    { id: 'inspection_expiry', label: 'تاريخ انتهاء الفحص' },
    { id: 'insurance_expiry', label: 'تاريخ انتهاء التأمين' },
    { id: 'registration_expiry', label: 'تاريخ انتهاء رخصة السير' },
    { id: 'renewal_fees', label: 'رسوم التجديد' },
    { id: 'fuel_type', label: 'نوع الوقود' },
    { id: 'transmission', label: 'ناقل الحركة' },
    { id: 'seating_capacity', label: 'عدد المقاعد' },
  ];

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExport = () => {
    if (!vehicles.length) {
      toast({
        title: 'تحذير',
        description: 'لا توجد مركبات للتصدير',
        variant: 'destructive',
      });
      return;
    }

    let result;
    switch (exportType) {
      case 'elm':
        result = exportToElmFormat(vehicles);
        break;
      case 'expiring':
        result = exportExpiringReport(vehicles, 30);
        break;
      case 'summary':
        result = exportFleetSummary(vehicles);
        break;
      case 'custom':
        if (selectedFields.length === 0) {
          toast({
            title: 'تحذير',
            description: 'يرجى اختيار حقل واحد على الأقل',
            variant: 'destructive',
          });
          return;
        }
        result = exportCustomReport(vehicles, selectedFields);
        break;
    }

    if (result.success) {
      toast({
        title: 'تم التصدير بنجاح',
        description: `تم تصدير ${result.count} مركبة`,
      });
      onOpenChange(false);
    } else {
      toast({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير البيانات',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            تصدير المركبات
          </DialogTitle>
          <DialogDescription>
            اختر نوع التقرير والحقول المراد تصديرها
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>نوع التقرير</Label>
            <RadioGroup value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="elm" id="elm" />
                <Label htmlFor="elm" className="cursor-pointer font-normal">
                  تنسيق علم الأصلي (كامل البيانات)
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="expiring" id="expiring" />
                <Label htmlFor="expiring" className="cursor-pointer font-normal">
                  تقرير الانتهاءات القريبة (30 يوم)
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="summary" id="summary" />
                <Label htmlFor="summary" className="cursor-pointer font-normal">
                  ملخص الأسطول (إحصائيات شاملة)
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer font-normal">
                  تقرير مخصص (اختر الحقول)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {exportType === 'custom' && (
            <div className="space-y-3">
              <Label>الحقول المراد تصديرها</Label>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="grid grid-cols-2 gap-3">
                  {availableFields.map(field => (
                    <div key={field.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={field.id}
                        checked={selectedFields.includes(field.id)}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                      />
                      <Label htmlFor={field.id} className="cursor-pointer font-normal">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>عدد المركبات:</strong> {vehicles.length}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              تصدير
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
