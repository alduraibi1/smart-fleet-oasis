import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  BarChart3, 
  Table,
  Grid,
  Plus,
  Download,
  Settings
} from 'lucide-react';

// المكونات المحسنة
import { CustomerAnalytics } from '@/components/Customers/CustomerAnalytics';
import { CustomerQuickActions } from '@/components/Customers/CustomerQuickActions';
import { CustomerSearchAndFilter } from '@/components/Customers/CustomerSearchAndFilter';
import { EnhancedCustomerTable } from '@/components/Customers/EnhancedCustomerTable';
import { AddCustomerDialog } from '@/components/Customers/AddCustomerDialog';
import { CustomerDetailsDialog } from '@/components/Customers/CustomerDetailsDialog';
import { BlacklistDialog } from '@/components/Customers/BlacklistDialog';
import { AdvancedSearchDialog } from '@/components/Customers/AdvancedSearchDialog';
import { CustomerTemplates } from '@/components/Customers/CustomerTemplates';
import { CustomerChangeHistory } from '@/components/Customers/CustomerChangeHistory';
import { CustomerBulkActions } from '@/components/Customers/CustomerBulkActions';

// Hooks والمساعدات
import { useCustomers } from '@/hooks/useCustomersQuery';
import { useCustomerSelection } from '@/hooks/useCustomerSelection';
import { useRealtimeCustomers } from '@/hooks/useRealtimeCustomers';
import { useToast } from '@/hooks/use-toast';
import { Customer, CustomerFilters } from '@/types';

