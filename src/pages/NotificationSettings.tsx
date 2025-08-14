
import NotificationSettings from '@/components/Notifications/NotificationSettings';
import { AppLayout } from '@/components/Layout/AppLayout';

const NotificationSettingsPage = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
            إعدادات الإشعارات
          </h1>
          <p className="text-muted-foreground">
            تخصيص تفضيلات الإشعارات وطرق التسليم للحصول على تنبيهات مناسبة
          </p>
        </div>
        
        <NotificationSettings />
      </div>
    </AppLayout>
  );
};

export default NotificationSettingsPage;
