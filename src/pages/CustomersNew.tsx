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
import { Customer as NewCustomer, CustomerFilters as NewCustomerFilters } from '@/types/customer';
import { Customer as LegacyCustomer } from '@/types/index';
import { useToast } from '@/hooks/use-toast';

// Convert new customer format to legacy format for compatibility with existing components
const convertToLegacyCustomer = (customer: NewCustomer): LegacyCustomer => {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    nationalId: customer.national_id,
    licenseNumber: customer.license_number || '',
    licenseExpiry: customer.license_expiry ? new Date(customer.license_expiry) : new Date(),
    totalRentals: customer.total_rentals,
    rating: customer.rating,
    is_active: customer.is_active,
    blacklisted: customer.blacklisted,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
    city: customer.city || '',
    nationality: customer.nationality,
    national_id: customer.national_id,
    gender: customer.gender,
    marital_status: customer.marital_status,
    license_number: customer.license_number || '',
    license_expiry: customer.license_expiry,
    date_of_birth: customer.date_of_birth,
    country: customer.country,
    district: customer.district || '',
    postal_code: customer.postal_code || '',
    address: customer.address || '',
    address_type: customer.address_type,
    preferred_language: customer.preferred_language,
    marketing_consent: customer.marketing_consent,
    sms_notifications: customer.sms_notifications,
    email_notifications: customer.email_notifications,
    customer_source: customer.customer_source,
    job_title: customer.job_title || '',
    company: customer.company || '',
    work_phone: customer.work_phone || '',
    monthly_income: customer.monthly_income,
    bank_name: customer.bank_name || '',
    bank_account_number: customer.bank_account_number || '',
    credit_limit: customer.credit_limit,
    payment_terms: customer.payment_terms,
    preferred_payment_method: customer.preferred_payment_method,
    emergency_contact_name: customer.emergency_contact_name || '',
    emergency_contact_phone: customer.emergency_contact_phone || '',
    emergency_contact_relation: customer.emergency_contact_relation || '',
    has_insurance: customer.has_insurance,
    insurance_company: customer.insurance_company || '',
    insurance_policy_number: customer.insurance_policy_number || '',
    insurance_expiry: customer.insurance_expiry,
    international_license: customer.international_license,
    international_license_expiry: customer.international_license_expiry,
    blacklist_reason: customer.blacklist_reason || '',
    blacklist_date: customer.blacklist_date,
    total_rentals: customer.total_rentals,
    last_rental_date: customer.last_rental_date,
    license_type: customer.license_type,
    license_issue_date: customer.license_issue_date,
    notes: customer.notes || ''
  };
};

// Convert legacy customer back to new format
const convertToNewCustomer = (customer: LegacyCustomer): NewCustomer => {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    national_id: customer.nationalId,
    nationality: customer.nationality || 'سعودي',
    city: customer.city,
    address: '',
    license_number: customer.licenseNumber,
    license_expiry: customer.licenseExpiry ? customer.licenseExpiry.toISOString().split('T')[0] : undefined,
    license_type: 'private',
    license_issue_date: undefined,
    gender: 'male',
    marital_status: 'single',
    date_of_birth: undefined,
    country: 'السعودية',
    district: '',
    postal_code: '',
    address_type: 'residential',
    preferred_language: 'ar',
    marketing_consent: false,
    sms_notifications: true,
    email_notifications: true,
    customer_source: 'website',
    job_title: '',
    company: '',
    work_phone: '',
    monthly_income: 0,
    bank_name: '',
    bank_account_number: '',
    credit_limit: 0,
    payment_terms: 'immediate',
    preferred_payment_method: 'cash',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    has_insurance: false,
    insurance_company: '',
    insurance_policy_number: '',
    insurance_expiry: undefined,
    international_license: false,
    international_license_expiry: undefined,
    is_active: customer.is_active,
    blacklisted: customer.blacklisted,
    blacklist_reason: '',
    blacklist_date: '',
    rating: customer.rating,
    total_rentals: customer.totalRentals,
    last_rental_date: undefined,
    nationalId: customer.nationalId,
    licenseNumber: customer.licenseNumber,
    licenseExpiry: customer.licenseExpiry ? customer.licenseExpiry.toISOString().split('T')[0] : undefined,
    totalRentals: customer.totalRentals,
    notes: '',
    created_at: customer.created_at,
    updated_at: customer.updated_at
  };
};

