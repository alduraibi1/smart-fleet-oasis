
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Vehicle } from '@/types/vehicle';
import { MoreHorizontal, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { EditVehicleDialog } from './EditVehicleDialog';
import { DeleteVehicleDialog } from './DeleteVehicleDialog';
import EnhancedVehicleDetailsDialog from './EnhancedVehicleDetailsDialog';
import { VehicleRegistrationExpiry } from './VehicleRegistrationExpiry';
import { VehicleInsuranceExpiry } from './VehicleInsuranceExpiry';
import { VehicleInspectionExpiry } from './VehicleInspectionExpiry';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onUpdateVehicle?: (id: string, data: Partial<Vehicle>, images?: File[], inspectionData?: any) => Promise<void>;
  onDeleteVehicle?: (id: string) => Promise<void>;
}

const VehicleTable = ({ vehicles, onUpdateVehicle, onDeleteVehicle }: VehicleTableProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'details' | null>(null);

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

  const handleAction = (vehicle: Vehicle, action: 'edit' | 'delete' | 'details') => {
    setSelectedVehicle(vehicle);
    setDialogType(action);
  };

  const handleVehicleUpdate = async (id: string, data: Partial<Vehicle>) => {
    if (onUpdateVehicle) {
      await onUpdateVehicle(id, data);
    }
    setSelectedVehicle(null);
    setDialogType(null);
  };

  const handleVehicleDelete = async (id: string) => {
    if (onDeleteVehicle) {
      await onDeleteVehicle(id);
    }
    setSelectedVehicle(null);
    setDialogType(null);
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">لا توجد مركبات</h3>
        <p className="text-muted-foreground">ابدأ بإضافة مركبة جديدة لأسطولك</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم اللوحة</TableHead>
              <TableHead className="text-right">المركبة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">السعر اليومي</TableHead>
              <TableHead className="text-right">عدد الكيلومترات</TableHead>
              <TableHead className="text-right">نوع الوقود</TableHead>
              <TableHead className="text-right">ناقل الحركة</TableHead>
              <TableHead className="text-right">الصلاحيات</TableHead>
              <TableHead className="text-right">المالك</TableHead>
              <TableHead className="w-[100px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">
                  {vehicle.plate_number}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.year} - {vehicle.color}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(vehicle.status)}>
                    {getStatusLabel(vehicle.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {vehicle.min_daily_rate && vehicle.max_daily_rate ? (
                    <div className="text-sm">
                      <div className="font-medium">{vehicle.daily_rate} ريال</div>
                      <div className="text-xs text-muted-foreground">
                        ({vehicle.min_daily_rate}-{vehicle.max_daily_rate})
                      </div>
                    </div>
                  ) : (
                    <span className="font-medium">{vehicle.daily_rate} ريال</span>
                  )}
                </TableCell>
                <TableCell>
                  {vehicle.mileage?.toLocaleString() || 0} كم
                </TableCell>
                <TableCell>
                  {getFuelTypeLabel(vehicle.fuel_type)}
                </TableCell>
                <TableCell>
                  {getTransmissionLabel(vehicle.transmission)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <VehicleInsuranceExpiry expiryDate={vehicle.insurance_expiry} />
                    <VehicleInspectionExpiry expiryDate={vehicle.inspection_expiry} />
                    <VehicleRegistrationExpiry expiryDate={vehicle.registration_expiry} />
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {vehicle.owner?.name || 'غير محدد'}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction(vehicle, 'details')}>
                        <Eye className="mr-2 h-4 w-4" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(vehicle, 'edit')}>
                        <Edit className="mr-2 h-4 w-4" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleAction(vehicle, 'delete')}
                        className="text-destructive"
                        disabled={vehicle.status === 'rented'}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {selectedVehicle && dialogType === 'edit' && (
        <EditVehicleDialog
          vehicle={selectedVehicle}
          onUpdate={handleVehicleUpdate}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}

      {selectedVehicle && dialogType === 'delete' && (
        <DeleteVehicleDialog
          vehicle={selectedVehicle}
          onDelete={() => handleVehicleDelete(selectedVehicle.id)}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}

      {selectedVehicle && dialogType === 'details' && (
        <EnhancedVehicleDetailsDialog
          vehicle={selectedVehicle}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}
    </>
  );
};

export default VehicleTable;
