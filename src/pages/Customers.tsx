import { useState, useMemo } from "react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Button } from "@/components/ui/button";
import { CustomerStats } from "@/components/Customers/CustomerStats";
import { CustomerFilters } from "@/components/Customers/CustomerFilters";
import { CustomerCard } from "@/components/Customers/CustomerCard";
import { AddCustomerDialog } from "@/components/Customers/AddCustomerDialog";
import { CustomerDetailsDialog } from "@/components/Customers/CustomerDetailsDialog";
import { BlacklistDialog } from "@/components/Customers/BlacklistDialog";
import { useCustomers, Customer } from "@/hooks/useCustomers";
import { Plus } from "lucide-react";

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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [blacklistFilter, setBlacklistFilter] = useState("all");

  // Filter customers based on search and filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search filter
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm) ||
                           (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Rating filter
      const matchesRating = ratingFilter === "all" || customer.rating >= parseInt(ratingFilter);
      
      // Status filter (active/inactive based on is_active)
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && customer.is_active) ||
                           (statusFilter === "inactive" && !customer.is_active);
      
      // Document filter (license expiry status)
      const licenseExpiry = new Date(customer.license_expiry);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let matchesDocument = true;
      if (documentFilter === "valid") matchesDocument = daysUntilExpiry > 30;
      else if (documentFilter === "expiring") matchesDocument = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
      else if (documentFilter === "expired") matchesDocument = daysUntilExpiry < 0;

      // Blacklist filter
      const matchesBlacklist = blacklistFilter === "all" ||
                              (blacklistFilter === "normal" && !customer.blacklisted) ||
                              (blacklistFilter === "blacklisted" && customer.blacklisted);
      
      return matchesSearch && matchesRating && matchesStatus && matchesDocument && matchesBlacklist;
    });
  }, [customers, searchTerm, ratingFilter, statusFilter, documentFilter, blacklistFilter]);

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

            {/* Statistics */}
            <CustomerStats
              totalCustomers={stats.total}
              activeCustomers={stats.active}
              newCustomersThisMonth={stats.newThisMonth}
              averageRating={stats.averageRating}
            />

            {/* Filters */}
            <CustomerFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              ratingFilter={ratingFilter}
              onRatingChange={setRatingFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              documentFilter={documentFilter}
              onDocumentChange={setDocumentFilter}
              blacklistFilter={blacklistFilter}
              onBlacklistChange={setBlacklistFilter}
            />

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">جاري تحميل العملاء...</span>
              </div>
            )}

            {/* Customer Grid */}
            {!loading && (
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
                      setSearchTerm("");
                      setRatingFilter("all");
                      setStatusFilter("all");
                      setDocumentFilter("all");
                      setBlacklistFilter("all");
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