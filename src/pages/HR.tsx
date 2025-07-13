import { useState } from "react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HROverview from "@/components/HR/HROverview";
import EmployeeManagement from "@/components/HR/EmployeeManagement";
import PayrollManagement from "@/components/HR/PayrollManagement";
import AttendanceTracking from "@/components/HR/AttendanceTracking";
import PerformanceManagement from "@/components/HR/PerformanceManagement";
import LeaveManagement from "@/components/HR/LeaveManagement";

const HR = () => {
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
              <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الموارد البشرية</h1>
              <p className="text-muted-foreground">
                نظام شامل لإدارة الموظفين والرواتب والحضور والأداء
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="text-sm">
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger value="employees" className="text-sm">
                  الموظفون
                </TabsTrigger>
                <TabsTrigger value="payroll" className="text-sm">
                  الرواتب
                </TabsTrigger>
                <TabsTrigger value="attendance" className="text-sm">
                  الحضور
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-sm">
                  الأداء
                </TabsTrigger>
                <TabsTrigger value="leave" className="text-sm">
                  الإجازات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <HROverview />
              </TabsContent>

              <TabsContent value="employees" className="space-y-6">
                <EmployeeManagement />
              </TabsContent>

              <TabsContent value="payroll" className="space-y-6">
                <PayrollManagement />
              </TabsContent>

              <TabsContent value="attendance" className="space-y-6">
                <AttendanceTracking />
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <PerformanceManagement />
              </TabsContent>

              <TabsContent value="leave" className="space-y-6">
                <LeaveManagement />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HR;