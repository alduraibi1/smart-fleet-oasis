import { useState } from 'react';
import { Vehicle } from '@/types/vehicle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Edit, ArrowUpDown } from 'lucide-react';
import EnhancedVehicleDetailsDialog from './EnhancedVehicleDetailsDialog';

interface VehicleTableProps {
  vehicles: Vehicle[];
}

export default function VehicleTable({ vehicles }: VehicleTableProps) {
  const [sortField, setSortField] = useState<keyof Vehicle>('plateNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'متاحة', variant: 'default' as const },
      rented: { label: 'مؤجرة', variant: 'secondary' as const },
      maintenance: { label: 'صيانة', variant: 'destructive' as const },
      out_of_service: { label: 'خارج الخدمة', variant: 'outline' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.available;
  };

  const handleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue, 'ar')
        : bValue.localeCompare(aValue, 'ar');
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const SortableHeader = ({ field, children }: { field: keyof Vehicle; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="plateNumber">رقم اللوحة</SortableHeader>
            <SortableHeader field="brand">الماركة والموديل</SortableHeader>
            <SortableHeader field="year">السنة</SortableHeader>
            <SortableHeader field="color">اللون</SortableHeader>
            <TableHead>الحالة</TableHead>
            <TableHead>المالك</TableHead>
            <SortableHeader field="dailyRate">السعر اليومي</SortableHeader>
            <SortableHeader field="mileage">الكيلومترات</SortableHeader>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedVehicles.map((vehicle) => {
            const statusBadge = getStatusBadge(vehicle.status);
            return (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                    {vehicle.currentRental && (
                      <div className="text-xs text-muted-foreground">
                        مؤجرة لـ: {vehicle.currentRental.customerName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.color}</TableCell>
                <TableCell>
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{vehicle.owner.name}</div>
                    <div className="text-muted-foreground">{vehicle.owner.phone}</div>
                  </div>
                </TableCell>
                <TableCell>₪{vehicle.dailyRate}</TableCell>
                <TableCell>{vehicle.mileage.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <EnhancedVehicleDetailsDialog 
                      vehicle={vehicle}
                      trigger={
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}