import { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import NotificationSettings from '@/components/Notifications/NotificationSettings';

const NotificationSettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background page-enter">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:mr-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="fade-in">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 backdrop-blur-sm">
                  <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                    إعدادات الإشعارات
                  </h1>
                  <p className="text-muted-foreground">
                    تخصيص تفضيلات الإشعارات وطرق التسليم للحصول على تنبيهات مناسبة
                  </p>
                </div>
              </div>
              
              <div className="scale-in">
                <NotificationSettings />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;