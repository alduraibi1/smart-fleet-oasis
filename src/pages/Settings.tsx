import { AppLayout } from '@/components/Layout/AppLayout';
import { GeneralSettings } from '@/components/Settings/GeneralSettings';

const Settings = () => {
  return (
    <AppLayout>
      <div className="content-spacing">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 backdrop-blur-sm mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
            الإعدادات
          </h1>
          <p className="text-muted-foreground">
            إدارة إعدادات النظام والتفضيلات الشخصية
          </p>
        </div>
        
        <GeneralSettings />
      </div>
    </AppLayout>
  );
};

export default Settings;