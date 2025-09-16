import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Settings, 
  Users, 
  Activity, 
  Shield, 
  BarChart3, 
  Database,
  TrendingUp
} from "lucide-react";
import SystemSettings from '@/components/SystemManagement/SystemSettings';
import UserManagement from '@/components/SystemManagement/UserManagement';
import ActivityLogs from '@/components/SystemManagement/ActivityLogs';
import SystemStatus from '@/components/SystemManagement/SystemStatus';
import RoleManagement from '@/components/SystemManagement/RoleManagement';
import { SampleDataManager } from '@/components/SystemManagement/SampleDataManager';
import { SuperAdminManagement } from '@/components/SystemManagement/SuperAdminManagement';

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState("settings");

  return (
    <div className="content-spacing">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة النظام</h1>
          <p className="text-muted-foreground">
            إعدادات النظام وإدارة المستخدمين والأدوار
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Responsive Tab Navigation */}
          <div className="dashboard-card">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="grid w-max min-w-full grid-cols-3 md:grid-cols-7 gap-1 p-1 bg-muted/30 rounded-lg">
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">الإعدادات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">المستخدمين</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="super-admin" 
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">المدير الرئيسي</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="roles" 
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">الأدوار</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="logs" 
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">السجلات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="status" 
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">الحالة</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data" 
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all hover-scale data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">البيانات</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Tab Content with Animations */}
          <div className="animate-fade-in">
            <TabsContent value="settings" className="mt-0">
              <Card className="dashboard-card animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    إعدادات النظام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SystemSettings />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <Card className="dashboard-card animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    إدارة المستخدمين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="super-admin" className="mt-0">
              <SuperAdminManagement />
            </TabsContent>

            <TabsContent value="roles" className="mt-0">
              <Card className="dashboard-card animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    إدارة الأدوار والصلاحيات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RoleManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-0">
              <Card className="dashboard-card animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    سجل الأنشطة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityLogs />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="mt-0">
              <Card className="dashboard-card animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    حالة النظام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SystemStatus />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="mt-0">
              <Card className="dashboard-card animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    إدارة البيانات التجريبية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SampleDataManager />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemManagement;
