import { Car, DollarSign, Clock, FileText, Image as ImageIcon, Users, Fuel, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Vehicle } from '@/types/vehicle';

interface OverviewTabProps {
  vehicle: Vehicle;
  statusBadge: { label: string; variant: any; icon: any };
  getFuelTypeLabel: (type: string) => string;
}

export default function OverviewTab({ vehicle, statusBadge, getFuelTypeLabel }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                معلومات المركبة الأساسية
              </span>
              <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                <statusBadge.icon className="h-3 w-3" />
                {statusBadge.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">رقم اللوحة</Label>
                <p className="font-bold text-lg text-primary">{vehicle.plateNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">المركبة</Label>
                <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">سنة الصنع</Label>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">اللون</Label>
                <p className="font-medium">{vehicle.color}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              معلومات التأجير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">₪{vehicle.dailyRate}</p>
                <p className="text-sm text-muted-foreground">السعر اليومي</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Gauge className="h-4 w-4" />
                  <p className="text-2xl font-bold">{vehicle.mileage.toLocaleString()}</p>
                </div>
                <p className="text-sm text-muted-foreground">كيلومتر</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Rental Info */}
      {vehicle.currentRental && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              معلومات الإيجار الحالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">اسم العميل</Label>
                <p className="font-medium">{vehicle.currentRental.customerName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">تاريخ البداية</Label>
                <p className="font-medium">{new Date(vehicle.currentRental.startDate).toLocaleDateString('ar')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">تاريخ النهاية</Label>
                <p className="font-medium">{new Date(vehicle.currentRental.endDate).toLocaleDateString('ar')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{vehicle.documents.length}</p>
            <p className="text-sm text-muted-foreground">مستند</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{vehicle.images.length}</p>
            <p className="text-sm text-muted-foreground">صورة</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{vehicle.seatingCapacity}</p>
            <p className="text-sm text-muted-foreground">مقعد</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <Fuel className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold">{getFuelTypeLabel(vehicle.fuelType)}</p>
            <p className="text-sm text-muted-foreground">نوع الوقود</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}