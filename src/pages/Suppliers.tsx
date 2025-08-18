
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  ShoppingCart, 
  BarChart3, 
  Plus,
  FileText,
  Settings
} from "lucide-react";

import { SuppliersOverview } from "@/components/Suppliers/SuppliersOverview";
import { SuppliersTable } from "@/components/Suppliers/SuppliersTable";
import { PurchaseOrdersTable } from "@/components/Suppliers/PurchaseOrdersTable";
import { AddSupplierDialog } from "@/components/Suppliers/AddSupplierDialog";
import { CreatePurchaseOrderDialog } from "@/components/Suppliers/CreatePurchaseOrderDialog";
import { SuppliersReports } from "@/components/Suppliers/SuppliersReports";

const Suppliers = () => {
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الموردين المتقدمة</h1>
          <p className="text-muted-foreground">
            إدارة شاملة للموردين وأوامر الشراء مع تتبع الأداء والجودة
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setCreateOrderOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            أمر شراء جديد
          </Button>
          <Button onClick={() => setAddSupplierOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            مورد جديد
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            الموردين
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            أوامر الشراء
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            التقارير
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <SuppliersOverview />
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                قائمة الموردين
              </CardTitle>
              <CardDescription>
                إدارة معلومات الموردين وتقييم أدائهم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SuppliersTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Purchase Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                أوامر الشراء
              </CardTitle>
              <CardDescription>
                متابعة وإدارة أوامر الشراء من الموردين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseOrdersTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <SuppliersReports />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات الموردين
              </CardTitle>
              <CardDescription>
                تكوين إعدادات النظام الخاصة بإدارة الموردين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>سيتم إضافة إعدادات الموردين قريباً</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddSupplierDialog 
        open={addSupplierOpen} 
        onOpenChange={setAddSupplierOpen} 
      />
      <CreatePurchaseOrderDialog 
        open={createOrderOpen} 
        onOpenChange={setCreateOrderOpen} 
      />
    </div>
  );
};

export default Suppliers;
