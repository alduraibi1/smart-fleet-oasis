
import { useState } from "react";
import { MaintenanceStats } from "@/components/Maintenance/MaintenanceStats";
import { MaintenanceTable } from "@/components/Maintenance/MaintenanceTable";
import { EnhancedAddMaintenanceDialog } from "@/components/Maintenance/EnhancedAddMaintenanceDialog";
import { MaintenanceScheduleTable } from "@/components/Maintenance/MaintenanceScheduleTable";
import { MechanicsManagement } from "@/components/Maintenance/MechanicsManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Calendar, Users, BarChart3 } from "lucide-react";

const Maintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mechanicFilter, setMechanicFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الصيانة</h1>
          <p className="text-muted-foreground">
            متابعة وإدارة جميع عمليات صيانة المركبات
          </p>
        </div>
        <EnhancedAddMaintenanceDialog />
      </div>

      <MaintenanceStats />

      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            سجلات الصيانة
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            جدولة الصيانة
          </TabsTrigger>
          <TabsTrigger value="mechanics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            الميكانيكيين
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            التقارير
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceTable 
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            mechanicFilter={mechanicFilter}
            dateFilter={dateFilter}
          />
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <MaintenanceScheduleTable />
        </TabsContent>
        
        <TabsContent value="mechanics" className="space-y-4">
          <MechanicsManagement />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">التقارير قيد التطوير</h3>
            <p className="text-muted-foreground">ستكون متاحة قريباً</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Maintenance;
