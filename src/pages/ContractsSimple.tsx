
import { ContractsHeader } from '@/components/Contracts/ContractsHeader';
import { ContractsStats } from '@/components/Contracts/ContractsStats';
import { ContractsTable } from '@/components/Contracts/ContractsTable';
import { useContracts } from '@/hooks/useContracts';
import { AppLayout } from '@/components/Layout/AppLayout';

const ContractsSimple = () => {
  const { contracts, loading, stats } = useContracts();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <ContractsHeader 
          title="إدارة العقود"
          description="إدارة بسيطة للعقود وتتبع الحالات"
        />

        <ContractsStats stats={stats} />

        <ContractsTable contracts={contracts} loading={loading} />
      </div>
    </AppLayout>
  );
};

export default ContractsSimple;
