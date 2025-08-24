
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Search,
  Plus,
  Trash2,
  MapPin,
  CheckCircle,
  AlertCircle,
  Car
} from "lucide-react";
import { useTrackerSync } from "@/hooks/useTrackerSync";
import { useToast } from "@/hooks/use-toast";
import { useVehicles } from "@/hooks/useVehicles";

interface ManualDevice {
  id: string;
  plate: string;
  trackerId: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  matchedVehicle?: {
    id: string;
    plate: string;
    brand: string;
    model: string;
  };
  confidence?: number;
}

interface EnhancedManualSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedManualSyncDialog: React.FC<EnhancedManualSyncDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [devices, setDevices] = useState<ManualDevice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [dragOver, setDragOver] = useState(false);
  
  const { syncManual } = useTrackerSync();
  const { vehicles } = useVehicles();
  const { toast } = useToast();

  const addDevice = () => {
    const newDevice: ManualDevice = {
      id: Date.now().toString(),
      plate: "",
      trackerId: "",
    };
    setDevices([...devices, newDevice]);
  };

  const removeDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  const updateDevice = (id: string, field: keyof ManualDevice, value: any) => {
    setDevices(devices.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const findMatchingSuggestions = (plate: string) => {
    if (!plate || plate.length < 2) return [];
    
    return vehicles
      .filter(v => 
        v.plate_number?.toLowerCase().includes(plate.toLowerCase()) ||
        v.brand?.toLowerCase().includes(plate.toLowerCase()) ||
        v.model?.toLowerCase().includes(plate.toLowerCase())
      )
      .slice(0, 3)
      .map(v => ({
        id: v.id,
        plate: v.plate_number || '',
        brand: v.brand || '',
        model: v.model || '',
        confidence: 0.8 // مؤقت
      }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        const parsedDevices: ManualDevice[] = lines.map((line, index) => {
          const parts = line.split(',').map(p => p.trim());
          return {
            id: (Date.now() + index).toString(),
            plate: parts[0] || '',
            trackerId: parts[1] || '',
            latitude: parts[2] ? parseFloat(parts[2]) : undefined,
            longitude: parts[3] ? parseFloat(parts[3]) : undefined,
            address: parts[4] || undefined,
          };
        });
        
        setDevices(parsedDevices);
        toast({
          title: "تم تحميل الملف",
          description: `تم استيراد ${parsedDevices.length} جهاز من الملف`,
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "خطأ في الملف",
          description: "تعذر قراءة الملف. تأكد من تنسيق CSV الصحيح",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file?.type === 'text/csv' || file?.name.endsWith('.csv')) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = event.dataTransfer.files;
      handleFileUpload({ target: input } as any);
    }
  };

  const handleSubmit = async () => {
    const validDevices = devices.filter(d => d.plate && d.trackerId);
    
    if (validDevices.length === 0) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال رقم اللوحة ومعرف الجهاز للأجهزة",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep("جاري معالجة الأجهزة...");

    try {
      const devicesData = validDevices.map(d => ({
        plate: d.plate,
        trackerId: d.trackerId,
        latitude: d.latitude,
        longitude: d.longitude,
        address: d.address,
      }));

      const result = await syncManual(devicesData);
      
      if (result.success) {
        toast({
          title: "تمت المزامنة اليدوية بنجاح",
          description: `تم معالجة ${validDevices.length} جهاز بنجاح`,
          variant: "default"
        });
        onOpenChange(false);
        setDevices([]);
      } else {
        toast({
          title: "فشلت المزامنة اليدوية",
          description: result.error || "حدث خطأ أثناء المعالجة",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "خطأ في المزامنة",
        description: "تعذر معالجة الأجهزة",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>مزامنة يدوية للأجهزة</DialogTitle>
          <DialogDescription>
            إدخال وربط أجهزة التتبع يدوياً مع المركبات في النظام
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4" />
                استيراد من ملف CSV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
              >
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  اسحب ملف CSV هنا أو اضغط للاختيار
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  اختيار ملف
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  التنسيق: رقم اللوحة، معرف الجهاز، خط الطول، خط العرض، العنوان
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry Section */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="h-4 w-4" />
                  إدخال يدوي ({devices.length})
                </CardTitle>
                <Button onClick={addDevice} size="sm" variant="outline">
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة جهاز
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device, index) => (
                  <Card key={device.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`plate-${device.id}`}>رقم اللوحة *</Label>
                          <Input
                            id={`plate-${device.id}`}
                            value={device.plate}
                            onChange={(e) => updateDevice(device.id, 'plate', e.target.value)}
                            placeholder="أ ب ج 1234"
                          />
                          {device.plate && findMatchingSuggestions(device.plate).length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-muted-foreground">اقتراحات:</p>
                              {findMatchingSuggestions(device.plate).map((suggestion, i) => (
                                <Badge 
                                  key={i}
                                  variant="outline" 
                                  className="text-xs cursor-pointer"
                                  onClick={() => updateDevice(device.id, 'plate', suggestion.plate)}
                                >
                                  <Car className="h-3 w-3 ml-1" />
                                  {suggestion.plate} - {suggestion.brand} {suggestion.model}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor={`tracker-${device.id}`}>معرف الجهاز *</Label>
                          <Input
                            id={`tracker-${device.id}`}
                            value={device.trackerId}
                            onChange={(e) => updateDevice(device.id, 'trackerId', e.target.value)}
                            placeholder="TK123456"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDevice(device.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`lat-${device.id}`}>خط العرض</Label>
                          <Input
                            id={`lat-${device.id}`}
                            type="number"
                            step="0.000001"
                            value={device.latitude || ''}
                            onChange={(e) => updateDevice(device.id, 'latitude', parseFloat(e.target.value) || undefined)}
                            placeholder="24.7136"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`lng-${device.id}`}>خط الطول</Label>
                          <Input
                            id={`lng-${device.id}`}
                            type="number"
                            step="0.000001"
                            value={device.longitude || ''}
                            onChange={(e) => updateDevice(device.id, 'longitude', parseFloat(e.target.value) || undefined)}
                            placeholder="46.6753"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`address-${device.id}`}>العنوان</Label>
                          <Input
                            id={`address-${device.id}`}
                            value={device.address || ''}
                            onChange={(e) => updateDevice(device.id, 'address', e.target.value)}
                            placeholder="الرياض، السعودية"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {devices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-8 w-8 mx-auto mb-2" />
                    <p>لا توجد أجهزة مضافة</p>
                    <p className="text-sm">اضغط "إضافة جهاز" أو ارفع ملف CSV للبدء</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Processing Status */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  <span className="text-sm">{processingStep}</span>
                </div>
                <Progress value={50} className="w-full" />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={devices.length === 0 || isProcessing}
          >
            {isProcessing ? "جاري المعالجة..." : `معالجة ${devices.filter(d => d.plate && d.trackerId).length} جهاز`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedManualSyncDialog;
