
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Building, FileText, TrendingUp } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SuppliersOverview } from "@/components/Suppliers/SuppliersOverview";
import { SuppliersTable } from "@/components/Suppliers/SuppliersTable";
import { PurchaseOrdersTable } from "@/components/Suppliers/PurchaseOrdersTable";
import { SuppliersReports } from "@/components/Suppliers/SuppliersReports";
import { AddSupplierDialog } from "@/components/Suppliers/AddSupplierDialog";
import { CreatePurchaseOrderDialog } from "@/components/Suppliers/CreatePurchaseOrderDialog";

export default function Suppliers() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);

  const { loading } = useSuppliers();

  const handleAddSupplier = () => {
    setShowAddSupplierDialog(true);
  };

  const handleCreateOrder = () => {
    setShowCreateOrderDialog(true);
  };

  if (loading) {
    return (
      <div className="content-spacing">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل بيانات الموردين...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-spacing">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الموردين</h1>
            <p className="text-muted-foreground mt-2">
              إدارة الموردين وأوامر الشراء ومتابعة الأداء
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4">
              <TabsTrigger value="overview" className="text-sm">
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="text-sm">
                الموردين
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-sm">
                أوامر الشراء
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-sm">
                التقارير
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              {activeTab === "suppliers" && (
                <Button onClick={handleAddSupplier} className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة مورد
                </Button>
              )}
              {activeTab === "orders" && (
                <Button onClick={handleCreateOrder} className="gap-2">
                  <FileText className="h-4 w-4" />
                  إنشاء أمر شراء
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <SuppliersOverview />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <SuppliersTable />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <PurchaseOrdersTable />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <SuppliersReports />
          </TabsContent>
        </Tabs>

        <AddSupplierDialog 
          open={showAddSupplierDialog} 
          onOpenChange={setShowAddSupplierDialog}
        />

        <CreatePurchaseOrderDialog 
          open={showCreateOrderDialog} 
          onOpenChange={setShowCreateOrderDialog}
        />
      </div>
    </div>
  );
}
