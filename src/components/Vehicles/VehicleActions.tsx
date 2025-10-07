
import { useState } from 'react';
import { Download, Printer, Plus, LayoutGrid, Table, Bell, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddVehicleDialog from './AddVehicleDialog';
import ImportVehiclesDialog from './ImportVehiclesDialog';
import { Vehicle } from '@/types/vehicle';

interface VehicleActionsProps {
  vehicles: Vehicle[];
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onVehicleAdded: (vehicleData: Partial<Vehicle>, images?: File[], inspectionData?: any) => Promise<void>;
  onUpdateVehicle: (id: string, data: Partial<Vehicle>, images?: File[], inspectionData?: any) => Promise<void>;
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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

  const handleVehicleAdded = async (vehicleData: Partial<Vehicle>, images?: File[], inspectionData?: any) => {
    await onVehicleAdded(vehicleData, images, inspectionData);
    setIsAddDialogOpen(false);
  };

  const handleVehiclesImported = () => {
    // إعادة تحميل البيانات بعد الاستيراد
    window.location.reload();
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
    <div className="space-y-3 sm:space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200 text-sm sm:text-base">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              تنبيهات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 sm:gap-4 flex-wrap">
              {alerts.map((alert, index) => (
                <Badge key={index} variant="destructive" className="gap-1 text-xs">
                  {alert.count} {alert.text}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="gap-2 flex-1 sm:flex-none btn-responsive"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            إضافة مركبة
          </Button>

          <Button 
            onClick={() => setIsImportDialogOpen(true)}
            variant="outline" 
            className="gap-2 flex-1 sm:flex-none btn-responsive" 
            size="sm"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">استيراد Excel</span>
            <span className="sm:hidden">استيراد</span>
          </Button>
          
          <Button variant="outline" onClick={handleExport} className="gap-2 flex-1 sm:flex-none btn-responsive" size="sm">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">تصدير</span>
          </Button>
          
          <Button variant="outline" onClick={handlePrint} className="gap-2 flex-1 sm:flex-none btn-responsive" size="sm">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">طباعة</span>
          </Button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border rounded-lg self-end sm:self-auto">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className="rounded-l-none h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <Table className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      <AddVehicleDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onVehicleAdded={handleVehicleAdded}
      />

      <ImportVehiclesDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onVehiclesImported={handleVehiclesImported}
      />
    </div>
  );
}
