
import { useState } from 'react';
import { OwnerStats } from '@/components/Owners/OwnerStats';
import { OwnerFilters } from '@/components/Owners/OwnerFilters';
import { OwnerTable } from '@/components/Owners/OwnerTable';
import { AddOwnerDialog } from '@/components/Owners/AddOwnerDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useOwners, Owner } from '@/hooks/useOwners';

const Owners = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { owners, loading, stats, addOwner, updateOwner, deleteOwner, fetchOwners } = useOwners();

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    fetchOwners(filters);
  };

  const handleUpdate = async (id: string, owner: Partial<Owner>) => {
    await updateOwner(id, owner);
  };

  const handleDelete = async (id: string) => {
    await deleteOwner(id);
  };

  const handleAdd = async (owner: Omit<Owner, 'id' | 'created_at' | 'updated_at' | 'vehicle_count'>) => {
    await addOwner(owner);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="content-spacing">
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
      <div className="stats-container mb-6">
        <OwnerStats 
          stats={stats}
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

      {/* Add Owner Dialog */}
      <AddOwnerDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onAdd={handleAdd}
      />
    </div>
  );
};

export default Owners;
