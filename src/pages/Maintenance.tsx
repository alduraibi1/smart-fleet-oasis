import { useState } from "react";
import Header from "@/components/Layout/Header";
import { MaintenanceStats } from "@/components/Maintenance/MaintenanceStats";
import { MaintenanceFilters } from "@/components/Maintenance/MaintenanceFilters";
import { MaintenanceTable } from "@/components/Maintenance/MaintenanceTable";
import { AddMaintenanceDialog } from "@/components/Maintenance/AddMaintenanceDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Maintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mechanicFilter, setMechanicFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddMaintenance = () => {
    setShowAddDialog(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onMenuClick={() => {}} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">إدارة الصيانة</h1>
              <p className="text-muted-foreground mt-2">
                متابعة وإدارة جميع أعمال الصيانة للمركبات
              </p>
            </div>
            <Button onClick={handleAddMaintenance} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة سجل صيانة
            </Button>
          </div>

          {/* Stats Cards */}
          <MaintenanceStats />

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

          {/* Table */}
          <MaintenanceTable
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            mechanicFilter={mechanicFilter}
            dateFilter={dateFilter}
          />
        </div>
      </main>

      <AddMaintenanceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}