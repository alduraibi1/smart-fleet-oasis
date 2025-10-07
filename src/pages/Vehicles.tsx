
import { useState } from 'react';
import VehicleStats from '@/components/Vehicles/VehicleStats';
import VehicleFilters from '@/components/Vehicles/VehicleFilters';
import VehicleTable from '@/components/Vehicles/VehicleTable';
import VehicleGrid from '@/components/Vehicles/VehicleGrid';
import VehicleActions from '@/components/Vehicles/VehicleActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleFilters as VehicleFiltersType } from '@/types/vehicle';
import { useVehicles } from '@/hooks/useVehicles';
import TrackerSyncButton from '@/components/Vehicles/TrackerSyncButton';
import { ExportVehiclesDialog } from '@/components/Vehicles/ExportVehiclesDialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';

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

  const handleFiltersChange = (newFilters: VehicleFiltersType) => {
    setFilters(newFilters);
    fetchVehicles(newFilters);
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

        {/* Actions */}
        <VehicleActions 
          vehicles={vehicles}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onVehicleAdded={handleVehicleAdded}
          onUpdateVehicle={handleVehicleUpdated}
          onDeleteVehicle={handleVehicleDeleted}
        />

        {/* Tracker Sync & Export */}
        <div className="dashboard-card flex gap-2">
          <TrackerSyncButton />
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
