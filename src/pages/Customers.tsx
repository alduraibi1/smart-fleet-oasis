
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedCustomerFilters, CustomerFilters } from '@/components/Customers/EnhancedCustomerFilters';
import { EnhancedCustomerTable } from '@/components/Customers/EnhancedCustomerTable';
import { CustomerQuickActions } from '@/components/Customers/CustomerQuickActions';
import { AddCustomerDialog } from '@/components/Customers/AddCustomerDialog';
import { CustomerDetailsDialog } from '@/components/Customers/CustomerDetailsDialog';
import { BlacklistDialog } from '@/components/Customers/BlacklistDialog';
import { CustomerImportDialog } from '@/components/Customers/CustomerImportDialog';
import { AdvancedSearchDialog } from '@/components/Customers/AdvancedSearchDialog';
import { CustomerTemplates } from '@/components/Customers/CustomerTemplates';
import { DeleteCustomerDialog } from '@/components/Customers/DeleteCustomerDialog';
import { exportCustomersToExcel } from '@/components/Customers/CustomerExportUtils';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerSelection } from '@/hooks/useCustomerSelection';
import { useCustomerActions } from '@/hooks/useCustomerActions';
import { Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Customers() {
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { customers, loading, refetch, deleteCustomer, addToBlacklist, removeFromBlacklist } = useCustomers();
  const { selectedCustomers, toggleCustomer, toggleAll, clearSelection } = useCustomerSelection();
  const { handleBlacklistToggle, handleActivateToggle } = useCustomerActions();
  const { toast } = useToast();

  // تصفية العملاء بناء على الفلاتر
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

  // معالجات الأحداث
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
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };

  const handleBlacklist = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowBlacklistDialog(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteDialog(true);
  };

  const handleBlacklistAction = async (customerId: string, reason: string) => {
    try {
      const result = await addToBlacklist(customerId, reason);
      if (result.success) {
        toast({
          title: "تم بنجاح",
          description: "تم إضافة العميل للقائمة السوداء"
        });
        await refetch();
      } else {
        throw new Error(result.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error blacklisting customer:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العميل للقائمة السوداء",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromBlacklist = async (customerId: string) => {
    try {
      const result = await removeFromBlacklist(customerId);
      if (result.success) {
        toast({
          title: "تم بنجاح",
          description: "تم إزالة العميل من القائمة السوداء"
        });
        await refetch();
      } else {
        throw new Error(result.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إزالة العميل من القائمة السوداء",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const result = await deleteCustomer(customerId);
      if (result.success) {
        toast({
          title: "تم الحذف",
          description: "تم حذف العميل بنجاح"
        });
        clearSelection();
        await refetch();
      } else {
        throw new Error(result.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    
    try {
      for (const customerId of selectedCustomers) {
        await deleteCustomer(customerId);
      }
      toast({
        title: "تم الحذف",
        description: `تم حذف ${selectedCustomers.length} عميل بنجاح`
      });
      clearSelection();
      await refetch();
    } catch (error) {
      console.error('Error bulk deleting customers:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العملاء",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
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
    // تحديث البيانات بعد إغلاق النافذة
    refetch();
  };

  const handleAdvancedSearch = (searchFilters: CustomerFilters) => {
    setFilters(searchFilters);
    setShowAdvancedSearch(false);
  };

  const handleSelectAll = (checked: boolean) => {
    toggleAll(checked, filteredCustomers.map(c => c.id));
  };

  const handleApplyTemplate = (template: any) => {
    setEditingCustomer(template.fields as Customer);
    setShowAddDialog(true);
    setShowTemplates(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة العملاء</h1>
            <p className="text-muted-foreground">
              إدارة شاملة لبيانات العملاء والمتابعة
            </p>
          </div>
        </div>

        <CustomerQuickActions
          onAddCustomer={handleAddCustomer}
          onExport={handleExport}
          onImport={() => setShowImportDialog(true)}
          onRefresh={refetch}
          onAdvancedSearch={() => setShowAdvancedSearch(true)}
          onShowTemplates={() => setShowTemplates(true)}
          onBulkDelete={handleBulkDelete}
          selectedCount={selectedCustomers.length}
          totalCount={filteredCustomers.length}
          loading={loading}
        />

        <EnhancedCustomerFilters
          filters={filters}
          onFiltersChange={setFilters}
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

        {/* نوافذ الحوار */}
        <AddCustomerDialog
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

        <CustomerImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onImportComplete={refetch}
        />

        <AdvancedSearchDialog
          open={showAdvancedSearch}
          onOpenChange={setShowAdvancedSearch}
          filters={filters}
          onSearch={handleAdvancedSearch}
          customers={customers}
        />

        <CustomerTemplates
          open={showTemplates}
          onOpenChange={setShowTemplates}
          onApplyTemplate={handleApplyTemplate}
        />
      </div>
    </AppLayout>
  );
}
