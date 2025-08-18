
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة العقود</h1>
          <p className="text-muted-foreground">
            إدارة عقود الإيجار وعمليات إرجاع المركبات
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة عقد جديد
        </Button>
      </div>

      {/* إحصائيات إرجاع المركبات */}
      <VehicleReturnStats />
      
      {/* تنبيهات انتهاء العقود */}
      <ContractExpiryAlerts />

      {/* تنبيهات العملاء المتعثرين */}
      <CustomerArrearsAlerts />

      {/* إحصائيات العقود العامة */}
      <ContractsStats stats={stats} />

      {/* جدول العقود */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العقود</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractsTable contracts={contracts} loading={loading} />
        </CardContent>
      </Card>

      <AddContractDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
}
