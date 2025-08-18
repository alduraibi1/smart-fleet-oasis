
import { useState } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import VehicleStats from '@/components/Vehicles/VehicleStats';
import VehicleFilters from '@/components/Vehicles/VehicleFilters';
import VehicleGrid from '@/components/Vehicles/VehicleGrid';
import EnhancedVehicleGrid from '@/components/Vehicles/EnhancedVehicleGrid';
import AddVehicleDialog from '@/components/Vehicles/AddVehicleDialog';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/Layout/AppLayout';
import { VehicleFilters as VehicleFiltersType } from '@/types/vehicle';
import { Vehicle } from '@/types/vehicle';

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

  // Convert vehicles from the hook to the Vehicle type used in EnhancedVehicleGrid
  const convertedVehicles: Vehicle[] = vehicles.map(vehicle => ({
    ...vehicle,
    plateNumber: vehicle.plate_number,
    dailyRate: vehicle.daily_rate,
    engineNumber: vehicle.engine_number,
    chassisNumber: vehicle.chassis_number,
    fuelType: vehicle.fuel_type,
    seatingCapacity: vehicle.seating_capacity,
    // Ensure created_at and updated_at are always strings
    created_at: vehicle.created_at || new Date().toISOString(),
    updated_at: vehicle.updated_at || new Date().toISOString(),
    maintenance: vehicle.maintenance ? 
      (Array.isArray(vehicle.maintenance) ? 
        vehicle.maintenance.map(m => ({
          ...m,
          maintenance_type: m.maintenance_type || 'general',
          created_at: m.created_at || new Date().toISOString(),
          updated_at: m.updated_at || new Date().toISOString(),
          vehicle_id: m.vehicle_id || vehicle.id,
        })) : 
        [{
          id: 'temp-' + vehicle.id,
          vehicle_id: vehicle.id,
          status: 'scheduled' as const,
          maintenance_type: 'general',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]
      ) : 
      [{ 
        id: 'temp-' + vehicle.id, 
        vehicle_id: vehicle.id, 
        status: 'scheduled' as const,
        maintenance_type: 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }],
    documents: (vehicle.documents || []).map(doc => ({
      ...doc,
      upload_date: doc.upload_date || new Date().toISOString(),
    })),
    images: (vehicle.images || []).map(img => ({
      ...img,
      upload_date: img.upload_date || new Date().toISOString(),
    })),
    location: vehicle.location ? {
      ...vehicle.location,
      id: vehicle.location.id || 'temp-location-' + vehicle.id,
      vehicle_id: vehicle.location.vehicle_id || vehicle.id,
      is_tracked: vehicle.location.is_tracked ?? false,
    } : undefined,
    purchase: undefined,
    currentRental: undefined,
  }));

  const handleUpdateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    // Convert back to the format expected by the hook
    const convertedData = {
      ...vehicleData,
      plate_number: vehicleData.plateNumber || vehicleData.plate_number,
      daily_rate: vehicleData.dailyRate || vehicleData.daily_rate,
      engine_number: vehicleData.engineNumber || vehicleData.engine_number,
      chassis_number: vehicleData.chassisNumber || vehicleData.chassis_number,
      fuel_type: vehicleData.fuelType || vehicleData.fuel_type,
      seating_capacity: vehicleData.seatingCapacity || vehicleData.seating_capacity,
      // Convert maintenance back to array format if needed
      maintenance: vehicleData.maintenance ? 
        vehicleData.maintenance.map(m => ({
          ...m,
          maintenance_type: m.maintenance_type || 'general',
          created_at: m.created_at || new Date().toISOString(),
          updated_at: m.updated_at || new Date().toISOString(),
          vehicle_id: m.vehicle_id || id,
        })) : 
        undefined,
      // Ensure documents and images have required properties
      documents: vehicleData.documents?.map(doc => ({
        ...doc,
        upload_date: doc.upload_date || new Date().toISOString(),
      })),
      images: vehicleData.images?.map(img => ({
        ...img,
        upload_date: img.upload_date || new Date().toISOString(),
      })),
      // Handle location conversion
      location: vehicleData.location ? {
        ...vehicleData.location,
        id: vehicleData.location.id || 'temp-location-' + id,
        vehicle_id: vehicleData.location.vehicle_id || id,
        is_tracked: vehicleData.location.is_tracked ?? false,
      } : undefined,
    };
    await updateVehicle(id, convertedData);
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
            <AddVehicleDialog onVehicleAdded={handleVehicleAdded} />

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
            vehicles={convertedVehicles}
            onUpdateVehicle={handleUpdateVehicle}
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
