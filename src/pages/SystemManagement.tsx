
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  Activity, 
  Database,
  Shield,
  TrendingUp
} from "lucide-react";
import { AppLayout } from '@/components/Layout/AppLayout';
import SystemSettings from '@/components/SystemManagement/SystemSettings';
import UserManagement from '@/components/SystemManagement/UserManagement';
import ActivityLogs from '@/components/SystemManagement/ActivityLogs';
import SystemStatus from '@/components/SystemManagement/SystemStatus';
import RoleManagement from '@/components/SystemManagement/RoleManagement';
import SampleDataManager from '@/components/SystemManagement/SampleDataManager';

const SystemManagement = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة النظام</h1>
          <p className="text-muted-foreground">
            إدارة شاملة للنظام والمستخدمين والإعدادات
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الأدوار
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              البيانات
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              السجلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4">
              <SystemStatus />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="data">
            <SampleDataManager />
          </TabsContent>

          <TabsContent value="logs">
            <ActivityLogs />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SystemManagement;
