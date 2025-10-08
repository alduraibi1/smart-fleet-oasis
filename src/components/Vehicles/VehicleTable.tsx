
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
import { VehicleExpiryBadges } from './VehicleExpiryBadges';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onUpdateVehicle?: (id: string, data: Partial<Vehicle>, images?: File[], inspectionData?: any) => Promise<void>;
  onDeleteVehicle?: (id: string) => Promise<void>;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

const VehicleTable = ({ 
  vehicles, 
  onUpdateVehicle, 
  onDeleteVehicle,
  sortField,
  sortDirection,
  onSort
}: VehicleTableProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'details' | null>(null);

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-40" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-primary" /> 
      : <ArrowDown className="h-4 w-4 text-primary" />;
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
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort?.('plate_number')}
                  className="hover:bg-muted h-8 px-2 gap-1 font-semibold"
                >
                  رقم اللوحة
                  {getSortIcon('plate_number')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort?.('brand')}
                  className="hover:bg-muted h-8 px-2 gap-1 font-semibold"
                >
                  المركبة
                  {getSortIcon('brand')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort?.('status')}
                  className="hover:bg-muted h-8 px-2 gap-1 font-semibold"
                >
                  الحالة
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort?.('daily_rate')}
                  className="hover:bg-muted h-8 px-2 gap-1 font-semibold"
                >
                  السعر اليومي
                  {getSortIcon('daily_rate')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort?.('mileage')}
                  className="hover:bg-muted h-8 px-2 gap-1 font-semibold"
                >
                  الكيلومترات
                  {getSortIcon('mileage')}
                </Button>
              </TableHead>
              <TableHead className="text-right">نوع الوقود</TableHead>
              <TableHead className="text-right">ناقل الحركة</TableHead>
              <TableHead className="text-right w-[140px]">الصلاحيات</TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  onClick={() => onSort?.('owner_name')}
                  className="hover:bg-muted h-8 px-2 gap-1 font-semibold"
                >
                  المالك
                  {getSortIcon('owner_name')}
                </Button>
              </TableHead>
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
                  <VehicleExpiryBadges
                    insuranceExpiry={vehicle.insurance_expiry}
                    inspectionExpiry={vehicle.inspection_expiry}
                    registrationExpiry={vehicle.registration_expiry}
                  />
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
  {selectedVehicle && (
    <>
      <EditVehicleDialog
        vehicle={selectedVehicle}
        onUpdate={handleVehicleUpdate}
        open={dialogType === 'edit'}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVehicle(null);
            setDialogType(null);
          }
        }}
      />

      <DeleteVehicleDialog
        vehicle={selectedVehicle}
        onDelete={() => handleVehicleDelete(selectedVehicle.id)}
        open={dialogType === 'delete'}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVehicle(null);
            setDialogType(null);
          }
        }}
      />

      <EnhancedVehicleDetailsDialog
        vehicle={selectedVehicle}
        open={dialogType === 'details'}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedVehicle(null);
            setDialogType(null);
          }
        }}
      />
    </>
  )}
    </>
  );
};

export default VehicleTable;
