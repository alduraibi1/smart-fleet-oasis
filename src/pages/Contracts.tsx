
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddContractDialog from '@/components/Contracts/AddContractDialog';
import { ContractsHeader } from '@/components/Contracts/ContractsHeader';
import { ContractsStats } from '@/components/Contracts/ContractsStats';
import { ContractsTable } from '@/components/Contracts/ContractsTable';
import { useContracts } from '@/hooks/useContracts';

// التحسينات الجديدة
import VehicleReturnStats from '@/components/Contracts/VehicleReturnStats';
import ContractExpiryAlerts from '@/components/Contracts/ContractExpiryAlerts';
import CustomerArrearsAlerts from '@/components/Contracts/CustomerArrearsAlerts';

export default function Contracts() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { contracts, loading, stats } = useContracts();

  return (
    <div className="content-spacing">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">إدارة العقود</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            إدارة عقود الإيجار وعمليات إرجاع المركبات
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="btn-responsive flex-shrink-0">
          <Plus className="ml-2 h-4 w-4" />
          إضافة عقد جديد
        </Button>
      </div>

      {/* إحصائيات إرجاع المركبات */}
      <div className="dashboard-card mb-6">
        <VehicleReturnStats />
      </div>
      
      {/* تنبيهات انتهاء العقود */}
      <div className="dashboard-card mb-6">
        <ContractExpiryAlerts />
      </div>

      {/* تنبيهات العملاء المتعثرين */}
      <div className="dashboard-card mb-6">
        <CustomerArrearsAlerts />
      </div>

      {/* إحصائيات العقود العامة */}
      <div className="stats-container mb-6">
        <ContractsStats stats={stats} />
      </div>

      {/* جدول العقود */}
      <div className="dashboard-card">
        <Card>
          <CardHeader>
            <CardTitle>قائمة العقود</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractsTable contracts={contracts} loading={loading} />
          </CardContent>
        </Card>
      </div>

      <AddContractDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
}
