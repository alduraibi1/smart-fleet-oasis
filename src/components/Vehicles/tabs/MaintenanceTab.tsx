import { Wrench, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Vehicle } from '@/types/vehicle';

interface MaintenanceTabProps {
  vehicle: Vehicle;
  getMaintenanceStatus: (status: string) => { label: string; variant: any };
}

export default function MaintenanceTab({ vehicle, getMaintenanceStatus }: MaintenanceTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            معلومات الصيانة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">حالة الصيانة</Label>
              <Badge variant={getMaintenanceStatus(vehicle.maintenance.status).variant} className="mt-1">
                {getMaintenanceStatus(vehicle.maintenance.status).label}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">تكلفة آخر صيانة</Label>
              <p className="font-medium">
                غير محدد
              </p>
            </div>
          </div>

          {vehicle.maintenance.lastMaintenanceDate && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                تاريخ آخر صيانة
              </Label>
              <p className="font-medium">
                {new Date(vehicle.maintenance.lastMaintenanceDate).toLocaleDateString('ar')}
              </p>
            </div>
          )}

          {vehicle.maintenance.nextMaintenanceDate && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                موعد الصيانة القادمة
              </Label>
              <p className="font-medium">
                {new Date(vehicle.maintenance.nextMaintenanceDate).toLocaleDateString('ar')}
              </p>
            </div>
          )}

          {vehicle.maintenance.notes && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">ملاحظات الصيانة</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{vehicle.maintenance.notes}</p>
              </div>
            </>
          )}

          {false && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">القطع المستخدمة مؤخراً</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['زيت المحرك', 'فلتر الهواء'].map((part, index) => (
                    <Badge key={index} variant="outline">
                      {part}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {vehicle.maintenance.status === 'overdue' && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">تحذير: الصيانة متأخرة</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              يجب إجراء الصيانة في أقرب وقت ممكن لضمان سلامة المركبة
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}