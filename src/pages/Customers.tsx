
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { CustomerStats } from '@/components/Customers/CustomerStats';
import { CustomerSearchAndFilter } from '@/components/Customers/CustomerSearchAndFilter';
import { EnhancedCustomerTable } from '@/components/Customers/EnhancedCustomerTable';
import { AddCustomerDialog } from '@/components/Customers/AddCustomerDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Customers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState({});

  // Mock stats data
  const mockStats = {
    totalCustomers: 245,
    activeCustomers: 198,
    newCustomersThisMonth: 23,
    averageRating: 4.2
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Page Header */}
        <div className="content-wrapper">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">العملاء</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                إدارة بيانات العملاء والمعاملات المالية
              </p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="btn-responsive flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة عميل
            </Button>
          </div>

          {/* Stats Section */}
          <div className="stats-container">
            <CustomerStats 
              totalCustomers={mockStats.totalCustomers}
              activeCustomers={mockStats.activeCustomers}
              newCustomersThisMonth={mockStats.newCustomersThisMonth}
              averageRating={mockStats.averageRating}
            />
          </div>

          {/* Search and Filters */}
          <div className="dashboard-card mb-4 sm:mb-6">
            <CustomerSearchAndFilter 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              totalResults={mockStats.totalCustomers}
            />
          </div>

          {/* Main Content */}
          <div className="dashboard-card">
            <EnhancedCustomerTable />
          </div>
        </div>

        {/* Add Customer Dialog */}
        <AddCustomerDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen} 
        />
      </div>
    </AppLayout>
  );
};

export default Customers;