// التخطيط العام
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function CustomersV2() {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // إدارة العملاء والبيانات
  const [filters, setFilters] = useState<CustomerFilters>({});
  const { data: customersData, isLoading, error, refetch } = useCustomers(filters);
  const customers = Array.isArray(customersData) ? customersData : customersData?.customers || [];
  const { selectedCustomers, handleSelectCustomer, handleSelectAll, clearSelection } = useCustomerSelection();
  useRealtimeCustomers(); // التحديثات الفورية

  // إدارة النوافذ المنبثقة
  const [dialogs, setDialogs] = useState({
    add: false,
    details: false,
    blacklist: false,
    advancedSearch: false,
    templates: false,
    history: false,
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [activeTab, setActiveTab] = useState('overview');

  // فلترة البيانات
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.phone.toLowerCase().includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm) ||
          customer.national_id.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });
  }, [customers, filters]);

  // معالجات الأحداث
  const handleOpenDialog = (dialog: keyof typeof dialogs, customer?: Customer) => {
    if (customer) setSelectedCustomer(customer);
    setDialogs(prev => ({ ...prev, [dialog]: true }));
  };

  const handleCloseDialog = (dialog: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [dialog]: false }));
    if (dialog === 'details' || dialog === 'blacklist') {
      setSelectedCustomer(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "تم التحديث",
      description: "تم تحديث قائمة العملاء بنجاح",
    });
  };

  const handleExport = () => {
    // منطق التصدير
    toast({
      title: "جاري التصدير",
      description: "سيتم تنزيل الملف قريباً",
    });
  };

  const handleImport = () => {
    // منطق الاستيراد
    toast({
      title: "الاستيراد",
      description: "اختر ملف للاستيراد",
    });
  };

  const handleBlacklist = async (customer: Customer) => {
    try {
      // منطق إضافة للقائمة السوداء
      toast({
        title: "تم إضافة العميل للقائمة السوداء",
        description: `تم إضافة ${customer.name} للقائمة السوداء`,
      });
      handleCloseDialog('blacklist');
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العميل للقائمة السوداء",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="flex h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
              <main className="flex-1 p-6">
                <Card className="p-8 text-center">
                  <CardContent>
                    <h2 className="text-xl font-bold text-destructive mb-2">خطأ في تحميل البيانات</h2>
                    <p className="text-muted-foreground mb-4">حدث خطأ أثناء تحميل قائمة العملاء</p>
                    <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-primary-foreground rounded">
                      إعادة المحاولة
                    </button>
                  </CardContent>
                </Card>
              </main>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            
            <main className="flex-1 overflow-auto">
              <div className="p-6 space-y-6">
                {/* عنوان الصفحة */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">إدارة العملاء</h1>
                    <p className="text-muted-foreground">
                      إدارة شاملة لعملائك مع إحصائيات وتحليلات متقدمة
                    </p>
                  </div>
                  <Badge variant="secondary" className="gap-2">
                    <Users className="h-4 w-4" />
                    {filteredCustomers.length} عميل
                  </Badge>
                </div>

                <Separator />

                {/* التبويبات الرئيسية */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="gap-2">
                      <Users className="h-4 w-4" />
                      نظرة عامة
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      التحليلات
                    </TabsTrigger>
                    <TabsTrigger value="table" className="gap-2">
                      <Table className="h-4 w-4" />
                      جدول العملاء
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="gap-2">
                      <Grid className="h-4 w-4" />
                      عرض البطاقات
                    </TabsTrigger>
                  </TabsList>

                  {/* محتوى التبويبات */}
                  <TabsContent value="overview" className="space-y-6">
                    {/* الإجراءات السريعة */}
                    <CustomerQuickActions
                      onAddCustomer={() => handleOpenDialog('add')}
                      onExport={handleExport}
                      onImport={handleImport}
                      onRefresh={handleRefresh}
                      onAdvancedSearch={() => handleOpenDialog('advancedSearch')}
                      onShowTemplates={() => handleOpenDialog('templates')}
                      selectedCount={selectedCustomers.length}
                      totalCount={filteredCustomers.length}
                      loading={isLoading}
                    />

                    {/* البحث والفلترة */}
                    <CustomerSearchAndFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                      onClearFilters={() => setFilters({})}
                      totalResults={filteredCustomers.length}
                    />

                    {/* الإجراءات المجمعة */}
                    {selectedCustomers.length > 0 && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">تم تحديد {selectedCustomers.length} عميل</p>
                      </div>
                    )}

                    {/* جدول العملاء */}
                    <Card>
                      <CardHeader>
                        <CardTitle>قائمة العملاء</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <EnhancedCustomerTable
                          customers={filteredCustomers}
                          loading={isLoading}
                          onEdit={(customer) => handleOpenDialog('details', customer)}
                          onView={(customer) => handleOpenDialog('details', customer)}
                          onBlacklist={(customer) => handleOpenDialog('blacklist', customer)}
                          selectedCustomers={selectedCustomers}
                          onSelectCustomer={handleSelectCustomer}
                          onSelectAll={(checked) => handleSelectAll(checked, filteredCustomers.map(c => c.id))}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6">
                    <CustomerAnalytics customers={filteredCustomers} />
                  </TabsContent>

                  <TabsContent value="table" className="space-y-6">
                    <CustomerSearchAndFilter
                      filters={filters}
                      onFiltersChange={setFilters}
                      onClearFilters={() => setFilters({})}
                      totalResults={filteredCustomers.length}
                    />
                    
                    <EnhancedCustomerTable
                      customers={filteredCustomers}
                      loading={isLoading}
                      onEdit={(customer) => handleOpenDialog('details', customer)}
                      onView={(customer) => handleOpenDialog('details', customer)}
                      onBlacklist={(customer) => handleOpenDialog('blacklist', customer)}
                      selectedCustomers={selectedCustomers}
                      onSelectCustomer={handleSelectCustomer}
                      onSelectAll={(checked) => handleSelectAll(checked, filteredCustomers.map(c => c.id))}
                    />
                  </TabsContent>

                  <TabsContent value="grid" className="space-y-6">
                    <div className="text-center py-12">
                      <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">عرض البطاقات</h3>
                      <p className="text-muted-foreground">قريباً - سيتم إضافة عرض البطاقات</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </div>

        {/* النوافذ المنبثقة */}
        <AddCustomerDialog
          open={dialogs.add}
          onOpenChange={(open) => handleCloseDialog('add')}
        />

        <CustomerDetailsDialog
          customer={selectedCustomer}
          open={dialogs.details}
          onOpenChange={(open) => handleCloseDialog('details')}
          onEdit={() => {}}
        />

        <div style={{ display: 'none' }}>
          <BlacklistDialog
            customer={selectedCustomer}
            open={dialogs.blacklist}
            onOpenChange={(open) => handleCloseDialog('blacklist')}
            onBlacklist={async () => {}}
            onRemoveFromBlacklist={async () => {}}
          />

          <AdvancedSearchDialog
            open={dialogs.advancedSearch}
            onOpenChange={(open) => handleCloseDialog('advancedSearch')}
            filters={filters}
            onFiltersChange={setFilters}
            customers={customers}
          />

          <CustomerChangeHistory
            customerId={selectedCustomer?.id}
            customers={customers}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}