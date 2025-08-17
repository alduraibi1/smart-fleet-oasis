
import { InventoryStats } from "@/components/Inventory/InventoryStats";
import { InventoryItemsTable } from "@/components/Inventory/InventoryItemsTable";
import { InventoryTransactionsTable } from "@/components/Inventory/InventoryTransactionsTable";
import { AddInventoryItemDialog } from "@/components/Inventory/AddInventoryItemDialog";
import { AddCategoryDialog } from "@/components/Inventory/AddCategoryDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, BarChart3, Plus } from "lucide-react";

const Inventory = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة المخزون</h1>
          <p className="text-muted-foreground">
            متابعة وإدارة جميع عناصر المخزون والحركات
          </p>
        </div>
        <div className="flex gap-2">
          <AddCategoryDialog />
          <AddInventoryItemDialog />
        </div>
      </div>

      <InventoryStats />

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            عناصر المخزون
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            حركات المخزون
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4">
          <InventoryItemsTable />
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <InventoryTransactionsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
