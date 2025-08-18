
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingUp, 
  BarChart3, 
  Plus, 
  AlertTriangle, 
  Settings,
  ShoppingCart,
  Truck,
  Search,
  Filter
} from "lucide-react";

import { InventoryStats } from "@/components/Inventory/InventoryStats";
import { InventoryItemsTable } from "@/components/Inventory/InventoryItemsTable";
import { InventoryTransactionsTable } from "@/components/Inventory/InventoryTransactionsTable";
import { AddInventoryItemDialog } from "@/components/Inventory/AddInventoryItemDialog";
import { AddCategoryDialog } from "@/components/Inventory/AddCategoryDialog";
import { InventoryOverview } from "@/components/Inventory/InventoryOverview";
import { StockManagement } from "@/components/Inventory/StockManagement";
import SuppliersManagement from "@/components/Inventory/SuppliersManagement";
import AutoReordering from "@/components/Inventory/AutoReordering";
import QualityControl from "@/components/Inventory/QualityControl";
import InventoryReports from "@/components/Inventory/InventoryReports";
import { useInventory } from "@/hooks/useInventory";

const Inventory = () => {
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const { getInventoryStats, getLowStockItems, getExpiredItems } = useInventory();
  
  const stats = getInventoryStats();
  const lowStockItems = getLowStockItems();
  const expiredItems = getExpiredItems();

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">نظام إدارة المخزون المتقدم</h1>
          <p className="text-muted-foreground">
            إدارة شاملة للمخزون وقطع الغيار مع تتبع ذكي للمستويات
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setAddCategoryOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            فئة جديدة
          </Button>
          <Button onClick={() => setAddItemOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            عنصر جديد
          </Button>
        </div>
      </div>

      {/* Quick Alerts */}
      {(lowStockItems.length > 0 || expiredItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-amber-800">تنبيه: مخزون منخفض</CardTitle>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {lowStockItems.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700">
                  هناك {lowStockItems.length} عنصر بحاجة لإعادة تموين
                </p>
              </CardContent>
            </Card>
          )}

          {expiredItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-800">تنبيه: منتهية الصلاحية</CardTitle>
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    {expiredItems.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  هناك {expiredItems.length} عنصر منتهي الصلاحية
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Statistics Overview */}
      <InventoryStats />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            العناصر
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            الحركات
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إدارة المخزون
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            الموردين
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            مراقبة الجودة
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            التقارير
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <InventoryOverview />
        </TabsContent>

        {/* Inventory Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <InventoryItemsTable />
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <InventoryTransactionsTable />
        </TabsContent>

        {/* Stock Management Tab */}
        <TabsContent value="stock" className="space-y-6">
          <div className="grid gap-6">
            <StockManagement />
            <AutoReordering />
          </div>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <SuppliersManagement />
        </TabsContent>

        {/* Quality Control Tab */}
        <TabsContent value="quality" className="space-y-6">
          <QualityControl />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <InventoryReports />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddInventoryItemDialog />
      <AddCategoryDialog />
    </div>
  );
};

export default Inventory;
