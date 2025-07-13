
import { useState, useMemo } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import VehicleStats from '@/components/Vehicles/VehicleStats';
import VehicleFilters, { VehicleFilters as FilterType } from '@/components/Vehicles/VehicleFilters';
import VehicleGrid from '@/components/Vehicles/VehicleGrid';
import VehicleTable from '@/components/Vehicles/VehicleTable';
import VehicleActions from '@/components/Vehicles/VehicleActions';
import { Vehicle } from '@/types/vehicle';

export default function Vehicles() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    status: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    year: ''
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      plateNumber: 'أ ب ج 123',
      brand: 'تويوتا',
      model: 'كامري',
      year: 2023,
      color: 'أبيض',
      status: 'available',
      dailyRate: 150,
      mileage: 15000,
      ownerId: '1',
      owner: {
        id: '1',
        name: 'أحمد محمد علي',
        phone: '+970-599-123456',
        email: 'ahmed@example.com',
        nationalId: '123456789',
        address: 'غزة، الرمال',
        isActive: true
      },
      documents: [],
      images: [],
      vin: 'WVW1J7A37CE123456',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS789012',
      fuelType: 'gasoline',
      transmission: 'automatic',
      seatingCapacity: 5,
      features: [],
      maintenance: {
        status: 'completed',
        lastMaintenanceDate: '2024-01-01T00:00:00Z',
        nextMaintenanceDate: '2024-04-01T00:00:00Z'
      },
      location: {
        isTracked: true,
        address: 'غزة، الرمال',
        lastUpdated: '2024-01-15T08:00:00Z'
      },
      purchase: {
        purchaseDate: '2023-01-01T00:00:00Z',
        purchasePrice: 85000
      },
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      plateNumber: 'د هـ و 456',
      brand: 'هيونداي',
      model: 'إلنترا',
      year: 2022,
      color: 'أسود',
      status: 'rented',
      dailyRate: 120,
      mileage: 25000,
      ownerId: '2',
      owner: {
        id: '2',
        name: 'محمد أحمد سالم',
        phone: '+970-599-654321',
        email: 'mohammed@example.com',
        nationalId: '987654321',
        address: 'رام الله، البيرة',
        isActive: true
      },
      documents: [],
      images: [],
      vin: 'KMHD73JA9CE987654',
      engineNumber: 'ENG654321',
      chassisNumber: 'CHS210987',
      fuelType: 'gasoline',
      transmission: 'manual',
      seatingCapacity: 5,
      features: [],
      currentRental: {
        customerId: 'C001',
        customerName: 'فادي أحمد صالح',
        startDate: '2024-01-10T00:00:00Z',
        endDate: '2024-01-20T00:00:00Z'
      },
      maintenance: {
        status: 'completed',
        lastMaintenanceDate: '2023-12-15T00:00:00Z',
        nextMaintenanceDate: '2024-03-15T00:00:00Z'
      },
      location: {
        isTracked: true,
        address: 'رام الله، البيرة',
        lastUpdated: '2024-01-10T10:30:00Z'
      },
      purchase: {
        purchaseDate: '2022-05-15T00:00:00Z',
        purchasePrice: 75000
      },
      createdAt: '2024-01-10T10:30:00Z',
      updatedAt: '2024-01-10T10:30:00Z'
    },
    {
      id: '3',
      plateNumber: 'ز ح ط 789',
      brand: 'نيسان',
      model: 'التيما',
      year: 2021,
      color: 'فضي',
      status: 'maintenance',
      dailyRate: 130,
      mileage: 35000,
      ownerId: '3',
      owner: {
        id: '3',
        name: 'سارة خالد محمود',
        phone: '+970-599-111222',
        email: 'sara@example.com',
        nationalId: '456789123',
        address: 'نابلس، البلدة القديمة',
        isActive: true
      },
      documents: [],
      images: [],
      vin: 'JN1CV6ARXEM123789',
      engineNumber: 'ENG789123',
      chassisNumber: 'CHS345678',
      fuelType: 'diesel',
      transmission: 'automatic',
      seatingCapacity: 5,
      features: [],
      maintenance: {
        status: 'in_progress',
        lastMaintenanceDate: '2023-11-20T00:00:00Z',
        notes: 'تغيير الزيت والفلاتر'
      },
      location: {
        isTracked: false,
        address: 'نابلس، البلدة القديمة'
      },
      purchase: {
        purchaseDate: '2021-03-10T00:00:00Z',
        purchasePrice: 65000,
        financingCompany: 'بنك فلسطين'
      },
      createdAt: '2024-01-05T14:20:00Z',
      updatedAt: '2024-01-05T14:20:00Z'
    }
  ]);

  const handleVehicleAdded = (newVehicle: Vehicle) => {
    setVehicles(prev => [...prev, newVehicle]);
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${vehicle.plateNumber} ${vehicle.brand} ${vehicle.model} ${vehicle.owner.name}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Status filter
      if (filters.status && vehicle.status !== filters.status) return false;

      // Brand filter
      if (filters.brand && vehicle.brand !== filters.brand) return false;

      // Price filters
      if (filters.minPrice && vehicle.dailyRate < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && vehicle.dailyRate > parseInt(filters.maxPrice)) return false;

      // Year filter
      if (filters.year && vehicle.year.toString() !== filters.year) return false;

      return true;
    });
  }, [vehicles, filters]);

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
              <VehicleStats vehicles={vehicles} />

              {/* Actions & Alerts */}
              <VehicleActions 
                vehicles={vehicles}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onVehicleAdded={handleVehicleAdded}
              />

              {/* Filters */}
              <VehicleFilters onFiltersChange={setFilters} />

              {/* Results Summary */}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>عرض {filteredVehicles.length} من أصل {vehicles.length} مركبة</span>
              </div>

              {/* Vehicles Display */}
              {viewMode === 'grid' ? (
                <VehicleGrid vehicles={filteredVehicles} />
              ) : (
                <VehicleTable vehicles={filteredVehicles} />
              )}

              {/* Empty State */}
              {filteredVehicles.length === 0 && vehicles.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">لا توجد مركبات تطابق معايير البحث</p>
                </div>
              )}

              {vehicles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">لا توجد مركبات مضافة بعد</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
