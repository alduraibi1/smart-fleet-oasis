
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

const Vehicles = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'enhanced'>('enhanced');
  const [filters, setFilters] = useState({});
  
  const { vehicles, loading, stats, fetchVehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();

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
            
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة مركبة
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <VehicleStats stats={stats} loading={loading} />

        {/* Filters */}
        <VehicleFilters filters={filters} onFiltersChange={setFilters} />

        {/* Vehicles Display */}
        {viewMode === 'enhanced' ? (
          <EnhancedVehicleGrid
            vehicles={vehicles}
            loading={loading}
            onUpdate={updateVehicle}
            onDelete={deleteVehicle}
          />
        ) : (
          <VehicleGrid
            vehicles={vehicles}
            loading={loading}
            onUpdate={updateVehicle}
            onDelete={deleteVehicle}
          />
        )}

        {/* Add Vehicle Dialog */}
        <AddVehicleDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAdd={addVehicle}
        />
      </div>
    </AppLayout>
  );
};

export default Vehicles;
