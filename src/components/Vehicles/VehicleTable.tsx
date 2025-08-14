
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/types/vehicles';
import { EnhancedVehicleDetailsDialog } from './EnhancedVehicleDetailsDialog';
import VehicleRowActions from './VehicleRowActions';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: string, data: any) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

export default function VehicleTable({ vehicles, onUpdateVehicle, onDeleteVehicle }: VehicleTableProps) {
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'متاحة', variant: 'default' as const },
      rented: { label: 'مؤجرة', variant: 'secondary' as const },
      maintenance: { label: 'صيانة', variant: 'destructive' as const },
      out_of_service: { label: 'خارج الخدمة', variant: 'outline' as const }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const handleEdit = (vehicle: Vehicle) => {
    // This will be handled by a separate edit dialog component
    console.log('Edit vehicle:', vehicle.id);
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (vehicle.status === 'rented') {
      return; // Can't delete rented vehicles
    }
    
    if (confirm(`هل أنت متأكد من حذف المركبة ${vehicle.plate_number}؟`)) {
      await onDeleteVehicle(vehicle.id);
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>لا توجد مركبات مطابقة للفلاتر المحددة</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اللوحة</TableHead>
              <TableHead>الماركة والموديل</TableHead>
              <TableHead>السنة</TableHead>
              <TableHead>اللون</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>السعر اليومي</TableHead>
              <TableHead>المالك</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => {
              const status = getStatusBadge(vehicle.status);
              return (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-mono font-medium">
                    {vehicle.plate_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                    </div>
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.color}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>{vehicle.daily_rate} ر.س</TableCell>
                  <TableCell>
                    {vehicle.owner ? vehicle.owner.name : '-'}
                  </TableCell>
                  <TableCell>
                    <VehicleRowActions
                      vehicle={vehicle}
                      onView={() => setViewingVehicle(vehicle)}
                      onEdit={() => handleEdit(vehicle)}
                      onDelete={() => handleDelete(vehicle)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      {viewingVehicle && (
        <EnhancedVehicleDetailsDialog
          vehicle={viewingVehicle}
          open={!!viewingVehicle}
          onOpenChange={(open) => !open && setViewingVehicle(null)}
        />
      )}
    </>
  );
}
