import { User, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Vehicle } from '@/types/vehicle';

interface OwnerTabProps {
  vehicle: Vehicle;
}

export default function OwnerTab({ vehicle }: OwnerTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات المالك
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">الاسم الكامل</Label>
              <p className="font-medium">{vehicle.owner.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">رقم الهوية</Label>
              <p className="font-medium">{vehicle.owner.nationalId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">رقم الهاتف</Label>
              <p className="font-medium">{vehicle.owner.phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</Label>
              <p className="font-medium">{vehicle.owner.email}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              العنوان
            </Label>
            <p className="font-medium">{vehicle.owner.address}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}