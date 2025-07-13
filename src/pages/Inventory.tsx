import { useState } from "react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InventoryOverview from "@/components/Inventory/InventoryOverview";
import StockManagement from "@/components/Inventory/StockManagement";
import SuppliersManagement from "@/components/Inventory/SuppliersManagement";
import InventoryReports from "@/components/Inventory/InventoryReports";
import AutoReordering from "@/components/Inventory/AutoReordering";
import QualityControl from "@/components/Inventory/QualityControl";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">إدارة المخزون</h1>
              <p className="text-muted-foreground">
                نظام شامل لإدارة المخزون والمواد والموردين
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="text-sm">
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger value="stock" className="text-sm">
                  إدارة المخزون
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="text-sm">
                  الموردين
                </TabsTrigger>
                <TabsTrigger value="reports" className="text-sm">
                  التقارير
                </TabsTrigger>
                <TabsTrigger value="auto-reorder" className="text-sm">
                  الطلب التلقائي
                </TabsTrigger>
                <TabsTrigger value="quality" className="text-sm">
                  مراقبة الجودة
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <InventoryOverview />
              </TabsContent>

              <TabsContent value="stock" className="space-y-6">
                <StockManagement />
              </TabsContent>

              <TabsContent value="suppliers" className="space-y-6">
                <SuppliersManagement />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <InventoryReports />
              </TabsContent>

              <TabsContent value="auto-reorder" className="space-y-6">
                <AutoReordering />
              </TabsContent>

              <TabsContent value="quality" className="space-y-6">
                <QualityControl />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;