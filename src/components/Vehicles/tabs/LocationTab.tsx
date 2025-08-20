
import { MapPin, Clock, Shield, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types/vehicle';
import { useVehicleLocation } from '@/hooks/useVehicleLocation';

interface LocationTabProps {
  vehicle: Vehicle;
}

export default function LocationTab({ vehicle }: LocationTabProps) {
  const { current, history, loading, refresh } = useVehicleLocation(vehicle?.id);

  const formatDate = (iso?: string | null) => {
    if (!iso) return 'غير محدد';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? 'غير محدد' : d.toLocaleString('ar');
  };

  const hasLocation =
    !!current &&
    current.latitude !== null &&
    current.longitude !== null;

  const mapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${current?.latitude},${current?.longitude}`
    : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            الموقع الحالي
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={current?.is_tracked ? 'default' : 'outline'}>
              {current?.is_tracked ? 'نشط' : 'غير نشط'}
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center text-muted-foreground">جاري جلب الموقع...</div>
          )}

          {hasLocation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">خط العرض</Label>
                  <p className="font-medium">{current?.latitude}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">خط الطول</Label>
                  <p className="font-medium">{current?.longitude}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">العنوان</Label>
                  <p className="font-medium">{current?.address || 'غير محدد'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    آخر تحديث
                  </Label>
                  <p className="font-medium">{formatDate(current?.last_updated)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" size="sm" disabled={!mapsUrl}>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    فتح في الخرائط
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {!hasLocation && !loading && (
            <div className="text-center py-6">
              <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">الموقع غير متاح</p>
              <p className="text-muted-foreground">لا توجد بيانات موقع متاحة لهذه المركبة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geofencing card placeholder until we connect rules */}
      {hasLocation && (
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
                <p className="font-medium">—</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground">الحالة</Label>
                <Badge variant="outline">
                  غير مُحدد
                </Badge>
              </div>
            </div>
            {history.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">آخر التحركات</Label>
                <div className="space-y-1">
                  {history.slice(0, 5).map((h) => (
                    <div key={h.id} className="text-sm text-muted-foreground">
                      {formatDate(h.recorded_at)} — {h.latitude}, {h.longitude} {h.speed ? `(${h.speed} كم/س)` : ''}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
