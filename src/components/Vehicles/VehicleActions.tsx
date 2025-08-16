import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Vehicle } from '@/types/vehicle';
import { EditVehicleDialog } from './EditVehicleDialog';
import { DeleteVehicleDialog } from './DeleteVehicleDialog';
import EnhancedVehicleDetailsDialog from './EnhancedVehicleDetailsDialog';

interface VehicleActionsProps {
  vehicle: Vehicle;
  onUpdateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

const VehicleActions: React.FC<VehicleActionsProps> = ({ vehicle, onUpdateVehicle, onDeleteVehicle }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <EnhancedVehicleDetailsDialog
            vehicle={vehicle}
            trigger={
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                عرض التفاصيل
              </Button>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <EditVehicleDialog
            vehicle={vehicle}
            onUpdate={onUpdateVehicle}
            trigger={
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                تعديل
              </Button>
            }
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <DeleteVehicleDialog
            vehicle={vehicle}
            onDelete={onDeleteVehicle}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VehicleActions;
