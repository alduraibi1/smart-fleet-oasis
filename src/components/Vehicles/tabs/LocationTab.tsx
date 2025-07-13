import { MapPin, Clock, AlertTriangle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Vehicle } from '@/types/vehicle';

interface LocationTabProps {
  vehicle: Vehicle;
}

export default function LocationTab({ vehicle }: LocationTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            الموقع الحالي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicle.location && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">خط الطول</Label>
                  <p className="font-medium">{vehicle.location.latitude}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">خط العرض</Label>
                  <p className="font-medium">{vehicle.location.longitude}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">العنوان</Label>
                <p className="font-medium">{vehicle.location.address || 'غير محدد'}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    آخر تحديث
                  </Label>
                  <p className="font-medium">
                    {new Date(vehicle.location.lastUpdated).toLocaleString('ar')}
                  </p>
                </div>
                <Badge variant="default">
                  نشط
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {vehicle.location && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              السياج الجغرافي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">النطاق المسموح</Label>
                <p className="font-medium">5 كم</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground">الحالة</Label>
                <Badge variant="default">
                  داخل النطاق
                </Badge>
              </div>
            </div>

            {false && (
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">تحذير: المركبة خارج النطاق المسموح</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    المركبة موجودة خارج النطاق الجغرافي المحدد
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {!vehicle.location && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">الموقع غير متاح</p>
            <p className="text-muted-foreground">لا توجد بيانات موقع متاحة لهذه المركبة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}