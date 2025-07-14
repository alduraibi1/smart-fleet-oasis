import { Vehicle } from '@/types/vehicle';
import { Car, Edit, Eye, User, FileText, AlertCircle, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EnhancedVehicleDetailsDialog from './EnhancedVehicleDetailsDialog';

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export default function VehicleGrid({ vehicles }: VehicleGridProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { 
        label: 'متاحة', 
        variant: 'default' as const, 
        color: 'bg-success/10 text-success border-success/20',
        icon: '✓'
      },
      rented: { 
        label: 'مؤجرة', 
        variant: 'secondary' as const, 
        color: 'bg-warning/10 text-warning border-warning/20',
        icon: '⏱'
      },
      maintenance: { 
        label: 'صيانة', 
        variant: 'destructive' as const, 
        color: 'bg-destructive/10 text-destructive border-destructive/20',
        icon: '🔧'
      },
      out_of_service: { 
        label: 'خارج الخدمة', 
        variant: 'outline' as const, 
        color: 'bg-muted/10 text-muted-foreground border-muted/20',
        icon: '⏹'
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const getConditionColor = (mileage: number) => {
    if (mileage < 50000) return 'text-success';
    if (mileage < 100000) return 'text-warning';
    return 'text-destructive';
  };

  const getColorIndicator = (color: string) => {
    const colorMap: Record<string, string> = {
      'أبيض': '#f8fafc',
      'أسود': '#1e293b',
      'فضي': '#64748b',
      'أحمر': '#dc2626',
      'أزرق': '#2563eb',
      'أخضر': '#16a34a'
    };
    return colorMap[color] || '#6b7280';
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
          <Car className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">لا توجد مركبات</h3>
        <p className="text-muted-foreground">ابدأ بإضافة مركبة جديدة لأسطولك</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => {
        const statusInfo = getStatusBadge(vehicle.status);
        
        return (
          <Card 
            key={vehicle.id} 
            className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary overflow-hidden"
          >
            {/* Vehicle Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-muted/30 via-muted/20 to-primary/10 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <Car className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
              </div>
              <div className="absolute top-4 right-4">
                <Badge className={`${statusInfo.color} font-medium`}>
                  <span className="mr-1">{statusInfo.icon}</span>
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4">
                <Badge variant="secondary" className="bg-white/90 text-primary">
                  {vehicle.dailyRate} ₪/يوم
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${vehicle.brand}&backgroundColor=6366f1`} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {vehicle.brand.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-xs">
                        {vehicle.plateNumber}
                      </span>
                      <span>•</span>
                      <span>{vehicle.year}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Vehicle Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-muted"
                      style={{ backgroundColor: getColorIndicator(vehicle.color) }}
                    ></div>
                    <span className="text-muted-foreground">{vehicle.color}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${getConditionColor(vehicle.mileage)}`} />
                    <span className="text-muted-foreground">
                      {vehicle.mileage.toLocaleString()} كم
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {vehicle.owner && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate text-xs">
                        {vehicle.owner.name}
                      </span>
                    </div>
                  )}
                  
                  {vehicle.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate text-xs">
                        {vehicle.location.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Rental Info */}
              {vehicle.currentRental && (
                <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">مؤجرة حالياً</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    العميل: {vehicle.currentRental.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    حتى: {new Date(vehicle.currentRental.endDate).toLocaleDateString('ar')}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <EnhancedVehicleDetailsDialog 
                  vehicle={vehicle} 
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">عرض</span>
                    </Button>
                  }
                />
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">تعديل</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <FileText className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}