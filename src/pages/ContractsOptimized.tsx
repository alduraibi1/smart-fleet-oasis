import { useState, useCallback } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import { ContractsHeader } from '@/components/Contracts/ContractsHeader';
import { ContractsStats } from '@/components/Contracts/ContractsStats';
import { ContractsTableOptimized } from '@/components/Contracts/ContractsTableOptimized';
import { useContracts } from '@/hooks/useContractsOptimized';

const ContractsOptimized = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const {
    contracts,
    loading,
    stats,
    totalCount,
    currentPage,
    totalPages,
    searchContracts,
    nextPage,
    prevPage,
    goToPage,
  } = useContracts();

  // Optimized search handler with debouncing
  const handleSearch = useCallback((searchTerm: string) => {
    searchContracts(searchTerm);
  }, [searchContracts]);

  // Filter handler
  const handleFilterChange = useCallback((status: string) => {
    searchContracts('', { status: status === 'all' ? undefined : status });
  }, [searchContracts]);

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
                title="إدارة العقود المحسنة"
                description="نظام محسن للأداء مع التحميل السريع والبحث المتقدم"
              />

              {/* Statistics Cards */}
              <ContractsStats stats={stats} />

              {/* Optimized Table with Pagination */}
              <ContractsTableOptimized
                contracts={contracts}
                loading={loading}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onPageChange={goToPage}
                onNextPage={nextPage}
                onPrevPage={prevPage}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ContractsOptimized;