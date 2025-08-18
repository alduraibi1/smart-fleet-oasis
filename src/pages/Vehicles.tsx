
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import { useVehicles } from '@/hooks/useVehicles';
import VehicleStats from '@/components/Vehicles/VehicleStats';
import VehicleFilters from '@/components/Vehicles/VehicleFilters';
import VehicleGrid from '@/components/Vehicles/VehicleGrid';
import VehicleTable from '@/components/Vehicles/VehicleTable';
import AddVehicleDialog from '@/components/Vehicles/AddVehicleDialog';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Vehicle, VehicleFilters as VehicleFiltersType } from '@/types/vehicle';

const Vehicles = () => {
  const { vehicles, loading, stats, fetchVehicles, addVehicle, updateVehicle, deleteVehicle, getBrands } = useVehicles();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filters, setFilters] = useState<VehicleFiltersType>({});

  const handleFilterChange = (newFilters: VehicleFiltersType) => {
    setFilters(newFilters);
    fetchVehicles(newFilters);
  };

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addVehicle(vehicleData);
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">إدارة المركبات</h1>
            <p className="text-muted-foreground">
              إدارة شاملة لأسطول المركبات مع تتبع الحالة والصيانة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              إضافة مركبة
            </Button>
          </div>
        </div>

        {/* Stats */}
        <VehicleStats stats={stats} />

        {/* Filters */}
        <VehicleFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
          brands={getBrands()}
          loading={loading}
        />

        {/* Vehicles Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              المركبات ({vehicles.length})
              <div className="text-sm font-normal text-muted-foreground">
                {loading ? 'جاري التحميل...' : `${vehicles.length} مركبة`}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'grid' ? (
              <VehicleGrid
                vehicles={vehicles}
                onUpdateVehicle={updateVehicle}
                onDeleteVehicle={deleteVehicle}
              />
            ) : (
              <VehicleTable
                vehicles={vehicles}
              />
            )}
          </CardContent>
        </Card>

        {/* Add Vehicle Dialog */}
        <AddVehicleDialog
          onVehicleAdded={handleAddVehicle}
        />
      </div>
    </AppLayout>
  );
};

export default Vehicles;
