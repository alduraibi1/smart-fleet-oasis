
import { Wrench, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useVehicleMaintenanceInsights } from '@/hooks/useVehicleMaintenanceInsights';

interface MaintenanceTabProps {
  vehicle: Vehicle;
  getMaintenanceStatus: (status: string) => { label: string; variant: any };
}

export default function MaintenanceTab({ vehicle, getMaintenanceStatus }: MaintenanceTabProps) {
  const { toast } = useToast();
  const vehicleId = (vehicle as any).id as string | undefined;
  const { lastMaintenance, prediction, lastLoading, predictionLoading, generatePredictions } =
    useVehicleMaintenanceInsights(vehicleId);

  // Helper function to get maintenance object from union type
  const getMaintenance = () => {
    if (!vehicle.maintenance) return null;
    return Array.isArray(vehicle.maintenance) ? vehicle.maintenance[0] : vehicle.maintenance;
  };

  const maintenance = getMaintenance();

  const handleGeneratePrediction = async () => {
    if (!vehicleId) return;
    toast({ title: 'جارِ توليد التنبؤ', description: 'يتم تحديث تنبؤ الصيانة القادمة...' });
    generatePredictions.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'تم التحديث',
          description: 'تم توليد/تحديث تنبؤ الصيانة القادمة بنجاح',
        });
      },
      onError: (err: any) => {
        console.error(err);
        toast({
          title: 'خطأ',
          description: 'تعذر توليد التنبؤ، حاول لاحقًا',
          variant: 'destructive',
        });
      },
    });
  };

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
              <Badge variant={getMaintenanceStatus(maintenance?.status || 'scheduled').variant} className="mt-1">
                {getMaintenanceStatus(maintenance?.status || 'scheduled').label}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">تكلفة آخر صيانة</Label>
              <p className="font-medium">
                {lastLoading ? 'جارِ التحميل...' : (lastMaintenance?.total_cost ?? 'غير محدد')}
              </p>
            </div>
          </div>

          {maintenance?.lastMaintenanceDate && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                تاريخ آخر صيانة
              </Label>
              <p className="font-medium">
                {new Date(maintenance.lastMaintenanceDate).toLocaleDateString('ar')}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                موعد الصيانة القادمة
              </Label>
              {vehicleId && (
                <Button variant="outline" size="sm" onClick={handleGeneratePrediction} disabled={generatePredictions.isPending}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {generatePredictions.isPending ? 'جارِ التحديث...' : 'تحديث التنبؤ'}
                </Button>
              )}
            </div>
            <p className="font-medium mt-1">
              {predictionLoading
                ? 'جارِ التحميل...'
                : prediction?.predicted_date
                  ? new Date(prediction.predicted_date).toLocaleDateString('ar')
                  : (maintenance?.nextMaintenanceDate
                      ? new Date(maintenance.nextMaintenanceDate).toLocaleDateString('ar')
                      : 'غير محدد')}
            </p>
            {prediction?.confidence_score != null && (
              <div className="mt-1 text-xs text-muted-foreground">
                دقة متوقعة: {(Number(prediction.confidence_score) * 100).toFixed(0)}%
              </div>
            )}
          </div>

          {maintenance?.notes && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">ملاحظات الصيانة</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{maintenance.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {maintenance?.status === 'overdue' && (
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
