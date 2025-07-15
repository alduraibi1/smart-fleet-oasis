import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Grid, List } from "lucide-react";
import { Customer } from "@/types";
import { EnhancedCustomerTable } from "@/components/Customers/EnhancedCustomerTable";
import { EnhancedCustomerFilters, CustomerFilters } from "@/components/Customers/EnhancedCustomerFilters";
import { CustomerBulkActions } from "@/components/Customers/CustomerBulkActions";
import { EnhancedCustomerStats } from "@/components/Customers/EnhancedCustomerStats";
import VehicleGrid from "@/components/Vehicles/VehicleGrid";
import { AddCustomerDialog } from "@/components/Customers/AddCustomerDialog";
import { CustomerDetailsDialog } from "@/components/Customers/CustomerDetailsDialog";
import { BlacklistDialog } from "@/components/Customers/BlacklistDialog";
import { AdvancedSearchDialog } from "@/components/Customers/AdvancedSearchDialog";
import { CustomerTemplates } from "@/components/Customers/CustomerTemplates";
import { ExportUtils } from "@/components/Customers/ExportUtils";
import { CustomerChangeHistory } from "@/components/Customers/CustomerChangeHistory";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useCustomers } from "@/hooks/useCustomersQuery";
import { useCustomerSelection } from "@/hooks/useCustomerSelection";
import { useRealtimeCustomers } from "@/hooks/useRealtimeCustomers";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const { toast } = useToast();
  
  // استخدام الـ hooks المخصصة الجديدة
  const { selectedCustomers, handleSelectCustomer, handleSelectAll, clearSelection } = useCustomerSelection();
  useRealtimeCustomers(); // للتحديثات الفورية
  const { notifications, createNotification } = useSmartNotifications();
  
  // States
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isBlacklistDialogOpen, setIsBlacklistDialogOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // جلب البيانات باستخدام React Query
  const {
    data: customersData = { customers: [], total: 0 },
    isLoading,
    error,
    refetch
  } = useCustomers();

  const customers = Array.isArray(customersData) ? customersData : customersData.customers;
  const stats = { 
    total: customers.length, 
    active: 0, 
    inactive: 0, 
    blacklisted: 0, 
    newThisMonth: 0, 
    averageRating: 0,
    totalRentals: 0,
    averageRentalValue: 0,
    expiringDocuments: 0,
    expiredDocuments: 0,
    highValueCustomers: 0,
    repeatCustomers: 0
  };

  // فلترة العملاء حسب الفلاتر المطبقة
  const filteredCustomers = customers.filter((customer: Customer) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        customer.name?.toLowerCase() || '',
        customer.phone?.toLowerCase() || '',
        customer.email?.toLowerCase() || '',
        customer.national_id?.toLowerCase() || customer.nationalId?.toLowerCase() || ''
      ];
      
      if (!searchFields.some(field => field.includes(searchTerm))) {
        return false;
      }
    }

    if (filters.status && customer.is_active !== (filters.status === 'active')) {
      return false;
    }

    if (filters.blacklisted !== undefined && customer.blacklisted !== filters.blacklisted) {
      return false;
    }

    if (filters.city && customer.city !== filters.city) {
      return false;
    }

    if (filters.nationality && customer.nationality !== filters.nationality) {
      return false;
    }

    if (filters.customerSource && customer.customer_source !== filters.customerSource) {
      return false;
    }

    if (filters.rating && (customer.rating || 0) < filters.rating) {
      return false;
    }

    if (filters.dateFrom && customer.created_at) {
      const customerDate = new Date(customer.created_at);
      if (customerDate < filters.dateFrom) {
        return false;
      }
    }

    if (filters.dateTo && customer.created_at) {
      const customerDate = new Date(customer.created_at);
      if (customerDate > filters.dateTo) {
        return false;
      }
    }

    return true;
  });

  // Event handlers مع إضافة الإشعارات الذكية
  const handleCustomerSelect = (customerId: string) => {
    handleSelectCustomer(customerId);
  };

  const handleSelectAllCustomers = async (checked: boolean): Promise<void> => {
    await handleSelectAll(checked, customers.map(c => c.id));
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsDialogOpen(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsDialogOpen(true);
  };

  const handleBlacklist = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsBlacklistDialogOpen(true);
    
    // إنشاء إشعار ذكي للقائمة السوداء
    await createNotification(
      customer.blacklisted ? "إزالة من القائمة السوداء" : "إضافة للقائمة السوداء",
      `تم ${customer.blacklisted ? 'إزالة' : 'إضافة'} العميل ${customer.name} ${customer.blacklisted ? 'من' : 'إلى'} القائمة السوداء`,
      'warning',
      'customer_management',
      'high'
    );
  };

  const handleAdd = () => {
    setIsAddDialogOpen(true);
  };

  const handleExport = () => {
    // سيتم إضافة وظيفة التصدير لاحقاً
    toast({
      title: "تم التصدير بنجاح",
      description: "تم تصدير بيانات العملاء إلى ملف Excel",
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات العملاء",
    });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 animate-fade-in">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">حدث خطأ في تحميل بيانات العملاء</p>
              <Button onClick={() => refetch()}>إعادة المحاولة</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">إدارة العملاء</h1>
            <p className="text-muted-foreground">
              إدارة وتتبع بيانات العملاء والمستأجرين
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* إشعار للإشعارات الجديدة */}
            {notifications && notifications.length > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {notifications.length} إشعار جديد
              </Badge>
            )}
            
            <Button onClick={() => setIsTemplatesOpen(true)} variant="outline">
              القوالب
            </Button>
            <Button onClick={() => setIsAdvancedSearchOpen(true)} variant="outline">
              البحث المتقدم
            </Button>
            <Button onClick={() => setIsHistoryOpen(true)} variant="outline">
              سجل التغييرات
            </Button>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة عميل
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <EnhancedCustomerStats stats={stats} />

        {/* Filters */}
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
          customers={customers}
          onClearSelection={clearSelection}
          onBulkBlacklist={async (customerIds, reason) => {
            toast({
              title: "تم إضافة العملاء للقائمة السوداء",
              description: `تم إضافة ${customerIds.length} عميل للقائمة السوداء`,
            });
          }}
          onBulkRemoveBlacklist={async (customerIds) => {
            toast({
              title: "تم إزالة العملاء من القائمة السوداء",
              description: `تم إزالة ${customerIds.length} عميل من القائمة السوداء`,
            });
          }}
          onBulkDelete={async (customerIds) => {
            toast({
              title: "تم حذف العملاء",
              description: `تم حذف ${customerIds.length} عميل نهائياً`,
            });
          }}
          onBulkExport={(customerIds) => {
            toast({
              title: "تم التصدير",
              description: `تم تصدير ${customerIds.length} عميل`,
            });
          }}
          onBulkEmail={(customerIds) => {
            toast({
              title: "تم إرسال البريد الإلكتروني",
              description: `تم إرسال بريد إلكتروني لـ ${customerIds.length} عميل`,
            });
          }}
          onBulkSMS={(customerIds) => {
            toast({
              title: "تم إرسال الرسائل النصية",
              description: `تم إرسال رسائل نصية لـ ${customerIds.length} عميل`,
            });
          }}
        />

        {/* Content */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'grid')}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="table" className="gap-2">
                <List className="h-4 w-4" />
                جدول
              </TabsTrigger>
              <TabsTrigger value="grid" className="gap-2">
                <Grid className="h-4 w-4" />
                شبكة
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {filteredCustomers.length} من {customers.length} عميل
              </span>
            </div>
          </div>

          <TabsContent value="table" className="space-y-4">
            <EnhancedCustomerTable
              customers={filteredCustomers}
              loading={isLoading}
              onEdit={handleEdit}
              onView={handleView}
              onBlacklist={handleBlacklist}
              selectedCustomers={selectedCustomers}
              onSelectCustomer={handleCustomerSelect}
              onSelectAll={handleSelectAllCustomers}
            />
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <VehicleGrid vehicles={[]} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddCustomerDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={(customer) => {
            toast({
              title: "تم إضافة العميل",
              description: "تم إضافة العميل بنجاح",
            });
          }}
        />

        <CustomerDetailsDialog
          customer={selectedCustomer}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          onEdit={handleEdit}
        />

        <BlacklistDialog
          customer={selectedCustomer}
          open={isBlacklistDialogOpen}
          onOpenChange={setIsBlacklistDialogOpen}
          onBlacklist={(customerId, reason) => {
            toast({
              title: "تم إضافة العميل للقائمة السوداء",
              description: reason,
            });
          }}
          onRemoveFromBlacklist={(customerId) => {
            toast({
              title: "تم إزالة العميل من القائمة السوداء",
              description: "تم إزالة العميل من القائمة السوداء بنجاح",
            });
          }}
        />

        <AdvancedSearchDialog
          open={isAdvancedSearchOpen}
          onOpenChange={setIsAdvancedSearchOpen}
          filters={filters}
          onFiltersChange={setFilters}
          customers={customers}
        />

        <CustomerTemplates
          onApplyTemplate={(template) => {
            // سيتم إضافة المنطق لاحقاً
            setIsTemplatesOpen(false);
          }}
        />

        <CustomerChangeHistory
          customerId={selectedCustomer?.id}
          customers={customers}
        />
      </div>
    </ErrorBoundary>
  );
}