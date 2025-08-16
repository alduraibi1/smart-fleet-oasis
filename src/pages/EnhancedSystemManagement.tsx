
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Activity, Database, Shield } from 'lucide-react';
import { AppLayout } from '@/components/Layout/AppLayout';
import EnhancedSystemSettings from '@/components/SystemManagement/EnhancedSystemSettings';
import UserManagement from '@/components/SystemManagement/UserManagement';
import RoleManagement from '@/components/SystemManagement/RoleManagement';
import ActivityLogs from '@/components/SystemManagement/ActivityLogs';
import SystemStatus from '@/components/SystemManagement/SystemStatus';

const EnhancedSystemManagement = () => {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة النظام المحسنة</h1>
            <p className="text-muted-foreground">
              إدارة شاملة لإعدادات النظام والمستخدمين والأدوار
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المستخدمون
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الأدوار
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              سجل النشاط
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              حالة النظام
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <EnhancedSystemSettings />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLogs />
          </TabsContent>

          <TabsContent value="status">
            <SystemStatus />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default EnhancedSystemManagement;
