
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { OwnerStats } from '@/components/Owners/OwnerStats';
import { OwnerFilters } from '@/components/Owners/OwnerFilters';
import { OwnerTable } from '@/components/Owners/OwnerTable';
import { AddOwnerDialog } from '@/components/Owners/AddOwnerDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Owners = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
            <OwnerStats />
          </div>

          {/* Filters */}
          <div className="dashboard-card mb-4 sm:mb-6">
            <OwnerFilters />
          </div>

          {/* Main Content */}
          <div className="dashboard-card">
            <OwnerTable />
          </div>
        </div>

        {/* Add Owner Dialog */}
        <AddOwnerDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
        />
      </div>
    </AppLayout>
  );
};

export default Owners;
