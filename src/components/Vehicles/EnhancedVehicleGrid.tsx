
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
  onUpdateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

const VehicleActions = ({ vehicle, onUpdateVehicle, onDeleteVehicle }: VehicleActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <EditVehicleDialog
        vehicle={vehicle}
        onUpdate={onUpdateVehicle}
        trigger={
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        }
      />
      <DeleteVehicleDialog
        vehicle={vehicle}
        onDelete={onDeleteVehicle}
        trigger={
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
};

const EnhancedVehicleGrid = ({ vehicles, onUpdateVehicle, onDeleteVehicle }: EnhancedVehicleGridProps) => {
  const { toast } = useToast();

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
                    onUpdateVehicle={onUpdateVehicle}
                    onDeleteVehicle={onDeleteVehicle}
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
    </div>
  );
};

export default EnhancedVehicleGrid;
