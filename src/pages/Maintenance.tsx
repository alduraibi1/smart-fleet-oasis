
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, BarChart3, Calendar, Users, AlertTriangle } from "lucide-react";

import { MaintenanceStats } from "@/components/Maintenance/MaintenanceStats";
import { MaintenanceTable } from "@/components/Maintenance/MaintenanceTable";
import { MaintenanceFilters } from "@/components/Maintenance/MaintenanceFilters";
import { AddMaintenanceDialog } from "@/components/Maintenance/AddMaintenanceDialog";
import { AddMechanicDialog } from "@/components/Maintenance/AddMechanicDialog";
import { MaintenanceScheduleTable } from "@/components/Maintenance/MaintenanceScheduleTable";
import { MaintenanceDashboardLayout } from "@/components/Maintenance/MaintenanceDashboardLayout";
import { MechanicsManagement } from "@/components/Maintenance/MechanicsManagement";
import { SmartMaintenanceAlerts } from "@/components/Maintenance/SmartMaintenanceAlerts";

const Maintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mechanicFilter, setMechanicFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [addMaintenanceOpen, setAddMaintenanceOpen] = useState(false);
  const [addMechanicOpen, setAddMechanicOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">نظام الصيانة المتقدم</h1>
          <p className="text-muted-foreground">
            إدارة شاملة وذكية لجميع عمليات الصيانة والورش والفنيين
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setAddMechanicOpen(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            إضافة فني
          </Button>
          <Button onClick={() => setAddMaintenanceOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            صيانة جديدة
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <MaintenanceStats />

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            لوحة التحكم
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            سجلات الصيانة
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            الجدولة
          </TabsTrigger>
          <TabsTrigger value="mechanics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            الفنيين
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            التنبيهات
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab - Advanced Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <MaintenanceDashboardLayout />
        </TabsContent>

        {/* Maintenance Records Tab */}
        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>فلترة وبحث</CardTitle>
              <CardDescription>
                استخدم الفلاتر للبحث عن سجلات الصيانة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaintenanceFilters
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
                mechanicFilter={mechanicFilter}
                dateFilter={dateFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onTypeChange={setTypeFilter}
                onMechanicChange={setMechanicFilter}
                onDateChange={setDateFilter}
              />
            </CardContent>
          </Card>

          <MaintenanceTable
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            mechanicFilter={mechanicFilter}
            dateFilter={dateFilter}
          />
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <MaintenanceScheduleTable />
        </TabsContent>

        {/* Mechanics Tab - Now with actual management */}
        <TabsContent value="mechanics" className="space-y-6">
          <MechanicsManagement />
        </TabsContent>

        {/* Alerts Tab - Smart Maintenance Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <SmartMaintenanceAlerts />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddMaintenanceDialog 
        open={addMaintenanceOpen}
        onOpenChange={setAddMaintenanceOpen}
      />
      
      <AddMechanicDialog
        open={addMechanicOpen}
        onOpenChange={setAddMechanicOpen}
      />
    </div>
  );
};

export default Maintenance;
