
import { useState } from 'react';
import { MaintenanceStats } from '@/components/Maintenance/MaintenanceStats';
import { MaintenanceFilters } from '@/components/Maintenance/MaintenanceFilters';
import { MaintenanceTable } from '@/components/Maintenance/MaintenanceTable';
import { AddMaintenanceDialog } from '@/components/Maintenance/AddMaintenanceDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wrench, Calendar, Users } from 'lucide-react';

const Maintenance = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("records");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mechanicFilter, setMechanicFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  return (
    <div className="content-spacing">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">الصيانة</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            إدارة عمليات الصيانة والورش المتخصصة
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="btn-responsive flex-shrink-0"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة عملية صيانة
        </Button>
      </div>

      {/* Stats Section */}
      <div className="stats-container mb-6">
        <MaintenanceStats />
      </div>

      {/* Main Content */}
      <div className="dashboard-card">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border/50 mb-4">
            <div className="flexible-tabs">
              <TabsList className="tabs-list bg-muted/50 h-auto p-1">
                <TabsTrigger value="records" className="tabs-trigger data-[state=active]:bg-background">
                  <Wrench className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  سجلات الصيانة
                </TabsTrigger>
                <TabsTrigger value="schedule" className="tabs-trigger data-[state=active]:bg-background">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  الجدولة
                </TabsTrigger>
                <TabsTrigger value="mechanics" className="tabs-trigger data-[state=active]:bg-background">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  الفنيين
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="records" className="mt-0">
            <div className="space-y-4">
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
              <MaintenanceTable 
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
                mechanicFilter={mechanicFilter}
                dateFilter={dateFilter}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-0">
            <div className="dashboard-card">
              <div className="text-center text-muted-foreground py-8">
                جدولة الصيانة قيد التطوير
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mechanics" className="mt-0">
            <div className="dashboard-card">
              <div className="text-center text-muted-foreground py-8">
                إدارة الفنيين قيد التطوير
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Maintenance Dialog */}
      <AddMaintenanceDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
};

export default Maintenance;
