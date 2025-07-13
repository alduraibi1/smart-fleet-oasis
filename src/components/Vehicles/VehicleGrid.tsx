import { Vehicle } from '@/types/vehicle';
import { Car, Edit, Eye, User, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedVehicleDetailsDialog from './EnhancedVehicleDetailsDialog';

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export default function VehicleGrid({ vehicles }: VehicleGridProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'متاحة', variant: 'default' as const },
      rented: { label: 'مؤجرة', variant: 'secondary' as const },
      maintenance: { label: 'صيانة', variant: 'destructive' as const },
      out_of_service: { label: 'خارج الخدمة', variant: 'outline' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const getDocumentStatus = (vehicle: Vehicle) => {
    // Check if any documents are expired or near expiry
    const hasExpiredDocs = vehicle.documents.some(doc => doc.status === 'expired');
    const hasNearExpiryDocs = vehicle.documents.some(doc => doc.status === 'near_expiry');
    
    if (hasExpiredDocs) return { label: 'منتهية الصلاحية', color: 'text-red-600' };
    if (hasNearExpiryDocs) return { label: 'تنتهي قريباً', color: 'text-orange-600' };
    return { label: 'سارية', color: 'text-green-600' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => {
        const statusBadge = getStatusBadge(vehicle.status);
        const docStatus = getDocumentStatus(vehicle);
        
        return (
          <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    {vehicle.plateNumber}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                  </p>
                </div>
                <Badge variant={statusBadge.variant}>
                  {statusBadge.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicle Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">اللون:</span>
                  <p className="font-medium">{vehicle.color}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">الكيلومترات:</span>
                  <p className="font-medium">{vehicle.mileage.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">السعر اليومي:</span>
                  <p className="font-medium">₪{vehicle.dailyRate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">نوع الوقود:</span>
                  <p className="font-medium">{vehicle.fuelType === 'gasoline' ? 'بنزين' : 'ديزل'}</p>
                </div>
              </div>

              {/* Owner Information */}
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">معلومات المالك</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{vehicle.owner.name}</p>
                  <p className="text-muted-foreground">{vehicle.owner.phone}</p>
                </div>
              </div>

              {/* Current Rental Info */}
              {vehicle.currentRental && (
                <div className="border-t pt-3">
                  <div className="text-sm">
                    <p className="font-medium text-blue-600">مؤجرة حالياً لـ:</p>
                    <p>{vehicle.currentRental.customerName}</p>
                    <p className="text-muted-foreground">
                      حتى: {new Date(vehicle.currentRental.endDate).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              )}

              {/* Document Status */}
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">حالة المستندات</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    docStatus.color === 'text-green-600' ? 'bg-green-600' :
                    docStatus.color === 'text-orange-600' ? 'bg-orange-600' : 'bg-red-600'
                  }`} />
                  <span className={`text-sm ${docStatus.color}`}>{docStatus.label}</span>
                  {docStatus.color !== 'text-green-600' && (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <EnhancedVehicleDetailsDialog 
                  vehicle={vehicle}
                  trigger={
                    <Button size="sm" className="flex-1 gap-1">
                      <Eye className="h-4 w-4" />
                      عرض التفاصيل
                    </Button>
                  }
                />
                <Button size="sm" variant="outline" className="gap-1">
                  <Edit className="h-4 w-4" />
                  تعديل
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}