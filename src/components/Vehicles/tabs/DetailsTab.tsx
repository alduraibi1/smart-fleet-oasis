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
                <span className="font-medium">{vehicle.vin}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم المحرك:</span>
                <span className="font-medium">{vehicle.engineNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الشاسيه:</span>
                <span className="font-medium">{vehicle.chassisNumber}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">ناقل الحركة:</span>
                <span className="font-medium">{getTransmissionLabel(vehicle.transmission)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المقاعد:</span>
                <span className="font-medium">{vehicle.seatingCapacity}</span>
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
              <Badge variant={getMaintenanceStatus(vehicle.maintenance.status).variant}>
                {getMaintenanceStatus(vehicle.maintenance.status).label}
              </Badge>
            </div>
            {vehicle.maintenance.lastMaintenanceDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">آخر صيانة:</span>
                <span className="font-medium">
                  {new Date(vehicle.maintenance.lastMaintenanceDate).toLocaleDateString('ar')}
                </span>
              </div>
            )}
            {vehicle.maintenance.nextMaintenanceDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">الصيانة القادمة:</span>
                <span className="font-medium">
                  {new Date(vehicle.maintenance.nextMaintenanceDate).toLocaleDateString('ar')}
                </span>
              </div>
            )}
            {vehicle.maintenance.notes && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground text-sm">ملاحظات:</span>
                  <p className="text-sm mt-1">{vehicle.maintenance.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}