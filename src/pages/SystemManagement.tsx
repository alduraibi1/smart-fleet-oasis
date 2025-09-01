import React from 'react';
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

const SystemManagement = () => {
  return (
    <div className="content-spacing">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة النظام</h1>
          <p className="text-muted-foreground">
            إعدادات النظام وإدارة المستخدمين والأدوار
          </p>
        </div>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">المستخدمين</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">الأدوار</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">السجلات</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">الحالة</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">البيانات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card className="dashboard-card">
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

          <TabsContent value="users">
            <Card className="dashboard-card">
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

          <TabsContent value="roles">
            <Card className="dashboard-card">
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

          <TabsContent value="logs">
            <Card className="dashboard-card">
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

          <TabsContent value="status">
            <Card className="dashboard-card">
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

          <TabsContent value="data">
            <Card className="dashboard-card">
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
        </Tabs>
      </div>
    </div>
  );
};

export default SystemManagement;
