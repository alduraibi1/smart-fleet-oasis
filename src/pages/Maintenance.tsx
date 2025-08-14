
import { useState } from "react";
import { MaintenanceStats } from "@/components/Maintenance/MaintenanceStats";
import { MaintenanceFilters } from "@/components/Maintenance/MaintenanceFilters";
import { MaintenanceTable } from "@/components/Maintenance/MaintenanceTable";
import { EnhancedAddMaintenanceDialog } from "@/components/Maintenance/EnhancedAddMaintenanceDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Settings, Users } from "lucide-react";
import { useMaintenance } from "@/hooks/useMaintenance";
import { MaintenanceScheduleTable } from "@/components/Maintenance/MaintenanceScheduleTable";
import { MechanicsManagement } from "@/components/Maintenance/MechanicsManagement";
import { MaintenanceTemplates } from "@/components/Maintenance/MaintenanceTemplates";
import { AddMaintenanceScheduleDialog } from "@/components/Maintenance/AddMaintenanceScheduleDialog";
import { AppLayout } from "@/components/Layout/AppLayout";

export default function Maintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mechanicFilter, setMechanicFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("records");

  const { loading } = useMaintenance();

  const handleAddMaintenance = () => {
    setShowAddDialog(true);
  };

  const handleAddSchedule = () => {
    setShowScheduleDialog(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل بيانات الصيانة...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الصيانة</h1>
            <p className="text-muted-foreground mt-2">
              نظام شامل لإدارة وجدولة صيانة المركبات
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <MaintenanceStats />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4">
              <TabsTrigger value="records" className="text-sm">
                سجلات الصيانة
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-sm">
                جدولة الصيانة
              </TabsTrigger>
              <TabsTrigger value="mechanics" className="text-sm">
                الميكانيكيين
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-sm">
                قوالب الصيانة
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              {activeTab === "records" && (
                <Button onClick={handleAddMaintenance} className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة سجل صيانة
                </Button>
              )}
              {activeTab === "schedule" && (
                <Button onClick={handleAddSchedule} className="gap-2">
                  <Calendar className="h-4 w-4" />
                  جدولة صيانة
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="records" className="space-y-6">
            {/* Filters */}
            <MaintenanceFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              mechanicFilter={mechanicFilter}
              onMechanicChange={setMechanicFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
            />

            {/* Maintenance Records Table */}
            <MaintenanceTable
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              mechanicFilter={mechanicFilter}
              dateFilter={dateFilter}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <MaintenanceScheduleTable />
          </TabsContent>

          <TabsContent value="mechanics" className="space-y-6">
            <MechanicsManagement />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <MaintenanceTemplates />
          </TabsContent>
        </Tabs>

        <EnhancedAddMaintenanceDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
        />

        <AddMaintenanceScheduleDialog 
          open={showScheduleDialog} 
          onOpenChange={setShowScheduleDialog}
        />
      </div>
    </AppLayout>
  );
}
