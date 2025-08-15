
import { useState } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import VehicleStats from '@/components/Vehicles/VehicleStats';
import VehicleFilters from '@/components/Vehicles/VehicleFilters';
import VehicleGrid from '@/components/Vehicles/VehicleGrid';
import EnhancedVehicleGrid from '@/components/Vehicles/EnhancedVehicleGrid';
import AddVehicleDialog from '@/components/Vehicles/AddVehicleDialog';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { VehicleFilters as VehicleFiltersType } from '@/types/vehicles';

const Vehicles = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'enhanced'>('enhanced');
  const [filters, setFilters] = useState<VehicleFiltersType>({});
  
  const { vehicles, loading, stats, fetchVehicles, addVehicle, updateVehicle, deleteVehicle, getBrands } = useVehicles();

  const handleFiltersChange = (newFilters: VehicleFiltersType) => {
    setFilters(newFilters);
    fetchVehicles(newFilters);
  };

  const handleVehicleAdded = async (vehicleData: any) => {
    await addVehicle(vehicleData);
    fetchVehicles(filters); // Refresh the list
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة المركبات</h1>
            <p className="text-muted-foreground mt-1">
              إدارة شاملة لأسطول المركبات مع تتبع متقدم للحالة والأداء
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Add Vehicle Button */}
            <AddVehicleDialog onVehicleAdded={handleVehicleAdded}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة مركبة
              </Button>
            </AddVehicleDialog>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'enhanced' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('enhanced')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <VehicleStats stats={stats} />

        {/* Filters */}
        <VehicleFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          brands={getBrands()}
        />

        {/* Vehicles Display */}
        {viewMode === 'enhanced' ? (
          <EnhancedVehicleGrid
            vehicles={vehicles}
            onUpdateVehicle={updateVehicle}
            onDeleteVehicle={deleteVehicle}
          />
        ) : (
          <VehicleGrid
            vehicles={vehicles}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Vehicles;
