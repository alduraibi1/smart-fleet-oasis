
import { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import DashboardOverview from '@/components/Dashboard/DashboardOverview';

const Index = () => {
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
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="fade-in">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-2xl border border-primary/20 backdrop-blur-sm">
                  <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                    مرحباً بك في نظام إدارة تأجير المركبات
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    نظرة عامة على أداء شركتك وأهم المؤشرات
                  </p>
                </div>
              </div>
              
              <div className="scale-in">
                <DashboardOverview />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