export default function CustomersNew() {
  const [filters, setFilters] = useState<NewCustomerFilters>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<NewCustomer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<NewCustomer | null>(null);

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

  // Convert to legacy format for existing components
  const legacyCustomers = filteredCustomers.map(convertToLegacyCustomer);

  // Event handlers
  const handleAddCustomer = () => {
    console.log('🆕 Opening add customer dialog');
    setEditingCustomer(null);
    setShowAddDialog(true);
  };

  const handleEdit = (customer: LegacyCustomer) => {
    console.log('🔄 Opening edit dialog for customer:', customer.id);
    const newCustomer = convertToNewCustomer(customer);
    setEditingCustomer(newCustomer);
    setShowAddDialog(true);
  };

  const handleView = (customer: LegacyCustomer) => {
    console.log('👁️ Opening view dialog for customer:', customer.id);
    const newCustomer = convertToNewCustomer(customer);
    setSelectedCustomer(newCustomer);
    setShowDetailsDialog(true);
  };

  const handleBlacklist = (customer: LegacyCustomer) => {
    console.log('⚫ Opening blacklist dialog for customer:', customer.id);
    const newCustomer = convertToNewCustomer(customer);
    setSelectedCustomer(newCustomer);
    setShowBlacklistDialog(true);
  };

  const handleDelete = (customer: LegacyCustomer) => {
    console.log('🗑️ Opening delete dialog for customer:', customer.id);
    const newCustomer = convertToNewCustomer(customer);
    setSelectedCustomer(newCustomer);
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
    console.log('📤 Exporting customers:', legacyCustomers.length);
    const success = exportCustomersToExcel(legacyCustomers);
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
    toggleAll(checked, legacyCustomers.map(c => c.id));
  };

  const handleFiltersChange = (newFilters: any) => {
    // Convert legacy filters to new format
    const convertedFilters: NewCustomerFilters = {
      search: newFilters.search,
      rating: newFilters.rating,
      status: newFilters.status,
      blacklisted: newFilters.blacklisted,
      license_expiry: newFilters.license_expiry,
      city: newFilters.city,
      customer_source: newFilters.customer_source,
      nationality: newFilters.nationality,
      gender: newFilters.gender,
      marital_status: newFilters.marital_status,
      dateFrom: newFilters.dateFrom,
      dateTo: newFilters.dateTo,
      dateRange: newFilters.dateRange
    };
    setFilters(convertedFilters);
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
          totalCount={legacyCustomers.length}
          loading={loading}
        />

        <EnhancedCustomerFilters
          filters={filters as any}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
          onRefresh={refetch}
          totalCount={customers.length}
          filteredCount={legacyCustomers.length}
        />

        <EnhancedCustomerTable
          customers={legacyCustomers}
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

        {selectedCustomer && (
          <CustomerDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            customer={convertToLegacyCustomer(selectedCustomer)}
            onEdit={(customer) => {
              const newCustomer = convertToNewCustomer(customer);
              setEditingCustomer(newCustomer);
              setShowDetailsDialog(false);
              setShowAddDialog(true);
            }}
            onDelete={(customer) => {
              const newCustomer = convertToNewCustomer(customer);
              setSelectedCustomer(newCustomer);
              setShowDetailsDialog(false);
              setShowDeleteDialog(true);
            }}
          />
        )}

        {selectedCustomer && (
          <BlacklistDialog
            open={showBlacklistDialog}
            onOpenChange={setShowBlacklistDialog}
            customer={convertToLegacyCustomer(selectedCustomer)}
            onBlacklist={handleBlacklistAction}
            onRemoveFromBlacklist={handleRemoveFromBlacklist}
          />
        )}

        {selectedCustomer && (
          <DeleteCustomerDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            customer={convertToLegacyCustomer(selectedCustomer)}
            onDelete={handleDeleteCustomer}
          />
        )}
      </div>
    </AppLayout>
  );
}
