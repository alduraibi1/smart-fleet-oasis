
import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SystemManagementOverview from '@/components/SystemManagement/SystemManagementOverview';
import UserManagement from '@/components/SystemManagement/UserManagement';
import RoleManagement from '@/components/SystemManagement/RoleManagement';
import SystemSettings from '@/components/SystemManagement/SystemSettings';
import ActivityLogs from '@/components/SystemManagement/ActivityLogs';
import SystemStatus from '@/components/SystemManagement/SystemStatus';

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة النظام</h1>
          <p className="text-muted-foreground mt-1">
            إدارة شاملة للنظام والمستخدمين والصلاحيات
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="status">حالة النظام</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="roles">الصلاحيات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            <TabsTrigger value="logs">سجل الأنشطة</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemManagementOverview />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <SystemStatus />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <ActivityLogs />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SystemManagement;
