import { Vehicle } from '@/types/vehicles';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditVehicleDialog } from './EditVehicleDialog';
import { DeleteVehicleDialog } from './DeleteVehicleDialog';
import { Car, MapPin, Fuel, Calendar, Edit, Trash2 } from 'lucide-react';

interface EnhancedVehicleGridProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

export default function EnhancedVehicleGrid({ vehicles, onUpdateVehicle, onDeleteVehicle }: EnhancedVehicleGridProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: 'متاحة', variant: 'default' as const },
      rented: { label: 'مؤجرة', variant: 'secondary' as const },
      maintenance: { label: 'صيانة', variant: 'destructive' as const },
      out_of_service: { label: 'خارج الخدمة', variant: 'outline' as const },
    };
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle) => {
        const statusBadge = getStatusBadge(vehicle.status);
        
        return (
          <Card key={vehicle.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{vehicle.plate_number}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </p>
                </div>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.color}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.fuel_type === 'gasoline' ? 'بنزين' : vehicle.fuel_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.mileage.toLocaleString()} كم</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{vehicle.daily_rate} ريال/يوم</span>
                </div>
              </div>
              
              {vehicle.owner && (
                <div className="text-sm">
                  <p className="font-medium">المالك: {vehicle.owner.name}</p>
                  {vehicle.owner.phone && (
                    <p className="text-muted-foreground">{vehicle.owner.phone}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <EditVehicleDialog
                  vehicle={vehicle}
                  onUpdate={onUpdateVehicle}
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل
                    </Button>
                  }
                />
                <DeleteVehicleDialog
                  vehicle={vehicle}
                  onDelete={onDeleteVehicle}
                  trigger={
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      disabled={vehicle.status === 'rented'}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      حذف
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}