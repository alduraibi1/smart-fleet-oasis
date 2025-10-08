
import { useState, useEffect } from 'react';
import VehicleStats from '@/components/Vehicles/VehicleStats';
import VehicleFilters from '@/components/Vehicles/VehicleFilters';
import VehicleTable from '@/components/Vehicles/VehicleTable';
import VehicleGrid from '@/components/Vehicles/VehicleGrid';
import VehicleActions from '@/components/Vehicles/VehicleActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleFilters as VehicleFiltersType } from '@/types/vehicle';
import { useVehicles } from '@/hooks/useVehicles';
import { ExportVehiclesDialog } from '@/components/Vehicles/ExportVehiclesDialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { VehicleExpiryDashboard } from '@/components/Vehicles/VehicleExpiryDashboard';
import { VehicleExpiryDetailsTable } from '@/components/Vehicles/VehicleExpiryDetailsTable';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO } from 'date-fns';

const Vehicles = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filters, setFilters] = useState<VehicleFiltersType>({});
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const {
    vehicles,
    loading,
    stats,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getBrands,
  } = useVehicles();

  // Trigger smart notifications check on mount
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        await supabase.functions.invoke('smart-notifications');
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };
    checkNotifications();
  }, []);

  const handleFiltersChange = (newFilters: VehicleFiltersType) => {
    setFilters(newFilters);
    fetchVehicles(newFilters);
  };

  const handleExpiryFilterChange = (filter: { type: 'insurance' | 'inspection' | 'registration'; status: 'expired' | 'expiring' | 'valid' }) => {
    const today = new Date();
    const warningDays = 30;

    const matchesFilter = (vehicle: any) => {
      const dateField = filter.type === 'insurance' ? vehicle.insurance_expiry :
                       filter.type === 'inspection' ? vehicle.inspection_expiry :
                       vehicle.registration_expiry;

      if (!dateField) return filter.status === 'valid';

      try {
        const expiry = parseISO(dateField);
        const daysUntil = differenceInDays(expiry, today);

        if (filter.status === 'expired') return daysUntil < 0;
        if (filter.status === 'expiring') return daysUntil >= 0 && daysUntil <= warningDays;
        if (filter.status === 'valid') return daysUntil > warningDays;
      } catch {
        return filter.status === 'valid';
      }

      return false;
    };

    // Filter vehicles based on expiry status
    const filtered = vehicles.filter(matchesFilter);
    
    // This is a simplified approach - in a real implementation, you'd want to update the filters state
    // and have the vehicle list component handle the filtering
    console.log(`Filtering ${filter.type} by ${filter.status}:`, filtered.length, 'vehicles');
  };

  const handleVehicleAdded = async (vehicleData: any, images?: File[], inspectionData?: any) => {
    try {
      await addVehicle(vehicleData, images, inspectionData);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  const handleVehicleUpdated = async (id: string, vehicleData: any) => {
    try {
      await updateVehicle(id, vehicleData);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const handleVehicleDeleted = async (id: string) => {
    try {
      await deleteVehicle(id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  return (
    <div className="content-spacing">
      {/* Page Header */}
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">المركبات</h1>
          <p className="text-adaptive text-muted-foreground">
            إدارة أسطول المركبات ومعلومات الصيانة
          </p>
        </div>

        {/* Stats Section */}
        <div className="adaptive-grid">
          <VehicleStats stats={stats} />
        </div>

        {/* Expiry Dashboard */}
        <VehicleExpiryDashboard 
          vehicles={vehicles}
          onFilterChange={handleExpiryFilterChange}
        />

        {/* Detailed Expiry Table */}
        <VehicleExpiryDetailsTable vehicles={vehicles} />

        {/* Actions */}
        <VehicleActions 
          vehicles={vehicles}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onVehicleAdded={handleVehicleAdded}
          onUpdateVehicle={handleVehicleUpdated}
          onDeleteVehicle={handleVehicleDeleted}
        />

        {/* Export */}
        <div className="dashboard-card flex gap-2">
          <Button onClick={() => setExportDialogOpen(true)} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            تصدير
          </Button>
        </div>

        {/* Filters */}
        <div className="dashboard-card">
          <VehicleFilters 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            brands={getBrands()}
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="dashboard-card">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grid')}>
            <TabsList className="grid w-full grid-cols-2 mb-4 h-8 sm:h-9">
              <TabsTrigger value="table" className="text-xs sm:text-sm h-7 sm:h-8">
                عرض جدولي
              </TabsTrigger>
              <TabsTrigger value="grid" className="text-xs sm:text-sm h-7 sm:h-8">
                عرض بطاقات
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="mt-0">
              <div className="table-responsive">
                <VehicleTable 
                  vehicles={vehicles}
                  onUpdateVehicle={handleVehicleUpdated}
                  onDeleteVehicle={handleVehicleDeleted}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="grid" className="mt-0">
              <VehicleGrid 
                vehicles={vehicles}
                onUpdateVehicle={handleVehicleUpdated}
                onDeleteVehicle={handleVehicleDeleted}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ExportVehiclesDialog 
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        vehicles={vehicles}
      />
    </div>
  );
};

export default Vehicles;
