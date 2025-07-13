import { useState, useMemo } from "react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Button } from "@/components/ui/button";
import { CustomerStats } from "@/components/Customers/CustomerStats";
import { CustomerFilters } from "@/components/Customers/CustomerFilters";
import { CustomerCard } from "@/components/Customers/CustomerCard";
import { AddCustomerDialog } from "@/components/Customers/AddCustomerDialog";
import { CustomerDetailsDialog } from "@/components/Customers/CustomerDetailsDialog";
import { Customer } from "@/types";
import { Plus } from "lucide-react";

// Sample customer data
const sampleCustomers: Customer[] = [
  {
    id: "1",
    name: "أحمد محمد العلي",
    phone: "0501234567",
    email: "ahmed.ali@email.com",
    nationalId: "1234567890",
    licenseNumber: "123456789",
    licenseExpiry: new Date(2025, 11, 15),
    address: "الرياض، حي النخيل، شارع الملك فهد",
    rating: 5,
    totalRentals: 12,
    documents: []
  },
  {
    id: "2", 
    name: "فاطمة عبدالله الشمري",
    phone: "0502345678",
    email: "fatima.shamri@email.com",
    nationalId: "2345678901",
    licenseNumber: "234567890",
    licenseExpiry: new Date(2024, 2, 20),
    address: "جدة، حي الروضة، طريق الملك عبدالعزيز",
    rating: 4,
    totalRentals: 8,
    documents: []
  },
  {
    id: "3",
    name: "محمد سعد القحطاني", 
    phone: "0503456789",
    nationalId: "3456789012",
    licenseNumber: "345678901",
    licenseExpiry: new Date(2023, 8, 10),
    address: "الدمام، حي الفيصلية، شارع الأمير محمد",
    rating: 3,
    totalRentals: 5,
    documents: []
  },
  {
    id: "4",
    name: "نورا خالد المطيري",
    phone: "0504567890",
    email: "nora.mutairi@email.com", 
    nationalId: "4567890123",
    licenseNumber: "456789012",
    licenseExpiry: new Date(2025, 5, 30),
    address: "المدينة المنورة، حي العنبرية، شارع العوالي",
    rating: 5,
    totalRentals: 15,
    documents: []
  },
  {
    id: "5",
    name: "عبدالرحمن أحمد الدوسري",
    phone: "0505678901",
    nationalId: "5678901234", 
    licenseNumber: "567890123",
    licenseExpiry: new Date(2024, 0, 5),
    address: "الطائف، حي الشفا، طريق الملك فيصل",
    rating: 2,
    totalRentals: 3,
    documents: []
  },
  {
    id: "6",
    name: "ريم سلمان الخالدي",
    phone: "0506789012",
    email: "reem.khalidi@email.com",
    nationalId: "6789012345",
    licenseNumber: "678901234", 
    licenseExpiry: new Date(2025, 8, 12),
    address: "أبها، حي الضباب، شارع الملك خالد",
    rating: 4,
    totalRentals: 7,
    documents: []
  }
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");

  // Filter customers based on search and filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search filter
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone.includes(searchTerm);
      
      // Rating filter
      const matchesRating = ratingFilter === "all" || customer.rating >= parseInt(ratingFilter);
      
      // Status filter (active/inactive based on rental history)
      const isActive = customer.totalRentals > 0;
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && isActive) ||
                           (statusFilter === "inactive" && !isActive);
      
      // Document filter (license expiry status)
      const licenseExpiry = new Date(customer.licenseExpiry);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let matchesDocument = true;
      if (documentFilter === "valid") matchesDocument = daysUntilExpiry > 30;
      else if (documentFilter === "expiring") matchesDocument = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
      else if (documentFilter === "expired") matchesDocument = daysUntilExpiry < 0;
      
      return matchesSearch && matchesRating && matchesStatus && matchesDocument;
    });
  }, [customers, searchTerm, ratingFilter, statusFilter, documentFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.totalRentals > 0).length;
    const newCustomersThisMonth = customers.filter(c => {
      // Assuming all sample customers are new this month for demo
      return true;
    }).length;
    const averageRating = customers.reduce((sum, c) => sum + c.rating, 0) / customers.length;
    
    return {
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth: Math.floor(totalCustomers * 0.3), // 30% are new
      averageRating
    };
  }, [customers]);

  const handleAddCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `${customers.length + 1}`,
    };
    setCustomers([...customers, newCustomer]);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowAddDialog(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsDialog(true);
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
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 ml-2" />
                عميل جديد
              </Button>
            </div>

            {/* Statistics */}
            <CustomerStats
              totalCustomers={stats.totalCustomers}
              activeCustomers={stats.activeCustomers}
              newCustomersThisMonth={stats.newCustomersThisMonth}
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
            />

            {/* Customer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={handleEditCustomer}
                  onView={handleViewCustomer}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">لا توجد عملاء تطابق معايير البحث</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setRatingFilter("all");
                    setStatusFilter("all");
                    setDocumentFilter("all");
                  }}
                >
                  مسح الفلاتر
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
    </div>
  );
}