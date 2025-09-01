import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from './AccountSettings';
import { NotificationSettings } from './NotificationSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { SystemSettings } from './SystemSettings';

export function GeneralSettings() {
  return (
    <Tabs defaultValue="account" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="account">الحساب</TabsTrigger>
        <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
        <TabsTrigger value="appearance">المظهر</TabsTrigger>
        <TabsTrigger value="system">النظام</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات الحساب</CardTitle>
            <CardDescription>
              إدارة تفضيلات الحساب والخصوصية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountSettings />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات الإشعارات</CardTitle>
            <CardDescription>
              تخصيص كيفية تلقي الإشعارات والتنبيهات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettings />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات المظهر</CardTitle>
            <CardDescription>
              تخصيص شكل ومظهر النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="system">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات النظام</CardTitle>
            <CardDescription>
              إعدادات عامة للنظام والأداء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SystemSettings />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}