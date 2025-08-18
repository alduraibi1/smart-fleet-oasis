
import { Download, Printer, Plus, LayoutGrid, Table, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddVehicleDialog from './AddVehicleDialog';
import { Vehicle } from '@/types/vehicle';

interface VehicleActionsProps {
  vehicles: Vehicle[];
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onVehicleAdded: (vehicleData: Partial<Vehicle>) => Promise<void>;
  onUpdateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
}

export default function VehicleActions({ 
  vehicles, 
  viewMode, 
  onViewModeChange, 
  onVehicleAdded,
  onUpdateVehicle,
  onDeleteVehicle
}: VehicleActionsProps) {
  const handleExport = () => {
    // Create CSV data
    const csvData = vehicles.map(vehicle => ({
      'رقم اللوحة': vehicle.plate_number,
      'الماركة': vehicle.brand,
      'الموديل': vehicle.model,
      'السنة': vehicle.year,
      'اللون': vehicle.color,
      'الحالة': vehicle.status,
      'السعر اليومي': vehicle.daily_rate,
      'الكيلومترات': vehicle.mileage,
      'المالك': vehicle.owner?.name || 'غير محدد',
      'هاتف المالك': vehicle.owner?.phone || 'غير محدد'
    }));

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {});
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vehicles_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate alerts
  const getAlerts = () => {
    const alerts = [];
    
    // Maintenance due
    const maintenanceDue = vehicles.filter(v => 
      v.maintenance && v.maintenance.some(m => m.status === 'overdue')
    ).length;
    if (maintenanceDue > 0) {
      alerts.push({ type: 'maintenance', count: maintenanceDue, text: 'مركبات تحتاج صيانة' });
    }

    // Documents expiring
    const docsExpiring = vehicles.filter(v => 
      v.documents && v.documents.some(doc => doc.status === 'near_expiry' || doc.status === 'expired')
    ).length;
    if (docsExpiring > 0) {
      alerts.push({ type: 'documents', count: docsExpiring, text: 'مستندات تنتهي صلاحيتها' });
    }

    return alerts;
  };

  const alerts = getAlerts();

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="h-5 w-5" />
              تنبيهات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4 flex-wrap">
              {alerts.map((alert, index) => (
                <Badge key={index} variant="destructive" className="gap-1">
                  {alert.count} {alert.text}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <AddVehicleDialog onVehicleAdded={onVehicleAdded} />
          
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
          
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className="rounded-l-none"
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
