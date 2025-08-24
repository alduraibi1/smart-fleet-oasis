
import { AppLayout } from '@/components/Layout/AppLayout';
import SmartNotificationCenter from '@/components/Notifications/SmartNotificationCenter';
import NotificationSettings from '@/components/Notifications/NotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NotificationsPage = () => {
  return (
    <AppLayout>
      <div className="content-spacing">
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">التنبيهات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <SmartNotificationCenter />
          </TabsContent>
          
          <TabsContent value="settings">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
