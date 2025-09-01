import { SecurityDashboard } from '@/components/Security/SecurityDashboard';
import { AuditLogsViewer } from '@/components/Security/AuditLogsViewer';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText } from 'lucide-react';

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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  لوحة الأمان
                </TabsTrigger>
                <TabsTrigger value="audit-logs" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  سجلات التدقيق
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <SecurityDashboard />
              </TabsContent>

              <TabsContent value="audit-logs" className="space-y-6">
                <AuditLogsViewer />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}