import { SecurityDashboard } from '@/components/Security/SecurityDashboard';
import { AuditLogsViewer } from '@/components/Security/AuditLogsViewer';
import { UserAccessManagement } from '@/components/Security/UserAccessManagement';
import { SecurityReports } from '@/components/Security/SecurityReports';
import { SecurityIncidents } from '@/components/Security/SecurityIncidents';
import { ActiveSessions } from '@/components/Security/ActiveSessions';
import { SecurityAlertRules } from '@/components/Security/SecurityAlertRules';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Users, BarChart3, AlertTriangle, Monitor, Bell } from 'lucide-react';

export default function SecurityMonitoring() {
  return (
    <AppLayout>
      <div className="page-container">
        <div className="content-wrapper">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">مراقبة الأمان</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                مراقبة الأنشطة الأمنية وسجلات التدقيق في النظام
              </p>
            </div>

            {/* Security Monitoring Tabs */}
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  لوحة الأمان
                </TabsTrigger>
                <TabsTrigger value="incidents" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  الحوادث الأمنية
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  الجلسات النشطة
                </TabsTrigger>
                <TabsTrigger value="alert-rules" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  قواعد التنبيهات
                </TabsTrigger>
                <TabsTrigger value="audit-logs" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  سجلات التدقيق
                </TabsTrigger>
                <TabsTrigger value="user-access" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  إدارة المستخدمين
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  التقارير الأمنية
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <SecurityDashboard />
              </TabsContent>

              <TabsContent value="incidents" className="space-y-6">
                <SecurityIncidents />
              </TabsContent>

              <TabsContent value="sessions" className="space-y-6">
                <ActiveSessions />
              </TabsContent>

              <TabsContent value="alert-rules" className="space-y-6">
                <SecurityAlertRules />
              </TabsContent>

              <TabsContent value="audit-logs" className="space-y-6">
                <AuditLogsViewer />
              </TabsContent>

              <TabsContent value="user-access" className="space-y-6">
                <UserAccessManagement />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <SecurityReports />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}