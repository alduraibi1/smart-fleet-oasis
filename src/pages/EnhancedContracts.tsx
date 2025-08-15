
import { AppLayout } from "@/components/Layout/AppLayout";
import { EnhancedContractManagement } from "@/components/Contracts/EnhancedContractManagement";

const EnhancedContracts = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">إدارة العقود المتقدمة</h1>
          <p className="text-muted-foreground mt-2">
            نظام شامل لإدارة العقود مع إمكانيات متقدمة
          </p>
        </div>
        <EnhancedContractManagement />
      </div>
    </AppLayout>
  );
};

export default EnhancedContracts;
