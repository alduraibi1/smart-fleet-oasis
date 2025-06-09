
import { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import DashboardOverview from '@/components/Dashboard/DashboardOverview';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:mr-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  مرحباً بك في نظام إدارة تأجير المركبات
                </h1>
                <p className="text-muted-foreground">
                  نظرة عامة على أداء شركتك وأهم المؤشرات
                </p>
              </div>
              
              <DashboardOverview />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
