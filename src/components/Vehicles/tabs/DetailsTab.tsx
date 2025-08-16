
import { Car, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Vehicle } from '@/types/vehicle';

interface DetailsTabProps {
  vehicle: Vehicle;
  getTransmissionLabel: (type: string) => string;
  getMaintenanceStatus: (status: string) => { label: string; variant: any };
}

export default function DetailsTab({ vehicle, getTransmissionLabel, getMaintenanceStatus }: DetailsTabProps) {
  // Helper function to get maintenance object from union type
  const getMaintenance = () => {
    if (!vehicle.maintenance) return null;
    return Array.isArray(vehicle.maintenance) ? vehicle.maintenance[0] : vehicle.maintenance;
  };

  const maintenance = getMaintenance();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              معلومات المركبة التفصيلية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم VIN:</span>
                <span className="font-medium">{vehicle.vin || 'غير محدد'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم المحرك:</span>
                <span className="font-medium">{vehicle.engine_number || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الشاسيه:</span>
                <span className="font-medium">{vehicle.chassis_number || 'غير محدد'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">ناقل الحركة:</span>
                <span className="font-medium">{getTransmissionLabel(vehicle.transmission)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المقاعد:</span>
                <span className="font-medium">{vehicle.seating_capacity}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              حالة الصيانة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">الحالة:</span>
              <Badge variant={getMaintenanceStatus(maintenance?.status || 'scheduled').variant}>
                {getMaintenanceStatus(maintenance?.status || 'scheduled').label}
              </Badge>
            </div>
            {maintenance?.lastMaintenanceDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">آخر صيانة:</span>
                <span className="font-medium">
                  {new Date(maintenance.lastMaintenanceDate).toLocaleDateString('ar')}
                </span>
              </div>
            )}
            {maintenance?.nextMaintenanceDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">الصيانة القادمة:</span>
                <span className="font-medium">
                  {new Date(maintenance.nextMaintenanceDate).toLocaleDateString('ar')}
                </span>
              </div>
            )}
            {maintenance?.notes && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground text-sm">ملاحظات:</span>
                  <p className="text-sm mt-1">{maintenance.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
