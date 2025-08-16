
import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedSystemSettings } from '@/components/SystemManagement/EnhancedSystemSettings';
import { Settings, Shield, Database, Bell } from 'lucide-react';

export default function EnhancedSystemManagement() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة النظام المتقدمة</h1>
            <p className="text-muted-foreground">
              إعدادات وأدوات إدارة شاملة للنظام
            </p>
          </div>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الأمان
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              قاعدة البيانات
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <EnhancedSystemSettings />
          </TabsContent>

          <TabsContent value="security">
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">إعدادات الأمان</h3>
              <p className="text-muted-foreground">قريباً - إعدادات الأمان والصلاحيات</p>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">إدارة قاعدة البيانات</h3>
              <p className="text-muted-foreground">قريباً - أدوات إدارة قاعدة البيانات</p>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">إدارة الإشعارات</h3>
              <p className="text-muted-foreground">قريباً - إعدادات الإشعارات المتقدمة</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
