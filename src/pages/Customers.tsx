import { useState, useEffect } from 'react';
import { CustomerStats } from '@/components/Customers/CustomerStats';
import { CustomerSearchAndFilter } from '@/components/Customers/CustomerSearchAndFilter';
import { EnhancedCustomerTable } from '@/components/Customers/EnhancedCustomerTable';
import { AddCustomerDialog } from '@/components/Customers/AddCustomerDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Customer } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Customers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const { toast } = useToast();

  // جلب بيانات العملاء من قاعدة البيانات
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data as any || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب بيانات العملاء',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات من البيانات الحقيقية
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.is_active).length,
    newCustomersThisMonth: customers.filter(c => {
      const createdDate = new Date(c.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length,
    averageRating: customers.length > 0 
      ? customers.reduce((sum, c) => sum + (c.rating || 0), 0) / customers.length 
      : 0
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleEdit = (customer: Customer) => {
    console.log('Edit customer:', customer.id);
  };

  const handleView = (customer: Customer) => {
    console.log('View customer:', customer.id);
  };

  const handleDelete = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف العميل بنجاح'
      });
      
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف العميل',
        variant: 'destructive'
      });
    }
  };

  const handleBlacklist = (customer: Customer) => {
    console.log('Blacklist customer:', customer.id);
  };

  const handleExport = () => {
    console.log('Export customers');
  };

  const handleBulkAction = (action: string, customerIds: string[]) => {
    console.log('Bulk action:', action, customerIds);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCustomers(checked ? customers.map(c => c.id) : []);
  };

  return (
    <div className="content-spacing">
      {/* Page Header */}
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
      <div className="stats-container mb-6">
        <CustomerStats 
          totalCustomers={stats.totalCustomers}
          activeCustomers={stats.activeCustomers}
          newCustomersThisMonth={stats.newCustomersThisMonth}
          averageRating={stats.averageRating}
        />
      </div>

      {/* Search and Filters */}
      <div className="dashboard-card mb-4 sm:mb-6">
        <CustomerSearchAndFilter 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          totalResults={stats.totalCustomers}
        />
      </div>

      {/* Main Content */}
      <div className="dashboard-card">
        <EnhancedCustomerTable 
          customers={customers}
          loading={loading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onBlacklist={handleBlacklist}
          selectedCustomers={selectedCustomers}
          onSelectCustomer={handleSelectCustomer}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* Add Customer Dialog */}
      <AddCustomerDialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            fetchCustomers();
          }
        }}
      />
    </div>
  );
};

export default Customers;
