
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HROverview from "@/components/HR/HROverview";
import EmployeeManagement from "@/components/HR/EmployeeManagement";
import PayrollManagement from "@/components/HR/PayrollManagement";
import AttendanceTracking from "@/components/HR/AttendanceTracking";
import PerformanceManagement from "@/components/HR/PerformanceManagement";
import LeaveManagement from "@/components/HR/LeaveManagement";

const HR = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="content-spacing">
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الموارد البشرية</h1>
          <p className="text-muted-foreground">
            نظام شامل لإدارة الموظفين والرواتب والحضور والأداء
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview" className="text-sm">
              <span className="hidden sm:inline">نظرة عامة</span>
              <span className="sm:hidden">عامة</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-sm">
              <span className="hidden sm:inline">الموظفون</span>
              <span className="sm:hidden">موظفون</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="text-sm">
              <span className="hidden sm:inline">الرواتب</span>
              <span className="sm:hidden">رواتب</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-sm">
              <span className="hidden sm:inline">الحضور</span>
              <span className="sm:hidden">حضور</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-sm">
              <span className="hidden sm:inline">الأداء</span>
              <span className="sm:hidden">أداء</span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="text-sm">
              <span className="hidden sm:inline">الإجازات</span>
              <span className="sm:hidden">إجازات</span>
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
    </div>
  );
};

export default HR;
