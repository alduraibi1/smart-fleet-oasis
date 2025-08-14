
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";
import type { VehicleFilters } from "@/hooks/useVehicles";
import AddVehicleDialog from "@/components/Vehicles/AddVehicleDialog";
import VehicleStats from "@/components/Vehicles/VehicleStats";
import VehicleFiltersComponent from "@/components/Vehicles/VehicleFilters";
import EnhancedVehicleGrid from "@/components/Vehicles/EnhancedVehicleGrid";
import VehicleTable from "@/components/Vehicles/VehicleTable";
import { AppLayout } from "@/components/Layout/AppLayout";

const Vehicles = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<VehicleFilters>({});

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

  const handleFiltersChange = (newFilters: VehicleFilters) => {
    setFilters(newFilters);
    fetchVehicles(newFilters);
  };

  const handleVehicleAdded = async (vehicleData: any) => {
    try {
      await addVehicle(vehicleData);
      fetchVehicles(filters);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة المركبات</h1>
            <p className="text-muted-foreground">
              إدارة أسطول المركبات ومعلوماتها التفصيلية
            </p>
          </div>
          <AddVehicleDialog onVehicleAdded={handleVehicleAdded} />
        </div>

        <VehicleStats stats={stats} />
        <VehicleFiltersComponent 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          brands={getBrands()}
          loading={loading}
        />

        {viewMode === 'grid' ? (
          <EnhancedVehicleGrid
            vehicles={vehicles}
            onUpdateVehicle={updateVehicle}
            onDeleteVehicle={deleteVehicle}
          />
        ) : (
          <VehicleTable vehicles={vehicles} />
        )}
      </div>
    </AppLayout>
  );
};

export default Vehicles;
