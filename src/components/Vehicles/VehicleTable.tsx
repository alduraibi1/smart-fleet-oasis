
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Eye, Trash2, FileText } from 'lucide-react';
import { Vehicle } from '@/types/vehicles';
import EditVehicleDialog from './EditVehicleDialog';
import DeleteVehicleDialog from './DeleteVehicleDialog';
import { EnhancedVehicleDetailsDialog } from './EnhancedVehicleDetailsDialog';
import { VehicleActions } from './VehicleActions';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: string, data: any) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

export default function VehicleTable({ vehicles, onUpdateVehicle, onDeleteVehicle }: VehicleTableProps) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
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
                    <VehicleActions
                      vehicle={vehicle}
                      onView={() => setViewingVehicle(vehicle)}
                      onEdit={() => setEditingVehicle(vehicle)}
                      onDelete={() => setDeletingVehicle(vehicle)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {editingVehicle && (
        <EditVehicleDialog
          vehicle={editingVehicle}
          open={!!editingVehicle}
          onOpenChange={(open) => !open && setEditingVehicle(null)}
          onVehicleUpdated={onUpdateVehicle}
        />
      )}

      {deletingVehicle && (
        <DeleteVehicleDialog
          vehicle={deletingVehicle}
          open={!!deletingVehicle}
          onOpenChange={(open) => !open && setDeletingVehicle(null)}
          onVehicleDeleted={onDeleteVehicle}
        />
      )}

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
