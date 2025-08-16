
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedCustomerFilters } from '@/components/Customers/EnhancedCustomerFilters';
import { EnhancedCustomerTable } from '@/components/Customers/EnhancedCustomerTable';
import { CustomerQuickActions } from '@/components/Customers/CustomerQuickActions';
import { NewAddCustomerDialog } from '@/components/Customers/NewAddCustomerDialog';
import { CustomerDetailsDialog } from '@/components/Customers/CustomerDetailsDialog';
import { BlacklistDialog } from '@/components/Customers/BlacklistDialog';
import { DeleteCustomerDialog } from '@/components/Customers/DeleteCustomerDialog';
import { exportCustomersToExcel } from '@/components/Customers/CustomerExportUtils';
import { useCustomersNew } from '@/hooks/useCustomersNew';
import { useCustomerSelection } from '@/hooks/useCustomerSelection';
import { Customer, CustomerFilters } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

export default function CustomersNew() {
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { customers, loading, refetch, deleteCustomer, addToBlacklist, removeFromBlacklist } = useCustomersNew();
  const { selectedCustomers, toggleCustomer, toggleAll, clearSelection } = useCustomerSelection();
  const { toast } = useToast();

  console.log('📊 CustomersNew render:', { 
    customersCount: customers.length, 
    loading, 
    selectedCount: selectedCustomers.length 
  });

  // Filter customers based on filters
  const filteredCustomers = customers.filter(customer => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !customer.name.toLowerCase().includes(searchLower) &&
        !customer.phone.includes(filters.search) &&
        (!customer.email || !customer.email.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'active' && !customer.is_active) return false;
      if (filters.status === 'inactive' && customer.is_active) return false;
    }

    if (filters.blacklisted !== undefined) {
      if (filters.blacklisted !== customer.blacklisted) return false;
    }

    if (filters.rating && customer.rating && customer.rating < filters.rating) {
      return false;
    }

    if (filters.city && customer.city && !customer.city.includes(filters.city)) {
      return false;
    }

    if (filters.nationality && customer.nationality && customer.nationality !== filters.nationality) {
      return false;
    }

    if (filters.dateFrom && customer.created_at) {
      const customerDate = new Date(customer.created_at);
      if (customerDate < filters.dateFrom) return false;
    }

    if (filters.dateTo && customer.created_at) {
      const customerDate = new Date(customer.created_at);
      if (customerDate > filters.dateTo) return false;
    }

    return true;
  });

  // Event handlers
  const handleAddCustomer = () => {
    console.log('🆕 Opening add customer dialog');
    setEditingCustomer(null);
    setShowAddDialog(true);
  };

  const handleEdit = (customer: Customer) => {
    console.log('🔄 Opening edit dialog for customer:', customer.id);
    setEditingCustomer(customer);
    setShowAddDialog(true);
  };

  const handleView = (customer: Customer) => {
    console.log('👁️ Opening view dialog for customer:', customer.id);
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };

  const handleBlacklist = (customer: Customer) => {
    console.log('⚫ Opening blacklist dialog for customer:', customer.id);
    setSelectedCustomer(customer);
    setShowBlacklistDialog(true);
  };

  const handleDelete = (customer: Customer) => {
    console.log('🗑️ Opening delete dialog for customer:', customer.id);
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const handleBlacklistAction = async (customerId: string, reason: string) => {
    console.log('⚫ Blacklisting customer:', customerId, reason);
    try {
      const result = await addToBlacklist(customerId, reason);
      if (result.success) {
        console.log('✅ Customer blacklisted successfully');
        setShowBlacklistDialog(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('❌ Error blacklisting customer:', error);
    }
  };

  const handleRemoveFromBlacklist = async (customerId: string) => {
    console.log('⚪ Removing customer from blacklist:', customerId);
    try {
      const result = await removeFromBlacklist(customerId);
      if (result.success) {
        console.log('✅ Customer removed from blacklist successfully');
      }
    } catch (error) {
      console.error('❌ Error removing from blacklist:', error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    console.log('🗑️ Deleting customer:', customerId);
    try {
      const result = await deleteCustomer(customerId);
      if (result.success) {
        console.log('✅ Customer deleted successfully');
        clearSelection();
        setShowDeleteDialog(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    
    console.log('🗑️ Bulk deleting customers:', selectedCustomers);
    try {
      for (const customerId of selectedCustomers) {
        await deleteCustomer(customerId);
      }
      toast({
        title: "تم الحذف",
        description: `تم حذف ${selectedCustomers.length} عميل بنجاح`
      });
      clearSelection();
    } catch (error) {
      console.error('❌ Error bulk deleting customers:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العملاء",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    console.log('📤 Exporting customers:', filteredCustomers.length);
    const success = exportCustomersToExcel(filteredCustomers);
    if (success) {
      toast({
        title: "تم التصدير",
        description: "تم تصدير بيانات العملاء بنجاح"
      });
    } else {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive"
      });
    }
  };

  const handleDialogClose = () => {
    console.log('🔒 Closing dialogs and resetting states');
    setSelectedCustomer(null);
    setEditingCustomer(null);
    setShowAddDialog(false);
    setShowDetailsDialog(false);
    setShowBlacklistDialog(false);
    setShowDeleteDialog(false);
  };

  const handleSelectAll = (checked: boolean) => {
    toggleAll(checked, filteredCustomers.map(c => c.id));
  };

  const handleFiltersChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة العملاء - الجديد</h1>
            <p className="text-muted-foreground">
              إدارة شاملة ومحسنة لبيانات العملاء
            </p>
          </div>
        </div>

        <CustomerQuickActions
          onAddCustomer={handleAddCustomer}
          onExport={handleExport}
          onImport={() => {}} // Will implement later
          onRefresh={refetch}
          onAdvancedSearch={() => {}} // Will implement later
          onShowTemplates={() => {}} // Will implement later
          onBulkDelete={handleBulkDelete}
          selectedCount={selectedCustomers.length}
          totalCount={filteredCustomers.length}
          loading={loading}
        />

        <EnhancedCustomerFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
          onRefresh={refetch}
          totalCount={customers.length}
          filteredCount={filteredCustomers.length}
        />

        <EnhancedCustomerTable
          customers={filteredCustomers}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onBlacklist={handleBlacklist}
          onDelete={handleDelete}
          selectedCustomers={selectedCustomers}
          onSelectCustomer={toggleCustomer}
          onSelectAll={handleSelectAll}
        />

        {/* Dialogs */}
        <NewAddCustomerDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          editingCustomer={editingCustomer}
          onClose={handleDialogClose}
        />

        <CustomerDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          customer={selectedCustomer}
          onEdit={(customer) => {
            setEditingCustomer(customer);
            setShowDetailsDialog(false);
            setShowAddDialog(true);
          }}
          onDelete={(customer) => {
            setSelectedCustomer(customer);
            setShowDetailsDialog(false);
            setShowDeleteDialog(true);
          }}
        />

        <BlacklistDialog
          open={showBlacklistDialog}
          onOpenChange={setShowBlacklistDialog}
          customer={selectedCustomer}
          onBlacklist={handleBlacklistAction}
          onRemoveFromBlacklist={handleRemoveFromBlacklist}
        />

        <DeleteCustomerDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          customer={selectedCustomer}
          onDelete={handleDeleteCustomer}
        />
      </div>
    </AppLayout>
  );
}
