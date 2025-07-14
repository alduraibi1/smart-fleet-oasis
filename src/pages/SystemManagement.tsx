import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import SystemManagementOverview from '@/components/SystemManagement/SystemManagementOverview';
import UserManagement from '@/components/SystemManagement/UserManagement';
import RoleManagement from '@/components/SystemManagement/RoleManagement';
import SystemSettings from '@/components/SystemManagement/SystemSettings';
import ActivityLogs from '@/components/SystemManagement/ActivityLogs';

const SystemManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:mr-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  إدارة النظام والصلاحيات
                </h1>
                <p className="text-muted-foreground">
                  إدارة المستخدمين والأدوار وإعدادات النظام
                </p>
              </div>
              
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
                  <TabsTrigger value="roles">الأدوار والصلاحيات</TabsTrigger>
                  <TabsTrigger value="settings">إعدادات النظام</TabsTrigger>
                  <TabsTrigger value="logs">سجل الأنشطة</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <SystemManagementOverview />
                </TabsContent>
                
                <TabsContent value="users">
                  <UserManagement />
                </TabsContent>
                
                <TabsContent value="roles">
                  <RoleManagement />
                </TabsContent>
                
                <TabsContent value="settings">
                  <SystemSettings />
                </TabsContent>
                
                <TabsContent value="logs">
                  <ActivityLogs />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SystemManagement;