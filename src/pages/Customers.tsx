import { useState, useMemo } from "react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedCustomerStats } from "@/components/Customers/EnhancedCustomerStats";
import { EnhancedCustomerFilters, CustomerFilters } from "@/components/Customers/EnhancedCustomerFilters";
import { EnhancedCustomerTable } from "@/components/Customers/EnhancedCustomerTable";
import { CustomerBulkActions } from "@/components/Customers/CustomerBulkActions";
import { CustomerCard } from "@/components/Customers/CustomerCard";
import { CustomerLoadingSkeleton } from "@/components/Customers/CustomerLoadingSkeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AddCustomerDialog } from "@/components/Customers/AddCustomerDialog";
import { CustomerDetailsDialog } from "@/components/Customers/CustomerDetailsDialog";
import { BlacklistDialog } from "@/components/Customers/BlacklistDialog";
import { useCustomers, Customer } from "@/hooks/useCustomers";
import { Plus, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const {
    customers,
    loading,
    stats,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    blacklistCustomer,
    removeFromBlacklist,
  } = useCustomers();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  
  // Enhanced filters
  const [filters, setFilters] = useState<CustomerFilters>({});
  const { toast } = useToast();

  // Enhanced filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm) ||
                             customer.phone.includes(searchTerm) ||
                             (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
                             customer.national_id.includes(searchTerm);
        if (!matchesSearch) return false;
      }
      
      // Rating filter
      if (filters.rating && customer.rating < filters.rating) return false;
      
      // Status filter
      if (filters.status === 'active' && !customer.is_active) return false;
      if (filters.status === 'inactive' && customer.is_active) return false;
      
      // Document status filter
      if (filters.documentStatus) {
        const licenseExpiry = new Date(customer.license_expiry);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filters.documentStatus === 'valid' && daysUntilExpiry <= 30) return false;
        if (filters.documentStatus === 'expiring' && (daysUntilExpiry > 30 || daysUntilExpiry < 0)) return false;
        if (filters.documentStatus === 'expired' && daysUntilExpiry >= 0) return false;
      }

      // Blacklist filter
      if (filters.blacklisted !== undefined && customer.blacklisted !== filters.blacklisted) return false;
      
      // City filter
      if (filters.city && customer.city !== filters.city) return false;
      
      // Nationality filter
      if (filters.nationality && customer.nationality !== filters.nationality) return false;
      
      // Customer source filter
      if (filters.customerSource && customer.customer_source !== filters.customerSource) return false;
      
      // Date range filters
      if (filters.dateFrom && new Date(customer.created_at) < filters.dateFrom) return false;
      if (filters.dateTo && new Date(customer.created_at) > filters.dateTo) return false;
      
      return true;
    });
  }, [customers, filters]);

  // Enhanced stats calculation
  const enhancedStats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.is_active).length;
    const inactive = total - active;
    const blacklisted = customers.filter(c => c.blacklisted).length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = customers.filter(c => {
      const createdDate = new Date(c.created_at);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    const averageRating = total > 0 ? customers.reduce((sum, c) => sum + c.rating, 0) / total : 0;
    const totalRentals = customers.reduce((sum, c) => sum + (c.total_rentals || 0), 0);
    
    // Calculate document statuses
    const today = new Date();
    const expiringDocuments = customers.filter(c => {
      const daysUntilExpiry = Math.ceil((new Date(c.license_expiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length;
    
    const expiredDocuments = customers.filter(c => {
      const daysUntilExpiry = Math.ceil((new Date(c.license_expiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry < 0;
    }).length;
    
    const repeatCustomers = customers.filter(c => (c.total_rentals || 0) > 1).length;
    const highValueCustomers = customers.filter(c => (c.total_rentals || 0) >= 5).length;

    return {
      total,
      active,
      inactive,
      blacklisted,
      newThisMonth,
      averageRating,
      totalRentals,
      averageRentalValue: 0,
      expiringDocuments,
      expiredDocuments,
      repeatCustomers,
      highValueCustomers
    };
  }, [customers]);

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addCustomer(customerData);
      setShowAddDialog(false);
    } catch (error) {
      console.error('خطأ في إضافة العميل:', error);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowAddDialog(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
  };

  const handleBlacklistCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowBlacklistDialog(true);
  };

  const handleBlacklist = async (customerId: string, reason: string) => {
    try {
      await blacklistCustomer(customerId, reason);
      setShowBlacklistDialog(false);
    } catch (error) {
      console.error('خطأ في إضافة العميل للقائمة السوداء:', error);
    }
  };

  const handleRemoveFromBlacklist = async (customerId: string) => {
    try {
      await removeFromBlacklist(customerId);
      setShowBlacklistDialog(false);
    } catch (error) {
      console.error('خطأ في إزالة العميل من القائمة السوداء:', error);
    }
  };

  // Bulk actions handlers
  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCustomers(checked ? filteredCustomers.map(c => c.id) : []);
  };

  const handleBulkBlacklist = async (customerIds: string[], reason: string) => {
    try {
      await Promise.all(customerIds.map(id => blacklistCustomer(id, reason)));
      toast({
        title: 'تم بنجاح',
        description: `تم إضافة ${customerIds.length} عميل للقائمة السوداء`,
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة العملاء للقائمة السوداء',
        variant: 'destructive',
      });
    }
  };

  const handleBulkRemoveBlacklist = async (customerIds: string[]) => {
    try {
      await Promise.all(customerIds.map(id => removeFromBlacklist(id)));
      toast({
        title: 'تم بنجاح',
        description: `تم إزالة ${customerIds.length} عميل من القائمة السوداء`,
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة العملاء من القائمة السوداء',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async (customerIds: string[]) => {
    try {
      await Promise.all(customerIds.map(id => deleteCustomer(id)));
      toast({
        title: 'تم بنجاح',
        description: `تم حذف ${customerIds.length} عميل`,
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف العملاء',
        variant: 'destructive',
      });
    }
  };

  const handleBulkExport = (customerIds: string[]) => {
    const selectedData = customers.filter(c => customerIds.includes(c.id));
    const csvContent = [
      ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'التقييم', 'إجمالي الإيجارات'].join(','),
      ...selectedData.map(c => [
        c.name,
        c.phone,
        c.email || '',
        c.rating,
        c.total_rentals || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleBulkEmail = (customerIds: string[]) => {
    const emails = customers
      .filter(c => customerIds.includes(c.id) && c.email)
      .map(c => c.email)
      .join(',');
    
    if (emails) {
      window.open(`mailto:${emails}`);
    }
  };

  const handleBulkSMS = (customerIds: string[]) => {
    // This would integrate with SMS service
    toast({
      title: 'ميزة قادمة',
      description: 'سيتم إضافة خدمة الرسائل النصية قريباً',
    });
  };

  const handleExport = () => {
    handleBulkExport(filteredCustomers.map(c => c.id));
  };

  const handleRefresh = () => {
    fetchCustomers();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">إدارة العملاء</h1>
                <p className="text-muted-foreground">إدارة قاعدة بيانات العملاء وتتبع نشاطهم</p>
              </div>
              <Button onClick={() => setShowAddDialog(true)} disabled={loading}>
                <Plus className="h-4 w-4 ml-2" />
                عميل جديد
              </Button>
            </div>

            {/* Enhanced Statistics */}
            <EnhancedCustomerStats 
              stats={enhancedStats} 
              isLoading={loading}
            />

            {/* Enhanced Filters */}
            <EnhancedCustomerFilters
              filters={filters}
              onFiltersChange={setFilters}
              onExport={handleExport}
              onRefresh={handleRefresh}
              totalCount={customers.length}
              filteredCount={filteredCustomers.length}
            />

            {/* Bulk Actions */}
            <CustomerBulkActions
              selectedCustomers={selectedCustomers}
              customers={filteredCustomers}
              onClearSelection={() => setSelectedCustomers([])}
              onBulkBlacklist={handleBulkBlacklist}
              onBulkRemoveBlacklist={handleBulkRemoveBlacklist}
              onBulkDelete={handleBulkDelete}
              onBulkExport={handleBulkExport}
              onBulkEmail={handleBulkEmail}
              onBulkSMS={handleBulkSMS}
            />

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">عرض:</span>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
                  <TabsList className="grid w-fit grid-cols-2">
                    <TabsTrigger value="table" className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      جدول
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="flex items-center gap-2">
                      <Grid className="h-4 w-4" />
                      بطاقات
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {filteredCustomers.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  عرض {filteredCustomers.length} من {customers.length} عميل
                </div>
              )}
            </div>

            {/* Customer Display */}
            <ErrorBoundary>
              {viewMode === 'table' ? (
                <EnhancedCustomerTable
                  customers={filteredCustomers}
                  loading={loading}
                  onEdit={handleEditCustomer}
                  onView={handleViewCustomer}
                  onBlacklist={handleBlacklistCustomer}
                  selectedCustomers={selectedCustomers}
                  onSelectCustomer={handleSelectCustomer}
                  onSelectAll={handleSelectAll}
                />
              ) : (
                <>
                  {loading && <CustomerLoadingSkeleton viewMode="grid" />}

                  {!loading && filteredCustomers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCustomers.map((customer) => (
                        <CustomerCard
                          key={customer.id}
                          customer={customer}
                          onEdit={handleEditCustomer}
                          onView={handleViewCustomer}
                          onBlacklist={handleBlacklistCustomer}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </ErrorBoundary>

            {/* Empty State */}
            {!loading && filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {customers.length === 0 ? 'لا توجد عملاء مسجلين' : 'لا توجد عملاء تطابق معايير البحث'}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    if (customers.length === 0) {
                      setShowAddDialog(true);
                    } else {
                      setFilters({});
                    }
                  }}
                >
                  {customers.length === 0 ? 'إضافة أول عميل' : 'مسح الفلاتر'}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <AddCustomerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddCustomer}
      />

      <CustomerDetailsDialog
        customer={selectedCustomer}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onEdit={handleEditCustomer}
      />

      <BlacklistDialog
        customer={selectedCustomer}
        open={showBlacklistDialog}
        onOpenChange={setShowBlacklistDialog}
        onBlacklist={handleBlacklist}
        onRemoveFromBlacklist={handleRemoveFromBlacklist}
      />
    </div>
  );
}