
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { OwnerStats } from '@/components/Owners/OwnerStats';
import { OwnerFilters } from '@/components/Owners/OwnerFilters';
import { OwnerTable } from '@/components/Owners/OwnerTable';
import { AddOwnerDialog } from '@/components/Owners/AddOwnerDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Owner } from '@/hooks/useOwners';

const Owners = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock stats data
  const mockStats = {
    total: 45,
    active: 38,
    inactive: 7,
    avg_vehicles_per_owner: 2.3
  };

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
  };

  const handleUpdate = (id: string, owner: Partial<Owner>) => {
    setOwners(prev => prev.map(o => o.id === id ? { ...o, ...owner } : o));
  };

  const handleDelete = (id: string) => {
    setOwners(prev => prev.filter(o => o.id !== id));
  };

  const handleAdd = (owner: Omit<Owner, 'id' | 'created_at' | 'updated_at' | 'vehicle_count'>) => {
    const newOwner: Owner = {
      ...owner,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      vehicle_count: 0
    };
    setOwners(prev => [...prev, newOwner]);
  };

  return (
    <AppLayout>
      <div className="page-container">
        <div className="content-wrapper">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">مالكي المركبات</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                إدارة ملاك المركبات والحسابات المالية
              </p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="btn-responsive flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة مالك
            </Button>
          </div>

          {/* Stats Section */}
          <div className="stats-container">
            <OwnerStats 
              stats={mockStats}
              loading={loading}
            />
          </div>

          {/* Filters */}
          <div className="dashboard-card mb-4 sm:mb-6">
            <OwnerFilters 
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Main Content */}
          <div className="dashboard-card">
            <OwnerTable 
              owners={owners}
              loading={loading}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        </div>

        {/* Add Owner Dialog */}
        <AddOwnerDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
          onAdd={handleAdd}
        />
      </div>
    </AppLayout>
  );
};

export default Owners;
