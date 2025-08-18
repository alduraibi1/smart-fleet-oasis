
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import VehicleStats from '@/components/Vehicles/VehicleStats';
import VehicleFilters from '@/components/Vehicles/VehicleFilters';
import VehicleTable from '@/components/Vehicles/VehicleTable';
import AddVehicleDialog from '@/components/Vehicles/AddVehicleDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Grid, List } from 'lucide-react';
import { Vehicle, VehicleFilters as VehicleFiltersType } from '@/types/vehicle';

const Vehicles = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<VehicleFiltersType>({});
  const [loading, setLoading] = useState(false);

  // Mock stats data
  const mockStats = {
    total: 150,
    available: 120,
    rented: 25,
    maintenance: 3,
    out_of_service: 2,
    total_value: 12500000,
    avg_daily_rate: 250
  };

  // Mock brands data
  const mockBrands = ['تويوتا', 'نيسان', 'هيونداي', 'كيا', 'هوندا', 'مازda', 'شيفروليه'];

  const handleFiltersChange = (newFilters: VehicleFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="content-wrapper">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">المركبات</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                إدارة أسطول المركبات ومعلومات الصيانة
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-7 px-2"
                >
                  <List className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 px-2"
                >
                  <Grid className="h-3 w-3" />
                </Button>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="btn-responsive flex-shrink-0"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة مركبة
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-container">
            <VehicleStats stats={mockStats} />
          </div>

          {/* Filters */}
          <div className="dashboard-card mb-4 sm:mb-6">
            <VehicleFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              brands={mockBrands}
              loading={loading}
            />
          </div>

          {/* Main Content */}
          <div className="dashboard-card">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grid')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="table" className="text-xs sm:text-sm">
                  عرض جدولي
                </TabsTrigger>
                <TabsTrigger value="grid" className="text-xs sm:text-sm">
                  عرض بطاقات
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="mt-0">
                <VehicleTable vehicles={vehicles} />
              </TabsContent>
              
              <TabsContent value="grid" className="mt-0">
                <div className="adaptive-grid">
                  {/* VehicleGrid component would go here */}
                  <div className="text-center text-muted-foreground py-8">
                    عرض البطاقات قيد التطوير
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Add Vehicle Dialog */}
        <AddVehicleDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
        />
      </div>
    </AppLayout>
  );
};

export default Vehicles;
