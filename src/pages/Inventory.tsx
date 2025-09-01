
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import InventoryOverview from "@/components/Inventory/InventoryOverview";
import InventoryReports from "@/components/Inventory/InventoryReports";
import InventoryItemsTable from "@/components/Inventory/InventoryItemsTable";
import InventoryTransactionsTable from "@/components/Inventory/InventoryTransactionsTable";
import InventoryCategoriesManager from "@/components/Inventory/InventoryCategoriesManager";
import AddInventoryItemDialog from "@/components/Inventory/dialogs/AddInventoryItemDialog";
import AddStockTransactionDialog from "@/components/Inventory/dialogs/AddStockTransactionDialog";
import AddInventoryCategoryDialog from "@/components/Inventory/dialogs/AddInventoryCategoryDialog";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);

  // استخدمنا الهوك كاملاً ومررناه للمكوّنات الفرعية لتفادي ازدواجية الجلب
  const inventory = useInventory();
  const { loading } = inventory;

  const handleAddItem = () => {
    setShowAddItemDialog(true);
  };

  const handleAddTransaction = () => {
    setShowAddTransactionDialog(true);
  };

  const handleAddCategory = () => {
    setShowAddCategoryDialog(true);
  };

  if (loading) {
    return (
      <div className="content-spacing">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل بيانات المخزون...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-spacing">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة المخزون</h1>
          <p className="text-muted-foreground">
            نظام شامل لإدارة المخزون وقطع الغيار والمواد
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-5">
              <TabsTrigger value="overview" className="text-sm">
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="items" className="text-sm">
                عناصر المخزون
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-sm">
                حركات المخزون
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-sm">
                الفئات
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-sm">
                التقارير
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              {activeTab === "items" && (
                <Button onClick={handleAddItem} className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة عنصر
                </Button>
              )}
              {activeTab === "transactions" && (
                <Button onClick={handleAddTransaction} className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  إضافة حركة
                </Button>
              )}
              {activeTab === "categories" && (
                <Button onClick={handleAddCategory} className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة فئة
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <InventoryOverview />
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            <InventoryItemsTable inventory={inventory} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <InventoryTransactionsTable inventory={inventory} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <InventoryCategoriesManager inventory={inventory} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <InventoryReports />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddInventoryItemDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        inventory={inventory}
      />
      <AddStockTransactionDialog
        open={showAddTransactionDialog}
        onOpenChange={setShowAddTransactionDialog}
        inventory={inventory}
      />
      <AddInventoryCategoryDialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
        inventory={inventory}
      />
    </div>
  );
};

export default Inventory;
