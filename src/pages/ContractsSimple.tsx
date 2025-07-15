import { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import { ContractsHeader } from '@/components/Contracts/ContractsHeader';
import { ContractsStats } from '@/components/Contracts/ContractsStats';
import { ContractsTable } from '@/components/Contracts/ContractsTable';
import { useContracts } from '@/hooks/useContracts';

const ContractsSimple = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { contracts, loading, stats } = useContracts();

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
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page Header */}
              <ContractsHeader 
                title="إدارة العقود"
                description="إدارة بسيطة للعقود وتتبع الحالات"
              />

              {/* Statistics Cards */}
              <ContractsStats stats={stats} />

              {/* Contracts Table */}
              <ContractsTable contracts={contracts} loading={loading} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ContractsSimple;