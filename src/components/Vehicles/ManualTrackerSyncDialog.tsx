
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save } from 'lucide-react';
import { useTrackerSync } from '@/hooks/useTrackerSync';

interface ManualTrackerSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DeviceEntry {
  plate: string;
  trackerId: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

const ManualTrackerSyncDialog: React.FC<ManualTrackerSyncDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [devices, setDevices] = useState<DeviceEntry[]>([
    { plate: '', trackerId: '', latitude: undefined, longitude: undefined, address: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { syncManual } = useTrackerSync();

  const addDevice = () => {
    setDevices([...devices, { plate: '', trackerId: '', latitude: undefined, longitude: undefined, address: '' }]);
  };

  const removeDevice = (index: number) => {
    if (devices.length > 1) {
      setDevices(devices.filter((_, i) => i !== index));
    }
  };

  const updateDevice = (index: number, field: keyof DeviceEntry, value: string | number) => {
    const updatedDevices = [...devices];
    updatedDevices[index] = { ...updatedDevices[index], [field]: value };
    setDevices(updatedDevices);
  };

  const handleSync = async () => {
    const validDevices = devices.filter(d => d.plate && d.trackerId);
    
    if (validDevices.length === 0) {
      toast({
        title: "بيانات ناقصة",
        description: "يجب إدخال رقم اللوحة ومعرف الجهاز على الأقل",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await syncManual(validDevices);
      
      if (result.success && result.summary) {
        const s = result.summary;
        toast({
          title: "مزامنة يدوية مكتملة",
          description: `تمت مطابقة ${s.matched} مركبة، تحديث المركبات: ${s.updatedVehicles}، ربط الأجهزة: ${s.upsertedMappings}، تحديث المواقع: ${s.updatedLocations}، تخطي: ${s.skipped}`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: "فشل المزامنة",
          description: result.error || "حدث خطأ غير متوقع",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء المزامنة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>مزامنة أجهزة التتبع يدوياً</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            أدخل بيانات الأجهزة المراد ربطها بالمركبات. يجب إدخال رقم اللوحة ومعرف الجهاز على الأقل.
          </div>

          <div className="space-y-3">
            {devices.map((device, index) => (
              <div key={index} className="grid grid-cols-6 gap-3 p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>رقم اللوحة *</Label>
                  <Input
                    value={device.plate}
                    onChange={(e) => updateDevice(index, 'plate', e.target.value)}
                    placeholder="أ ب ج 123"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>معرف الجهاز *</Label>
                  <Input
                    value={device.trackerId}
                    onChange={(e) => updateDevice(index, 'trackerId', e.target.value)}
                    placeholder="TRK001"
                  />
                </div>

                <div className="space-y-1">
                  <Label>خط العرض</Label>
                  <Input
                    type="number"
                    step="any"
                    value={device.latitude || ''}
                    onChange={(e) => updateDevice(index, 'latitude', parseFloat(e.target.value) || undefined)}
                    placeholder="24.7136"
                  />
                </div>

                <div className="space-y-1">
                  <Label>خط الطول</Label>
                  <Input
                    type="number"
                    step="any"
                    value={device.longitude || ''}
                    onChange={(e) => updateDevice(index, 'longitude', parseFloat(e.target.value) || undefined)}
                    placeholder="46.6753"
                  />
                </div>

                <div className="space-y-1">
                  <Label>العنوان</Label>
                  <Input
                    value={device.address || ''}
                    onChange={(e) => updateDevice(index, 'address', e.target.value)}
                    placeholder="الرياض"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDevice(index)}
                    disabled={devices.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addDevice}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            إضافة جهاز آخر
          </Button>

          <div className="flex gap-4 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSync}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? "جاري المزامنة..." : "بدء المزامنة"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualTrackerSyncDialog;
