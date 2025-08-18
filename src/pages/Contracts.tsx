
import { AppLayout } from '@/components/Layout/AppLayout';
import { ContractsLayout } from '@/components/Contracts/ContractsLayout';

const Contracts = () => {
  return (
    <AppLayout>
      <div className="page-container">
        <div className="content-wrapper">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">العقود</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              إدارة عقود الإيجار والمدفوعات المالية
            </p>
          </div>

          {/* Main Content */}
          <ContractsLayout />
        </div>
      </div>
    </AppLayout>
  );
};

export default Contracts;
