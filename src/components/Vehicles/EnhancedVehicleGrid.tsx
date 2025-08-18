
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Gauge,
  Palette,
  Fuel,
  Settings,
  User,
} from "lucide-react";
import { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { EditVehicleDialog } from './EditVehicleDialog';
import { DeleteVehicleDialog } from './DeleteVehicleDialog';
import { useToast } from '@/hooks/use-toast';
import { VehicleRegistrationExpiry } from './VehicleRegistrationExpiry';

interface EnhancedVehicleGridProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

interface VehicleActionsProps {
  vehicle: Vehicle;
  onEdit: () => void;
  onDelete: () => void;
}

const VehicleActions = ({ vehicle, onEdit, onDelete }: VehicleActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const EnhancedVehicleGrid = ({ vehicles, onUpdateVehicle, onDeleteVehicle }: EnhancedVehicleGridProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleVehicleUpdate = async (id: string, data: Partial<Vehicle>) => {
    try {
      await onUpdateVehicle(id, data);
      setSelectedVehicle(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المركبة بنجاح",
      });
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث بيانات المركبة",
        variant: "destructive",
      });
    }
  };

  const handleVehicleDeleted = async () => {
    if (!selectedVehicle) return;
    
    try {
      await onDeleteVehicle(selectedVehicle.id);
      setSelectedVehicle(null);
      toast({
        title: "تم بنجاح",
        description: "تم حذف المركبة بنجاح",
      });
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المركبة",
        variant: "destructive",
      });
    }
  };

  const getStatusVariant = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'rented':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      case 'out_of_service':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return 'متاحة';
      case 'rented':
        return 'مؤجرة';
      case 'maintenance':
        return 'تحت الصيانة';
      case 'out_of_service':
        return 'خارج الخدمة';
      default:
        return 'غير محدد';
    }
  };

  const getFuelTypeLabel = (fuelType: Vehicle['fuel_type']) => {
    switch (fuelType) {
      case 'gasoline':
        return 'بنزين';
      case 'diesel':
        return 'ديزل';
      case 'hybrid':
        return 'هجين';
      case 'electric':
        return 'كهرباء';
      default:
        return 'غير محدد';
    }
  };

  const getTransmissionLabel = (transmission: Vehicle['transmission']) => {
    switch (transmission) {
      case 'manual':
        return 'يدوي';
      case 'automatic':
        return 'تلقائي';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="space-y-4">
      {vehicles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          لا توجد مركبات للعرض
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{vehicle.plate_number}</CardTitle>
                    <CardDescription>
                      {vehicle.brand} {vehicle.model} - {vehicle.year}
                    </CardDescription>
                  </div>
                  <VehicleActions 
                    vehicle={vehicle} 
                    onEdit={() => handleEdit(vehicle)}
                    onDelete={() => handleDelete(vehicle)}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusVariant(vehicle.status)} className="text-xs">
                    {getStatusLabel(vehicle.status)}
                  </Badge>
                  <span className="text-sm font-medium text-primary">
                    {vehicle.daily_rate} ريال/يوم
                  </span>
                </div>

                {/* Registration Expiry Status */}
                {vehicle.registration_expiry && (
                  <div>
                    <VehicleRegistrationExpiry 
                      expiryDate={vehicle.registration_expiry}
                      className="text-xs"
                    />
                  </div>
                )}

                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-muted-foreground" />
                    <span>{vehicle.mileage?.toLocaleString() || 0} كم</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Palette className="h-3 w-3 text-muted-foreground" />
                    <span>{vehicle.color}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3 w-3 text-muted-foreground" />
                    <span>{getFuelTypeLabel(vehicle.fuel_type)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-3 w-3 text-muted-foreground" />
                    <span>{getTransmissionLabel(vehicle.transmission)}</span>
                  </div>
                </div>

                {/* Owner Info */}
                {vehicle.owner && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{vehicle.owner.name}</span>
                  </div>
                )}

                {/* Notes */}
                {vehicle.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {vehicle.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {selectedVehicle && (
        <EditVehicleDialog
          vehicle={selectedVehicle}
          trigger={<div style={{ display: 'none' }} />}
          onUpdate={handleVehicleUpdate}
        />
      )}

      {/* Delete Dialog */}
      {selectedVehicle && (
        <DeleteVehicleDialog
          vehicle={selectedVehicle}
          onDelete={handleVehicleDeleted}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}
    </div>
  );
};

export default EnhancedVehicleGrid;
