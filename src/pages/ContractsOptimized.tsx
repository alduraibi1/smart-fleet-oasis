
import { useState, useCallback } from 'react';
import { ContractsHeader } from '@/components/Contracts/ContractsHeader';
import { ContractsStats } from '@/components/Contracts/ContractsStats';
import { ContractsTableOptimized } from '@/components/Contracts/ContractsTableOptimized';
import { useContracts } from '@/hooks/useContractsOptimized';
import { AppLayout } from '@/components/Layout/AppLayout';

const ContractsOptimized = () => {
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

  const handleSearch = useCallback((searchTerm: string) => {
    searchContracts(searchTerm);
  }, [searchContracts]);

  const handleFilterChange = useCallback((status: string) => {
    searchContracts('', { status: status === 'all' ? undefined : status });
  }, [searchContracts]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <ContractsHeader 
          title="إدارة العقود المحسنة"
          description="نظام محسن للأداء مع التحميل السريع والبحث المتقدم"
        />

        <ContractsStats stats={stats} />

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
    </AppLayout>
  );
};

export default ContractsOptimized;
