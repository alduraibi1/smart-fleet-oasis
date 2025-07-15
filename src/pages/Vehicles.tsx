import { useState, useEffect } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import VehicleStats from '@/components/Vehicles/VehicleStats';
import VehicleFilters from '@/components/Vehicles/VehicleFilters';
import VehicleGrid from '@/components/Vehicles/VehicleGrid';
import VehicleTable from '@/components/Vehicles/VehicleTable';
import VehicleActions from '@/components/Vehicles/VehicleActions';
import { useVehicles } from '@/hooks/useVehicles';
import { VehicleFilters as VehicleFiltersType } from '@/types/vehicles';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Vehicles() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<VehicleFiltersType>({
    search: '',
    status: '',
    brand: '',
    minPrice: undefined,
    maxPrice: undefined,
    minYear: undefined,
    maxYear: undefined,
  });

  const { 
    vehicles, 
    loading, 
    stats, 
    fetchVehicles, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    getBrands 
  } = useVehicles();

  // Fetch vehicles when component mounts
  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleFiltersChange = (newFilters: VehicleFiltersType) => {
    setFilters(newFilters);
    fetchVehicles(newFilters);
  };

  const handleVehicleAdded = async (vehicleData: any) => {
    try {
      await addVehicle(vehicleData);
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:mr-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">إدارة المركبات</h1>
                  <p className="text-muted-foreground">إدارة وتتبع جميع مركبات الأسطول</p>
                </div>
              </div>

              {/* Statistics */}
              <VehicleStats stats={stats} />

              {/* Actions & Alerts */}
              <VehicleActions 
                vehicles={vehicles}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onVehicleAdded={handleVehicleAdded}
                onUpdateVehicle={updateVehicle}
                onDeleteVehicle={deleteVehicle}
              />

              {/* Filters */}
              <VehicleFilters 
                filters={filters}
                onFiltersChange={handleFiltersChange}
                brands={getBrands()}
                loading={loading}
              />

              {/* Results Summary */}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>عرض {vehicles.length} مركبة</span>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              )}

              {/* Vehicles Display */}
              {!loading && vehicles.length > 0 && (
                viewMode === 'grid' ? (
                  <VehicleGrid vehicles={vehicles} />
                ) : (
                  <VehicleTable vehicles={vehicles} />
                )
              )}

              {/* Empty State */}
              {!loading && vehicles.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      لا توجد مركبات
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ابدأ بإضافة أول مركبة لأسطولك
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}