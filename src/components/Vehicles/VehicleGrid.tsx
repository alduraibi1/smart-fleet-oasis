
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
  Car,
  Eye,
  FileText,
} from "lucide-react";
import { Vehicle } from '@/types/vehicle';
import { Button } from '@/components/ui/button';
import { EditVehicleDialog } from './EditVehicleDialog';
import { DeleteVehicleDialog } from './DeleteVehicleDialog';
import { useToast } from '@/hooks/use-toast';
import { VehicleRegistrationExpiry } from './VehicleRegistrationExpiry';

interface VehicleGridProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

const VehicleGrid = ({ vehicles, onUpdateVehicle, onDeleteVehicle }: VehicleGridProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [dialogAction, setDialogAction] = useState<'edit' | 'delete' | null>(null);
  const { toast } = useToast();

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogAction('edit');
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogAction('delete');
  };

  const handleVehicleUpdate = async (id: string, data: Partial<Vehicle>) => {
    try {
      await onUpdateVehicle(id, data);
      setSelectedVehicle(null);
      setDialogAction(null);
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
      setDialogAction(null);
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    {vehicle.daily_rate} ريال/يوم
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{vehicle.plate_number}</CardTitle>
                    <CardDescription>
                      {vehicle.brand} {vehicle.model} - {vehicle.year}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">عرض</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleEdit(vehicle)}>
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">تعديل</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>

                {/* Notes */}
                {vehicle.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {vehicle.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {selectedVehicle && dialogAction === 'edit' && (
        <EditVehicleDialog
          vehicle={selectedVehicle}
          trigger={<div style={{ display: 'none' }} />}
          onUpdate={handleVehicleUpdate}
        />
      )}

      {/* Delete Dialog */}
      {selectedVehicle && dialogAction === 'delete' && (
        <DeleteVehicleDialog
          vehicle={selectedVehicle}
          onDelete={handleVehicleDeleted}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}
    </div>
  );
};

export default VehicleGrid;
